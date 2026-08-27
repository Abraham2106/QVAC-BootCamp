# Clase 1 — Airplane-Mode Intelligence

> **The Local-First AI Systems Masterclass** · Módulo 1 — Your First Local Token
> **Baseline técnico:** QVAC SDK v0.18.x / v0.18.1, verificado contra la documentación oficial y npm el 2026-08-25. Revisa las release notes antes de impartir esta clase.

---

## Introducción

Una aplicación de IA es **local** cuando genera texto con la red desactivada, después de haber provisionado el modelo. Esto requiere que los pesos estén en disco, que un runtime los cargue en memoria y que la inferencia ocurra en el mismo dispositivo — no basta con un modo offline ni con respuestas en caché.

Esta clase define los términos, la ruta de datos de QVAC y un procedimiento de verificación: el **Airplane-Mode Test**.

---

## Qué aprenderás

Al terminar esta clase podrás:

1. **Distinguir** modelo local, inferencia local, aplicación local-first y app que solo cachea respuestas.
2. **Trazar** la ruta de datos (aplicación → SDK → worker → modelo → tokens) en tu máquina.
3. **Provisionar** un asset con `downloadAsset()` y reutilizarlo desde caché.
4. **Ejecutar** inferencia offline después del aprovisionamiento.
5. **Clasificar** dependencias de una app de IA en locales vs. de red.
6. **Medir** tamaño de descarga, tiempo de carga, TTFT y tokens/segundo.

---

## Definición y contexto

Las aplicaciones de IA basadas en API envían el prompt a un servidor remoto, ejecutan el modelo allí y devuelven la respuesta. Ese patrón implica latencia de red, autenticación, costos por token y transferencia de datos fuera del dispositivo.

La IA local coloca los pesos en disco del dispositivo y ejecuta la inferencia en CPU/GPU local. **Local** es una afirmación de arquitectura que debe poder verificarse con evidencia, no una etiqueta de marketing.

---

## Términos

### Índice rápido

| Término | Definición breve | ¿Funciona sin red? |
|---|---|---|
| **Modelo local** | Pesos (archivos) en disco del dispositivo | Solo si además cargas e infieres localmente |
| **Inferencia local** | Computación que produce tokens en el dispositivo | Sí |
| **Aplicación local-first** | Funcionalidad núcleo diseñada para operar sin conectividad | Sí, por diseño |
| **App que cachea** | Descarga assets pero usa inferencia remota | No |

### Modelo local

**Definición:** Archivos de pesos del modelo almacenados en el disco del dispositivo.

**Uso:** Prerrequisito para inferencia offline. Sin estos archivos, no hay modelo que cargar.

**Nota:** Un modelo en disco sin runtime que lo cargue e infiera es solo un archivo grande (~0.6 GB para un 1B cuantizado Q4_0).

### Inferencia local

**Definición:** La computación que transforma un prompt en tokens ocurre en el mismo dispositivo donde vive la aplicación.

**Uso:** Criterio operativo para afirmar que una app es local. Se verifica con el Airplane-Mode Test.

**Resultado:** Tokens generados con la red desactivada, sin contactar servidores remotos.

### Aplicación local-first

**Definición:** Aplicación cuya funcionalidad principal está diseñada para funcionar sin conectividad después del aprovisionamiento inicial.

**Uso:** Declarar qué features requieren red (telemetría, actualizaciones) y cuáles no.

**Nota:** Local-first no implica que toda la app funcione sin red — solo la funcionalidad declarada como local.

### Entrenamiento, descarga, carga e inferencia

Estas cuatro fases son distintas:

```text
ENTRENAMIENTO   (una vez, datacenter, hace meses) → produce pesos → GGUF
DESCARGA        (una vez, requiere red) → copia pesos al disco (caché)
CARGA           (cada sesión) → lee pesos del disco hacia RAM/VRAM
INFERENCIA      (por cada prompt) → predice tokens con pesos en memoria
```

Solo la **descarga** requiere red. Carga e inferencia operan sobre archivos locales.

### Airplane-Mode Test

**Definición:** Procedimiento de verificación para confirmar inferencia local.

**Uso:** Ejecutar después de provisionar el modelo, con la red desactivada.

**Pasos:**

1. Con red, descarga/provisiona el modelo.
2. Cárgalo y ejecútalo una vez.
3. Cierra la aplicación.
4. Desconecta la red.
5. Reinicia la aplicación.
6. Carga el modelo desde caché.
7. Genera una respuesta nueva.

**Resultado:** Si el paso 7 produce texto, la inferencia es local. Si falla, hay una dependencia de red no documentada.

### TTFT y tokens/segundo

**Definición:** TTFT (time-to-first-token) mide el tiempo hasta el primer token. Tokens/segundo miden el ritmo de decodificación posterior.

**Uso:** Métricas separadas. TTFT incluye prefill (procesar el prompt); tok/s mide decode autoregresivo.

**Nota:** Los valores dependen del hardware. No existen números universales.

### Worker Bare

**Definición:** Runtime de inferencia de QVAC que carga modelos y produce tokens.

**Uso:** El SDK se comunica con el worker vía RPC (Node/Electron) o in-process (Bare).

**Propiedades:**
- **Lazy:** el worker arranca en la primera operación que lo necesita, no al importar.
- **Shared:** un solo worker se reutiliza entre operaciones.
- **Residente:** los modelos permanecen cargados hasta `unloadModel()`.

---

## Referencia QVAC

Funciones documentadas en v0.18.x para esta clase.

### `downloadAsset()`

**Definición:** Descarga un asset al caché sin cargarlo en memoria.

**Uso:** Preparar modelos para uso offline.

| Parámetro | Tipo | Descripción |
|---|---|---|
| `assetSrc` | `CatalogConstant \| string` | Constante de catálogo, URL o ruta `pear://` |
| `onProgress` | `(p) => void` | Callback con `percentage`, `downloaded`, `total` |

**Ejemplo:**

```ts
import { downloadAsset, LLAMA_3_2_1B_INST_Q4_0 } from "@qvac/sdk";

const op = downloadAsset({
  assetSrc: LLAMA_3_2_1B_INST_Q4_0,
  onProgress: (p) => console.log(`${p.percentage.toFixed(0)}%`),
});
const assetId = await op;
```

**Resultado:** Asset en caché local. Descargas reanudables por defecto.

**Nota:** `op.requestId` está disponible sincrónicamente para `cancel()`.

### `loadModel()`

**Definición:** Carga un modelo desde caché o fuente remota hacia memoria.

**Uso:** Obtener un `modelId` para `completion()`.

| Parámetro | Tipo | Descripción |
|---|---|---|
| `modelSrc` | `CatalogConstant \| string` | Origen del modelo |
| `modelConfig` | `{ ctx_size?: number, ... }` | Configuración del runtime |

**Ejemplo:**

```ts
const modelId = await loadModel({
  modelSrc: LLAMA_3_2_1B_INST_Q4_0,
  modelConfig: { ctx_size: 2048 },
});
```

**Resultado:** `modelId` string. Con constante de catálogo, valida checksum local y carga sin contactar el registro.

**Nota:** La instancia que descarga y la que carga deben usar el mismo `cacheDirectory`.

### `completion()`

**Definición:** Ejecuta inferencia sobre un modelo cargado y produce tokens.

**Uso:** Generar texto a partir de un historial de mensajes.

| Parámetro | Tipo | Descripción |
|---|---|---|
| `modelId` | `string` | ID del modelo cargado |
| `history` | `{ role, content }[]` | Mensajes de conversación |
| `stream` | `boolean` | Si `true`, emite eventos incrementales |

**Ejemplo:**

```ts
const run = completion({
  modelId,
  history: [{ role: "user", content: "Hola" }],
  stream: true,
});
for await (const event of run.events) {
  if (event.type === "contentDelta") process.stdout.write(event.text);
}
const final = await run.final;
```

**Resultado:** Eventos tipados (`contentDelta`, `completionStats`, `completionDone`) y promesa `final` con `.contentText`, `.stats`, `.stopReason`.

**Nota:** Preferir `events`/`final` sobre el legacy `tokenStream`.

### `unloadModel()` y `close()`

**Definición:** `unloadModel()` libera el modelo de memoria. `close()` cierra la infraestructura del SDK.

| Parámetro | Tipo | Descripción |
|---|---|---|
| `modelId` | `string` | Modelo a descargar |
| `clearStorage` | `boolean` | Si `true`, borra estado asociado |

**Ejemplo:**

```ts
await unloadModel({ modelId, clearStorage: false });
void close();
```

**Resultado:** Memoria liberada. En v0.18.x, descargar el último modelo cierra la conexión RPC automáticamente.

---

## Ejemplo completo

Flujo mínimo: provisionar → inferir → limpiar.

```ts
import {
  close, completion, downloadAsset, loadModel,
  LLAMA_3_2_1B_INST_Q4_0, unloadModel,
} from "@qvac/sdk";

// Fase red (requiere conexión)
await downloadAsset({ assetSrc: LLAMA_3_2_1B_INST_Q4_0 });

// Fase local (offline si la descarga completó)
const modelId = await loadModel({
  modelSrc: LLAMA_3_2_1B_INST_Q4_0,
  modelConfig: { ctx_size: 2048 },
});

const run = completion({
  modelId,
  history: [{ role: "user", content: "Di hola en una palabra." }],
  stream: true,
});
for await (const ev of run.events) {
  if (ev.type === "contentDelta") process.stdout.write(ev.text);
}

await unloadModel({ modelId, clearStorage: false });
void close();
```

Ejemplos ejecutables en [`examples/`](examples/).

---

## Antes de ejecutar

Escribe tus respuestas antes del lab:

1. Ejecutas el programa dos veces **con** red. ¿En cuál hay mayor tiempo de descarga?
2. Borras la caché y corres **sin** red. ¿Qué error esperas y en qué fase?
3. Provisionas con red, cortas la red y cargas. ¿Fallará `loadModel()`?
4. Durante generación offline, ¿algún byte del prompt cruza la red?

---

## Práctica guiada

Construye el programa mínimo del [lab](lab/):

1. Descarga un modelo de catálogo reportando progreso.
2. Cárgalo y realiza una completación.
3. Descarga el modelo (`unloadModel`) y cierra (`close`).
4. Desconecta la red.
5. Vuelve a ejecutar inferencia desde caché.
6. Registra evidencia con timestamps.

Entregable: **Airplane-Mode Proof** — evidencia de ambos ciclos (con y sin red) y explicación de la ruta de datos.

---

## Errores comunes

| Síntoma | Causa probable | Corrección |
|---|---|---|
| Falla offline en `loadModel()` | Asset no provisionado o caché corrupta | Verificar descarga completada y checksum |
| Descarga cada ejecución | Caché borrada o `cacheDirectory` distinto | Usar mismo directorio entre descarga y carga |
| App "local" pero falla offline | Inferencia remota con assets locales | Verificar que `completion()` no llame API externa |
| Modelo se recarga cada turno | Anti-patrón: `loadModel()` por mensaje | Cargar una vez, reutilizar `modelId` |

### Notas adicionales

1. **"Descargué el modelo, entonces mi app es local."** Descargar copia bytes. Local es donde ocurre la inferencia.
2. **"Offline = toda la app sin red."** Local-first aplica a la funcionalidad declarada como local.
3. **"El modelo se abre cada vez."** Cargar es una fase aparte; el modelo permanece residente hasta `unloadModel()`.
4. **"Si falla offline, el SDK no sirve."** Casi siempre indica dependencia mal clasificada (registro, telemetría, rutas absolutas).

---

## Medición

| Métrica | Cómo obtenerla | Unidad |
|---|---|---|
| Tamaño de descarga | `onProgress`: `downloaded`/`total` | bytes |
| Tiempo de carga | `performance.now()` alrededor de `loadModel()` | ms |
| TTFT | Primer `contentDelta` − envío del prompt | ms |
| Tokens/segundo | `run.final.stats.tokensPerSecond` | tok/s |
| Memoria pico | `process.memoryUsage().heapUsed` | bytes |

Corre cada medición al menos dos veces (carga fría vs. tibia). Los valores son de tu equipo.

---

## Resumen

- La IA local es una propiedad verificable: pesos en disco + runtime + inferencia en el mismo dispositivo.
- Solo la descarga requiere red; carga e inferencia son locales.
- El Airplane-Mode Test confirma inferencia local con evidencia reproducible.
- `downloadAsset()` → `loadModel()` → `completion()` → `unloadModel()` es el ciclo base.
- Métricas (TTFT, tok/s) dependen del hardware; mídelas en tu máquina.

**Siguiente clase:** anatomía del archivo GGUF — pesos, tokenización y cuantización.

---

## Fuentes

- QVAC — Introduction & How it works: https://docs.qvac.tether.io/introduction/ · https://docs.qvac.tether.io/about/how-it-works/
- QVAC — Download lifecycle: https://docs.qvac.tether.io/models/download-lifecycle/
- QVAC — Text generation: https://docs.qvac.tether.io/ai-capabilities/text-generation/
- QVAC — API Summary v0.18.x: https://docs.qvac.tether.io/reference/api/
- npm @qvac/sdk 0.18.1: https://www.npmjs.com/package/@qvac/sdk
