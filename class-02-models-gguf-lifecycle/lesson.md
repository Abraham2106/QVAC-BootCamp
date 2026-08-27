# Clase 2 — Models, GGUF and the QVAC Lifecycle

> **The Local-First AI Systems Masterclass** · Módulo 1 — Your First Local Token
> **Baseline técnico:** QVAC SDK v0.18.x / v0.18.1, verificado contra la documentación oficial y npm el 2026-08-25. Revisa las release notes antes de impartir esta clase.

---

## Introducción

La Clase 1 trató el modelo como una caja negra: `downloadAsset()` trajo ~0.6 GB y `loadModel()` lo puso en memoria. Esta clase abre ese paquete: qué contiene un archivo GGUF, cómo leer nombres de catálogo y cómo gestionar el ciclo de vida completo en QVAC.

Al terminar, un nombre como `QWEN3_4B_INST_Q4_K_M` será un contrato legible: familia, escala, ajuste y cuantización — evaluable contra tu hardware antes de descargar.

---

## Qué aprenderás

1. **Explicar** qué contiene un modelo: arquitectura, tensors, pesos, tokenizer, metadata y chat template.
2. **Explicar** el papel de GGUF como formato de inferencia, distinguiéndolo de un checkpoint de entrenamiento.
3. **Razonar** sobre cuantización: qué se gana en memoria/velocidad y qué se arriesga al bajar de F16 a Q4.
4. **Interpretar** nombres de catálogo: familia, escala, INST/base, variante de cuantización.
5. **Gestionar** el ciclo de vida: find → download → validate → load → infer → reuse → unload → close.
6. **Comparar** variantes con mediciones (disco, carga, memoria, TTFT, tok/s) y justificar una elección.

---

## Definición y contexto

Elegir el modelo equivocado produce una de dos fallas: la aplicación **no carga** (memoria insuficiente) o **decepciona** (calidad por debajo de la tarea). En local, la elección de modelo es decisión de arquitectura: determina memoria, latencia, almacenamiento y techo de calidad.

A diferencia de la nube — donde cambias un string y el proveedor absorbe el costo — en local tú provisionas el artefacto, reservas RAM/VRAM y validas la caché. El SDK v0.18.x no trae pesos embebidos: las constantes de catálogo son punteros al registro distribuido.

---

## Términos

### Índice rápido

| Término | Definición breve |
|---|---|
| **GGUF** | Formato binario autocontenido para inferencia (pesos + tokenizer + metadata) |
| **Cuantización** | Reducir bits por peso para ahorrar disco/memoria a costa posible de calidad |
| **Tokenizer** | Vocabulario y reglas que convierten texto en tokens |
| **Chat template** | Formato de conversación con que el modelo fue entrenado |
| **Ciclo de vida** | Secuencia find → download → validate → load → infer → reuse → unload → close |
| **Checkpoint** | Artefacto de entrenamiento; no es el mismo formato que GGUF |

### GGUF

**Definición:** Formato binario del ecosistema GGML/llama.cpp que empaqueta en un solo archivo tensors (con cuantización), tokenizer y metadata.

**Uso:** Formato que consume el motor de inferencia de texto de QVAC (`qvac-fabric-llm.cpp`). Cualquier modelo `.gguf` compatible con llama.cpp puede cargarse.

**Sintaxis / API:** No es una función del SDK; es el tipo de archivo referenciado por `modelSrc` o constantes de catálogo.

**Ejemplo:**

```text
Training checkpoint (PyTorch / Safetensors)
    ↓ conversión
GGUF (+ cuantización opcional)
    ↓
Inferencia local con loadModel()
```

**Resultado:** Un archivo validable por checksum, portable y listo para inferencia sin frameworks de entrenamiento.

**Nota:** GGUF ≠ checkpoint de entrenamiento. El checkpoint sirve para seguir entrenando; GGUF sirve para inferir.

### Cuantización

**Definición:** Re-expresar pesos entrenados en alta precisión (F32/BF16/F16) con menos bits por peso (Q8, Q6, Q5, Q4, esquemas mixtos como Q4_K_M).

**Uso:** Reducir almacenamiento, memoria y — típicamente — aumentar velocidad de inferencia en hardware modesto.

**Sintaxis / API:** Aparece en el nombre del modelo de catálogo (p. ej. `Q4_0`, `Q4_K_M`) y en metadata del GGUF.

**Ejemplo:** Órdenes de magnitud por mil millones de parámetros:

| Precisión | Bits/peso | Tamaño aprox. por 1B |
|---|---|---|
| F32 | 32 | ~4.0 GB |
| F16 | 16 | ~2.0 GB |
| Q8 | 8 | ~1.0 GB |
| Q4 | 4 | ~0.5–0.6 GB |

**Resultado:** Menos bits → menos disco y RAM → inferencia típicamente más rápida → posible pérdida de calidad (depende de la tarea).

**Nota:** Son heurísticas, no promesas. El tamaño final depende del esquema, metadata y embeddings. **Mide el archivo real** con `getModelInfo` o `fs.stat`.

### Tokenizer

**Definición:** Componente que define el vocabulario y las reglas para partir texto en tokens que el modelo procesa.

**Uso:** Sin el tokenizer correcto empaquetado en el GGUF, los pesos no reciben la misma representación con que fueron entrenados.

**Sintaxis / API:** Incluido en el GGUF; el runtime lo carga automáticamente con `loadModel()`.

**Ejemplo:** Prompt `"Hola"` → secuencia de IDs de token → tensors de entrada al modelo.

**Resultado:** Entrada alineada con el entrenamiento. Tokenizer incompatible produce salida basura aunque la carga "funcione".

**Nota:** Si un `.gguf` de terceros genera tokens incoherentes, sospecha primero tokenizer o chat template, no solo cuantización.

### Chat template

**Definición:** Formato exacto de conversación (roles, delimitadores, saltos) con que el modelo fue entrenado o ajustado.

**Uso:** `completion()` con `history: [{ role, content }]` aplica la template declarada en metadata del GGUF.

**Sintaxis / API:** Metadata del GGUF; no se configura manualmente salvo casos avanzados.

**Ejemplo:** Un modelo `INST` (instruction-tuned) espera mensajes con rol `user`/`assistant`; un modelo `base` es un completador crudo.

**Resultado:** Prompt bien formateado → respuestas coherentes. Template incorrecta → respuestas malas aunque el modelo sea capaz.

**Nota:** `INST` en el nombre de catálogo indica instruction-tuned; sin sufijo suele ser variante base.

### Ciclo de vida del modelo

**Definición:** Secuencia de operaciones que mueven un modelo desde el catálogo hasta inferencia y liberación de recursos.

**Uso:** Gestionar explícitamente cada fase evita recargas innecesarias, fugas de memoria y errores offline mal diagnosticados.

**Sintaxis / API:**

```text
find      → modelRegistryList / modelRegistrySearch / constantes
download  → downloadAsset() (reanudable, checksum)
validate  → automática contra tamaño/checksum del catálogo
load      → loadModel() → modelId (residente hasta unload)
infer     → completion() ×N (reutilizar modelId)
unload    → unloadModel({ modelId, clearStorage: false })
close     → close() (o automático al descargar el último en Node/Electron)
```

**Ejemplo:** Explorar catálogo → descargar si falta → cargar una vez → varias completaciones → descargar modelo → cerrar worker.

**Resultado:** Un worker compartido por aplicación con modelos residentes hasta `unloadModel()`. El GGUF en disco no computa; la instancia cargada sí.

**Nota:** Entre experimentos de diagnóstico, llama `unloadModel()` para no acumular modelos en el worker compartido.

### Anatomía del paquete "modelo"

| Pieza | Qué es | Por qué importa |
|---|---|---|
| **Arquitectura** | Diseño de la red (capas, atención) | Sin ella los pesos son números sueltos |
| **Tensors** | Arreglos multi-dimensionales de pesos | Unidad de almacenamiento y cómputo |
| **Pesos aprendidos** | Valores ajustados en entrenamiento | Mayor parte del tamaño del archivo |
| **Tokenizer** | Vocabulario + reglas de segmentación | Entrada debe coincidir con lo aprendido |
| **Metadata** | Contexto máximo, cuantización, versión | Lo que el runtime necesita para configurarse |
| **Chat template** | Formato de conversación | Prompt mal formateado degrada la salida |

### Leer nombres de catálogo

Decodifica `QWEN3_4B_INST_Q4_K_M`:

```text
QWEN3        → familia (arquitectura + linaje)
4B           → ~4 mil millones de parámetros
INST         → instruction-tuned (sigue instrucciones)
Q4_K_M       → 4 bits, esquema K-quants, variante M (mixta capa a capa)
```

**Uso:** Antes de descargar, estima memoria (escala × bits), tipo de tarea (INST vs base) y agresividad de compresión.

---

## Referencia QVAC

### Fuentes de modelos (v0.18.x)

1. **Registro distribuido** vía constantes del SDK (`LLAMA_3_2_1B_INST_Q4_0`, `QWEN3_4B_INST_Q4_K_M`…). Punteros al registro; el paquete npm no trae pesos.
2. **URL HTTP** directa (mirror u otro origen).
3. **Ruta local** (`modelSrc: "/opt/models/model.gguf"`, con `modelType` explícito). Sin checksum de catálogo; integridad es responsabilidad de tu app.

### Requisitos del host (documentados)

| Requisito | Valor | Consecuencia |
|---|---|---|
| RAM total | ≥ 2 GB (recomendado ≥ 4 GB) | Por debajo de 4 GB, la mayoría de LLMs fallan al cargar |
| RAM disponible al cargar | ≥ 2 GB | Verificado vía `os.availableMemory()` |
| Disco libre | ≥ 5 GB | Modelos multi-GB |
| GPU API | Metal (macOS) · Vulkan ≥ 1.4 (Windows/Linux) | En Windows, Vulkan se exige incluso para CPU-only |
| Node | ≥ 18 (preferible ≥ 20) | `engines` del CLI/SDK |

Validación: `qvac doctor` (con `--json` para CI).

### `modelRegistryList()`

**Definición:** Lista todas las entradas del registro distribuido de modelos QVAC.

**Uso:** Fase **find** del ciclo de vida. Requiere red.

| Parámetro | Tipo | Descripción |
|---|---|---|
| *(ninguno)* | — | Devuelve array de entradas de catálogo |

```ts
import { modelRegistryList } from "@qvac/sdk";

const entries = await modelRegistryList();
console.log(`Modelos en registro: ${entries.length}`);
```

**Resultado:** Array con `name`, `quantization`, `expectedSize`, etc. (campos según versión).

**Nota:** Si el registro no está disponible, la llamada falla; las constantes de catálogo siguen usables si el asset está en caché local.

### `modelRegistrySearch()`

**Definición:** Busca en el registro con filtros por tipo de modelo, engine y cuantización.

**Uso:** Filtrar variantes de una familia sin listar todo el catálogo.

| Parámetro | Tipo | Descripción |
|---|---|---|
| Filtros | objeto | Tipo, engine, cuantización (ver `.d.ts` de tu versión) |

```ts
import { modelRegistrySearch } from "@qvac/sdk";

const qwen = await modelRegistrySearch({ /* filtros según .d.ts */ });
```

**Nota:** Verifica nombres exactos de parámetros contra `node_modules/@qvac/sdk` — el API Summary es índice de alto nivel.

### `getModelInfo()`

**Definición:** Consulta metadata y estado de caché de un asset de catálogo.

**Uso:** Fase **find/validate** — saber si está cacheado, tamaño esperado y checksum antes de cargar.

| Parámetro | Tipo | Descripción |
|---|---|---|
| Identificador | `CatalogConstant` u objeto según `.d.ts` | Constante o ID del asset |

```ts
import { getModelInfo, LLAMA_3_2_1B_INST_Q4_0 } from "@qvac/sdk";

const info = await getModelInfo(LLAMA_3_2_1B_INST_Q4_0);
// info.isCached, info.expectedSize, info.cacheFiles (sha256Checksum)
```

**Resultado:** `isCached`, `expectedSize`, `cacheFiles` con checksum para validación local.

**Nota:** La firma exacta del parámetro varía entre versiones menores; verifica el `.d.ts` instalado.

### `getSystemResources()`

**Definición:** Reporta capacidades del host (memoria, backend gráfico).

**Uso:** Decidir qué escala/cuantización cabe; medir memoria antes/durante/después de `loadModel()`.

| Parámetro | Tipo | Descripción |
|---|---|---|
| `sample` | `boolean` | Si `true`, incluye uso actual además de totales |

```ts
import { getSystemResources } from "@qvac/sdk";

const res = await getSystemResources({ sample: true });
// res.capabilities.memory.totalBytes
```

### `downloadAsset()`

**Definición:** Descarga un asset al caché sin cargarlo en memoria.

**Uso:** Fase **download** — provisionar antes de uso offline.

| Parámetro | Tipo | Descripción |
|---|---|---|
| `assetSrc` | `CatalogConstant \| string` | Constante, URL o ruta |
| `onProgress` | `(p) => void` | Callback con `percentage`, `downloaded`, `total` |

```ts
import { downloadAsset, LLAMA_3_2_1B_INST_Q4_0 } from "@qvac/sdk";

await downloadAsset({
  assetSrc: LLAMA_3_2_1B_INST_Q4_0,
  onProgress: (p) => console.log(`${p.percentage.toFixed(0)}%`),
});
```

**Resultado:** Asset en caché. Descargas reanudables; validación automática contra checksum de catálogo al reutilizar.

### `loadModel()`

**Definición:** Carga un modelo desde caché o fuente remota hacia RAM/VRAM.

**Uso:** Fase **load** — despliega el GGUF en memoria ejecutable.

| Parámetro | Tipo | Descripción |
|---|---|---|
| `modelSrc` | `CatalogConstant \| string` | Origen del modelo |
| `modelConfig` | `{ ctx_size?: number, ... }` | Contexto y opciones del runtime |

```ts
const modelId = await loadModel({
  modelSrc: LLAMA_3_2_1B_INST_Q4_0,
  modelConfig: { ctx_size: 2048 },
});
```

**Resultado:** `modelId` string. El modelo permanece residente hasta `unloadModel()`.

**Nota:** Al cargar se reservan pesos (~tamaño del archivo) **y** contexto (`ctx_size`) para KV-cache. `ctx_size: 8192` puede fallar aunque los pesos "caben".

### `completion()`

**Definición:** Ejecuta inferencia sobre un modelo cargado.

**Uso:** Fase **infer** — reutiliza el mismo `modelId` para múltiples turnos.

| Parámetro | Tipo | Descripción |
|---|---|---|
| `modelId` | `string` | ID devuelto por `loadModel()` |
| `history` | `{ role, content }[]` | Mensajes de conversación |
| `stream` | `boolean` | Emite eventos incrementales |
| `generationParams` | `{ temp?, seed?, predict? }` | Parámetros de generación |

```ts
const run = completion({
  modelId,
  history: [{ role: "user", content: PROMPT }],
  stream: true,
  generationParams: { temp: 0, seed: 42, predict: 128 },
});
for await (const ev of run.events) {
  if (ev.type === "contentDelta") process.stdout.write(ev.text);
}
const final = await run.final;
```

**Resultado:** Tokens en stream; `final.stats.tokensPerSecond` para tok/s.

### `unloadModel()` y `close()`

**Definición:** Libera memoria del modelo (`unloadModel`) y cierra la infraestructura compartida (`close`).

**Uso:** Fases **unload** y **close** del ciclo de vida.

| Parámetro | Tipo | Descripción |
|---|---|---|
| `modelId` | `string` | Modelo a descargar de memoria |
| `clearStorage` | `boolean` | Si `true`, borra también el asset de disco |

```ts
await unloadModel({ modelId, clearStorage: false });
void close();
```

**Nota:** En v0.18.x, descargar el último modelo cierra la conexión RPC automáticamente en Node/Electron.

---

## Ejemplo completo

Comparar dos modelos con el mismo prompt determinista (temperatura 0, semilla fija):

```ts
import {
  close, completion, loadModel,
  LLAMA_3_2_1B_INST_Q4_0, QWEN3_600M_INST_Q4, unloadModel,
} from "@qvac/sdk";

const PROMPT = "Enumera tres ventajas de la inferencia local.";
const GEN = { temp: 0, seed: 42, predict: 128 };

for (const modelSrc of [QWEN3_600M_INST_Q4, LLAMA_3_2_1B_INST_Q4_0]) {
  const t0 = performance.now();
  const modelId = await loadModel({ modelSrc, modelConfig: { ctx_size: 2048 } });
  const loadMs = performance.now() - t0;

  const sentAt = performance.now();
  let ttft: number | null = null;
  const run = completion({
    modelId,
    history: [{ role: "user", content: PROMPT }],
    stream: true,
    generationParams: GEN,
  });
  for await (const ev of run.events) {
    if (ev.type === "contentDelta" && ttft === null) ttft = performance.now() - sentAt;
  }
  const final = await run.final;
  console.log({ loadMs, ttft, tps: final.stats?.tokensPerSecond });
  await unloadModel({ modelId, clearStorage: false });
}
void close();
```

Ejecutables completos en [`examples/`](examples/).

---

## Antes de ejecutar

Escribe tus respuestas antes del lab:

1. `QWEN3_600M_INST_Q4` vs `LLAMA_3_2_1B_INST_Q4_0`: ¿cuál cargará más rápido y cuál generará con más tok/s? ¿Por qué?
2. El mismo modelo cargado dos veces (frío vs tibio): ¿qué fase cambia y cuál no?
3. Pides `ctx_size: 32768` en una máquina con 8 GB libres: ¿dónde falla — descarga, carga o primera inferencia?
4. Registro caído pero caché válida: ¿funciona `loadModel()` con constante de catálogo? ¿Y `modelRegistryList()`?

---

## Práctica guiada

Construye **Model Explorer** (utilidad del currículo §4.10):

1. Lista o busca modelos del registro (con manejo de registro no disponible).
2. Muestra metadata y estado de caché del modelo elegido (`getModelInfo`).
3. Mide el tiempo de carga (`performance.now()` alrededor de `loadModel()`).
4. Ejecuta una generación corta determinista (`completion` con `temp: 0`, `seed` fija).
5. Descarga el modelo (`unloadModel`).
6. Repite con una segunda variante.
7. Imprime la tabla comparativa final.

Guía completa en [`lab/README.md`](lab/README.md) con starter y auto-verificación.

**Regla de seguridad:** descarga el modelo entre intentos de diagnóstico (`unloadModel`) para no tumbar el worker compartido.

---

## Errores comunes

| Síntoma | Causa probable | Corrección |
|---|---|---|
| Modelo no carga en laptop de 8 GB con 7B F16 | Memoria insuficiente para pesos sin cuantizar | Probar Q4 o escala menor; medir con `getSystemResources` |
| Carga OK pero falla al inferir con `ctx_size` alto | KV-cache excede RAM disponible | Reducir `ctx_size` o liberar memoria de la app |
| `modelRegistryList()` falla offline | Registro requiere red | Usar constantes + caché local; manejar error en UI |
| `loadModel()` OK offline con constante | Caché validada por checksum local | Normal: el registro no es necesario si el asset está cacheado |
| Tokens basura con `.gguf` de terceros | Tokenizer o chat template incompatible | Verificar familia, template y origen del archivo |
| Dos modelos residentes, RAM agotada | No llamaste `unloadModel` entre cargas | Descargar cada modelo antes del siguiente |
| "Q4 es 4× más inteligente porque es más rápido" | Confundir velocidad con calidad | Medir calidad con tu tarea; velocidad ≠ fidelidad |
| SDK npm "incluye" modelos | Constantes son punteros, no pesos | Descargar con `downloadAsset` o dejar que `loadModel` provisione |

---

## Medición

| Métrica | Cómo obtenerla | Unidad | Interpretación |
|---|---|---|---|
| Tamaño en disco | `getModelInfo` (`expectedSize`) o `fs.stat` | bytes / MB | Presupuesto de almacenamiento |
| Tiempo de carga | `performance.now()` alrededor de `loadModel()` | ms | Carga fría vs tibio (caché en disco) |
| Memoria observable | `getSystemResources({ sample: true })` antes/durante/después | bytes / GB | ¿Cabe con margen para contexto? |
| TTFT | Primer `contentDelta` − envío del prompt | ms | Latencia percibida al usuario |
| Tokens/segundo | `run.final.stats.tokensPerSecond` | tok/s | Fluidez de generación |

Comparación justa: mismo prompt, `temp: 0`, misma semilla, mismo backend, `unloadModel` entre modelos.

---

## Resumen

- Un "modelo" es un paquete: arquitectura + pesos + tokenizer + metadata + chat template.
- GGUF es el formato de inferencia autocontenido; no es un checkpoint de entrenamiento.
- Cuantización negocia disco/memoria/velocidad contra calidad; la degradación es tarea-dependiente.
- El nombre de catálogo (`QWEN3_4B_INST_Q4_K_M`) es un contrato legible antes de descargar.
- El ciclo QVAC: find → download → validate → load → infer → reuse → unload → close.
- Las constantes del SDK son punteros al registro; los pesos se descargan y validan por separado.
- La elección de modelo requiere mediciones en tu hardware y tu tarea, no solo el catálogo.

**Siguiente clase:** qué ocurre dentro de la inferencia — tokenización, prefill, decodificación y KV-cache.

---

## Fuentes

- QVAC — Download lifecycle: https://docs.qvac.tether.io/models/download-lifecycle/
- QVAC — Text generation: https://docs.qvac.tether.io/ai-capabilities/text-generation/
- QVAC — System requirements: https://docs.qvac.tether.io/system-requirements/
- QVAC — API Summary v0.18.x: https://docs.qvac.tether.io/reference/api/
- npm @qvac/sdk 0.18.1
- llama.cpp / GGUF: https://github.com/ggml-org/llama.cpp
- Currículo canónico: `QVAC_Course_Expanded_Learning_Edition.md`, Cap. 4 §4.1–4.10
