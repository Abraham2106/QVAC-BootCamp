# Clase 2 — Models, GGUF and the QVAC Lifecycle

> **The Local-First AI Systems Masterclass** · Módulo 1 — Your First Local Token
> **Baseline técnico:** QVAC SDK v0.18.x / v0.18.1, verificado contra la documentación oficial y npm el 2026-08-25. Revisa las release notes antes de impartir esta clase.

---

## Pregunta esencial

> **¿Qué estamos cargando realmente cuando "cargamos un modelo"?**

---

## Resultados de aprendizaje

Al terminar esta clase puedes:

1. **Explicar** qué contiene un modelo: arquitectura, tensors, pesos aprendidos, tokenizer, metadata y chat template.
2. **Explicar** el papel de GGUF como formato de inferencia, distinguiéndolo de un checkpoint de entrenamiento.
3. **Razonar** sobre cuantización: qué se gana en memoria/velocidad y qué se arriesga en calidad al bajar de F16 a Q4.
4. **Interpretar** nombres de modelos de catálogo: familia, escala de parámetros, INST/base, variante de cuantización.
5. **Gestionar** el ciclo de vida completo: find → download → validate → load → infer → reuse → unload → close.
6. **Comparar** variantes con mediciones propias (disco, carga, memoria observable, TTFT, tok/s) y **justificar** una elección con la matriz de decisión.

---

## Por qué importa esto

La Clase 1 trató el modelo como una caja negra: `downloadAsset()` trajo ~0.6 GB y `loadModel()`
los puso en memoria. Funcionó — pero quedaron preguntas sin responder. ¿Por qué 0.6 GB y no 6?
¿Qué diferencia hay entre `Q4_0` y `Q4_K_M`? ¿Por qué un 7B no cabe en tu laptop de 8 GB?
¿Qué significa `INST`?

Estas preguntas no son académicas. Elegir el modelo equivocado produce una de dos fallas
garantizadas: la aplicación que **no carga** (memoria insuficiente) o la aplicación que
**decepciona** (calidad por debajo de la tarea). Y a diferencia de la nube — donde cambias
un string de modelo y el proveedor absorbe el costo — en local la elección de modelo ES la
decisión de arquitectura: determina memoria, latencia, almacenamiento y el techo de calidad
de todo tu producto.

Hoy abrimos la caja negra. Al cerrarla, un nombre como `QWEN3_4B_INST_Q4_K_M` dejará de ser
ruido: será un contrato que puedes leer, evaluar contra tu hardware y defender.

---

## Concepto

### Anatomía: qué hay dentro de un "modelo"

Cuando decimos "un modelo" hablamos de un paquete con varias piezas distintas:

| Pieza | Qué es | Por qué importa |
|---|---|---|
| **Arquitectura** | El diseño de la red (capas, atención, dimensiones) | Define CÓMO se computa; sin ella los pesos son números sueltos |
| **Tensors** | Los arreglos multi-dimensionales que organizan los números | La unidad de almacenamiento y cómputo |
| **Pesos aprendidos** | Los valores numéricos ajustados durante el entrenamiento | El "conocimiento"; la mayor parte del tamaño del archivo |
| **Tokenizer** | El vocabulario + reglas para partir texto en tokens | Sin el tokenizer correcto, los pesos son inútiles: la entrada no coincide con lo aprendido |
| **Metadata** | Contexto máximo, chat template, cuantización, versión | Lo que el runtime necesita para usar el resto correctamente |
| **Chat template** | El formato exacto de conversación con que fue entrenado | Prompt mal formateado = respuestas malas aunque el modelo sea bueno |

En sistemas multimodales existen piezas adicionales (adapters, projection models) — quedan
apuntadas para la clase correspondiente; hoy nos enfocamos en LLMs de texto.

### Checkpoint ≠ formato de inferencia

El archivo que descargaste NO es el checkpoint de entrenamiento. Son formatos distintos para
etapas distintas:

```text
Training checkpoint
    ↓ (PyTorch / Safetensors — pensado para seguir entrenando)
Conversión
    ↓
GGUF
    ↓ (cuantización opcional)
Inferencia local
```

### GGUF: el formato de inferencia del ecosistema GGML/llama.cpp

**GGUF** es un formato binario que empaqueta en UN solo archivo todo lo que el runtime de
inferencia necesita: los tensors (con sus cuantizaciones, posiblemente mixtas), el tokenizer,
y metadata rica (arquitectura, contexto, template). El motor de inferencia de texto de QVAC
(`qvac-fabric-llm.cpp`) consume exactamente este formato: cualquier modelo
`llama.cpp`-compatible en `.gguf` puede cargarse.

La propiedad clave para local-first: **un GGUF es autocontenido y portable**. Un archivo,
validado por checksum, listo para correr sin instalar frameworks de entrenamiento ni
dependencias de runtime adicionales.

### Cuantización: la negociación central

Los pesos se entrenan en precisión alta (F32/BF16/F16 — 32 o 16 bits por peso). La
**cuantización** los re-expresa en menos bits: Q8 (8), Q6, Q5, Q4 (4), o esquemas mixtos
(como Q4_K_M, que cuantiza distinto las capas sensibles).

La regla de negociación:

```text
menos bits por peso
   ↓
menos almacenamiento + menos memoria + inferencia típicamente más rápida
   ↓
posible pérdida de calidad (tarea-dependiente)
```

Números de referencia para calibrar intuición (por mil millones de parámetros):

| Precisión | Bits/peso | Tamaño aprox. por 1B |
|---|---|---|
| F32 | 32 | ~4.0 GB |
| F16 | 16 | ~2.0 GB |
| Q8 | 8 | ~1.0 GB |
| Q4 | 4 | ~0.5–0.6 GB |

Estos son órdenes de magnitud para razonar, no promesas: el tamaño final depende del esquema
exacto, la metadata y los embeddings del vocabulario. **Siempre mide el archivo real.**

### Leer nombres de modelo: el contrato público

Decodifica `QWEN3_4B_INST_Q4_K_M` pieza por pieza:

```text
QWEN3        → familia (arquitectura + linaje de entrenamiento)
4B           → escala: ~4 mil millones de parámetros
INST         → instruction-tuned (sigue instrucciones; sin esto sería "base", un completador crudo)
Q4_K_M       → cuantización: 4 bits, esquema K-quants, variante M (mixta, capa a capa)
```

Con esta gramática, el nombre te dice ANTES de descargar: cuánta memoria necesitarás
(escala × bits), qué tipo de tarea espera (INST), y qué tan agresiva fue la compresión.

### La matriz de decisión

Elegir modelo es multi-objetivo. El currículo canónico lo resume en:

```text
calidad × ajuste a la tarea × memoria × almacenamiento
        × latencia × contexto × hardware × modalidad
```

No existe "el mejor modelo": existe el mejor modelo PARA una tarea EN un hardware CON una
restricción de privacidad. La matriz se evalúa con evidencia — que es exactamente lo que
medirás hoy.

---

## Modelo mental

Dos metáforas para no confundir nunca más las fases:

- **El GGUF es el contenedor de envío; el modelo cargado es la máquina desplegada.**
  El archivo en disco no "hace" nada: es un paquete sellado. `loadModel()` lo despliega en
  RAM/VRAM — ahí sí se convierte en algo que computa.
- **Un worker, muchos modelos.** QVAC usa un worker compartido por aplicación (no uno por
  modelo). Los modelos cargados permanecen disponibles hasta que los descargas. El ciclo
  canónico:

```text
find → download → validate → load → infer → reuse → unload → close
```

---

## Inside QVAC

### De dónde vienen los modelos (tres fuentes DOCUMENTADAS)

1. **Registro distribuido de QVAC** vía constantes del SDK (`LLAMA_3_2_1B_INST_Q4_0`,
   `QWEN3_4B_INST_Q4_K_M`…). Las constantes son **punteros al registro** — el paquete npm NO
   trae pesos embebidos.
2. **URL HTTP** directa (p. ej. un mirror).
3. **Ruta local** (`modelSrc: "/opt/models/model.gguf"`, con `modelType` explícito). En este
   caso la validación contra checksum de catálogo no aplica: la integridad es responsabilidad
   de tu aplicación.

### Explorar el registro y el estado de caché

```ts
import {
  getModelInfo, getSystemResources,
  modelRegistryList, modelRegistrySearch,
} from "@qvac/sdk";

// Todo el catálogo, o búsqueda filtrada
const all = await modelRegistryList();
const qwen4b = await modelRegistrySearch({ /* filtros por tipo/engine/cuantización */ });

// Estado de un asset: ¿está en caché? ¿de qué tamaño?
const info = await getModelInfo({ /* parámetros según .d.ts de tu versión */ });

// Qué puede tu máquina AHORA
const res = await getSystemResources({ sample: true });
// res.capabilities.memory.totalBytes → total; sample → uso actual
```

> Nota honesta de versiones: `modelRegistrySearch` acepta filtros por tipo de modelo, engine
> y cuantización; `getModelInfo` expone `isCached`, `expectedSize`, `cacheFiles` con checksum.
> Verifica los nombres exactos de parámetros contra el `.d.ts` de tu versión instalada —
> la página API Summary es un índice de alto nivel.

### Requisitos duros del host (DOCUMENTADOS en system-requirements)

| Requisito | Valor | Consecuencia |
|---|---|---|
| RAM total | ≥ 2 GB (recomendado ≥ 4 GB) | "Por debajo de 4 GB, la mayoría de los LLMs fallan al cargar" |
| RAM disponible al cargar | ≥ 2 GB | Verificado vía `os.availableMemory()` |
| Disco libre | ≥ 5 GB | Los modelos son multi-GB |
| GPU API | Metal (macOS) · Vulkan ≥ 1.4 (Windows/Linux) | En Windows, Vulkan se exige incluso para CPU-only |
| Node | ≥ 18 (preferible ≥ 20) | `engines` del CLI/SDK |

Y la herramienta de validación: **`qvac doctor`** (con `--json` para CI) chequea el subset
machine-readable de todo esto.

### El ciclo de vida, función por función

```text
find      → modelRegistryList / modelRegistrySearch / constantes
download  → downloadAsset() (reanudable, requestId, checksum)
validate  → automática contra tamaño/checksum del catálogo al reutilizar caché
load      → loadModel() → modelId (residente hasta unload)
infer     → completion() ×N (el modelo se reutiliza; cargar 1 vez)
unload    → unloadModel({ modelId, clearStorage: false }) → libera memoria
close     → close() explícito (o automático al descargar el último, en Node/Electron)
```

---

## Under the Hood

- **Al cargar se reservan dos cosas**: los pesos (tamaño ≈ el del archivo, ya cuantizados) y
  la reserva de contexto (`ctx_size`), que crece con la ventana y alimenta el KV-cache. Por
  eso `ctx_size: 8192` en una máquina justa falla aunque los pesos "caben".
- **Por qué Q4 cabe donde F16 no**: mismo número de pesos, 4× menos bits por peso. La
  memoria que ahorras es la que decide si tu app corre en la laptop del usuario o no.
- **El backend importa**: Metal en macOS (siempre presente), Vulkan ≥ 1.4 en Windows/Linux.
  Sin Vulkan en Windows ni siquiera hay fallback CPU — es requisito del runtime.
- **La calidad de Q4 es tarea-dependiente**: para chat general la degradación suele ser
  pequeña; para razonamiento fino o código delicado puede notarse. No hay respuesta universal:
  se mide con TU tarea (y el benchmark informal del lab: comparación a ciegas).

---

## Worked Example

Comparar dos modelos con el MISMO prompt determinista (temperatura 0, semilla fija):

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
  const run = completion({ modelId,
    history: [{ role: "user", content: PROMPT }], stream: true,
    generationParams: GEN });
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

## Predict

Escribe tus respuestas antes de ejecutar:

1. `QWEN3_600M_INST_Q4` vs `LLAMA_3_2_1B_INST_Q4_0`: ¿cuál esperas que cargue más rápido y cuál genere con más tok/s? ¿Por qué?
2. El mismo modelo cargado dos veces (frío vs tibio): ¿qué fase cambia y cuál no?
3. Pides `ctx_size: 32768` en una máquina con 8 GB libres: ¿dónde falla — descarga, carga o primera inferencia?
4. Registro caído pero caché válida: ¿funciona `loadModel()` con constante de catálogo? ¿Y `modelRegistryList()`?

---

## Build — Model Explorer

Construye la utilidad del currículo (§4.10) que:

- lista/busca modelos del registro (con manejo de registro no disponible);
- muestra metadata y estado de caché del modelo elegido;
- mide el tiempo de carga;
- ejecuta una generación corta determinista;
- descarga el modelo (`unloadModel`);
- repite con una segunda variante;
- imprime la tabla comparativa final.

Guía completa en [`lab/`](lab/README.md) con starter y auto-verificación.

---

## Break It

Predice primero. Regla de seguridad: **descarga el modelo entre intentos**
(`unloadModel`) para no tumbar la infraestructura compartida del worker.

| Escenario controlado | Predicción antes |
|---|---|
| Cargar un modelo mayor a la RAM disponible | ¿en qué fase muere? ¿qué mensaje? |
| `ctx_size: 32768` con memoria justa | ¿carga y falla al inferir, o falla al cargar? |
| Registro no disponible + constante SIN caché | ¿se distingue del error con caché válida? |
| Ruta local a un archivo truncado/corrupto | ¿quién valida aquí? (pista: no hay checksum de catálogo) |

---

## Measure It

Tu tabla de comparación (frío y tibio por modelo):

| Métrica | Cómo |
|---|---|
| Tamaño en disco | `getModelInfo` (expected/actual) o `fs.stat` del asset |
| Tiempo de carga | `performance.now()` alrededor de `loadModel()` |
| Memoria observable | `getSystemResources({ sample: true })` antes/durante/después |
| TTFT | primer `contentDelta` − envío del prompt |
| Tokens/segundo | `run.final.stats.tokensPerSecond` |

---

## Misconcepciones comunes

1. **"Más parámetros siempre es mejor."** Un 7B mal ajustado a la tarea pierde contra un 1B
   bien elegido; y en hardware modesto el 7B directamente no carga. La matriz es multi-factor.
2. **"Q4 destruye la calidad."** La degradación existe pero es tarea-dependiente y suele ser
   pequeña para chat general. La comparación honesta se hace a ciegas y con TU caso de uso.
3. **"El archivo GGUF se ejecuta solo."** Es un paquete de datos + metadata. Sin runtime
   (worker QVAC/llama.cpp), tokenizer y memoria, no es nada.
4. **"El SDK de npm trae los modelos incluidos."** Las constantes son punteros al registro
   distribuido; los pesos se descargan aparte, se validan y se cachean.

---

## Conexiones de arquitectura

- **Clase 1:** la caja negra de hoy era el asset de ayer; el Airplane-Mode Test sigue siendo
  tu verificador (ahora con dos modelos).
- **Clase 3:** el TTFT y tok/s que mediste se descomponen en tokenización, prefill y
  decodificación con KV-cache — la mecánica interna de la inferencia.
- **Clase 10:** la matriz de decisión de hoy se formaliza como Architecture Decision Record.

---

## Checkpoint

1. *(Recall)* ¿Qué significa `INST` y `Q4_K_M` en `QWEN3_4B_INST_Q4_K_M`?
2. *(Explicación)* ¿Por qué un checkpoint de entrenamiento y un GGUF no son lo mismo? Nombra dos diferencias.
3. *(Explicación)* Tu compañero dice: "bajé el modelo a Q4 y ahora es 4× más inteligente porque es más rápido". ¿Qué dos errores hay en esa frase?
4. *(Aplicación)* Máquina con 6 GB libres, tarea: chat general offline. ¿Qué escala y cuantización probarías primero y por qué?
5. *(Aplicación/Predicción)* `loadModel()` de un 7B Q4 (~4 GB) con 3 GB disponibles: ¿en qué fase falla y qué mensaje esperas?
6. *(Diagnóstico)* `modelRegistryList()` falla con error de red pero tu app sigue cargando modelos por constante. ¿Cómo es posible? Explica el flujo.
7. *(Diagnóstico)* Cargaste por ruta local un `.gguf` que otro equipo te pasó y produce tokens basura. ¿Qué pieza de la anatomía sospechas primero y por qué?
8. *(Evaluación/Diseño)* Con TU máquina medida y la tarea "resumir documentos personales offline", completa la matriz de decisión y defiende tu elección en 5 líneas.

---

## Takeaway

> "Cargar un modelo" = desplegar a memoria un GGUF validado: pesos cuantizados + tokenizer +
> metadata, elegidos con una matriz de decisión y confirmados con mediciones.
> El nombre del modelo es un contrato; tu hardware es la contraparte. Lee ambos antes de prometer nada.

**Siguiente clase:** qué ocurre DENTRO de la inferencia — tokens, sampling, KV-cache y por qué
el TTFT y el tok/s se comportan como se comportan.

---

## Sources Used

- QVAC — Download lifecycle: https://docs.qvac.tether.io/models/download-lifecycle/
- QVAC — Text generation: https://docs.qvac.tether.io/ai-capabilities/text-generation/
- QVAC — System requirements (RAM/disco/Vulkan, `qvac doctor`): https://docs.qvac.tether.io/system-requirements/
- QVAC — API Summary v0.18.x · Release Notes v0.18.x
- npm @qvac/sdk 0.18.1 · llama.cpp/GGUF: https://github.com/ggml-org/llama.cpp
- Currículo canónico: `QVAC_Course_Expanded_Learning_Edition.md`, Cap. 4 §4.1–4.10
