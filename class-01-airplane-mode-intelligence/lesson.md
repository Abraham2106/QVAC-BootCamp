# Clase 1 — Airplane-Mode Intelligence

> **The Local-First AI Systems Masterclass** · Módulo 1 — Your First Local Token
> **Baseline técnico:** QVAC SDK v0.18.x / v0.18.1, verificado contra la documentación oficial y npm el 2026-08-25. Revisa las release notes antes de impartir esta clase.

---

## Pregunta esencial

> **¿Qué significa *realmente* que una aplicación de IA sea local?**

No "que tiene un modo offline", no "que guarda respuestas en caché". ¿Qué tiene que estar ocurriendo — y dónde — para que un modelo genere texto con el cable de red desconectado?

---

## Resultados de aprendizaje

Al terminar esta clase puedes:

1. **Distinguir** entre modelo local, inferencia local, aplicación local-first y una app que solo cachea respuestas.
2. **Trazar** la ruta de datos de QVAC (aplicación → SDK → worker → modelo → tokens) y ubicar cada etapa en tu máquina.
3. **Provisionar** un asset de catálogo con `downloadAsset()` y reutilizarlo desde caché.
4. **Ejecutar** una inferencia completamente offline después del aprovisionamiento.
5. **Clasificar** las dependencias de una app de IA en locales vs. de red.
6. **Medir** tamaño de descarga, tiempo de carga, latencia hasta el primer token (TTFT) y tokens/segundo.

---

## Por qué importa esto

Casi todas las aplicaciones de IA que has usado dependen de un patrón idéntico: tu texto viaja por Internet hacia una API, una máquina remota ejecuta el modelo, y la respuesta regresa por el mismo camino. Ese patrón implica autenticación, latencia de red, costos por token, límites de tasa y una pregunta incómoda: **¿dónde están tus datos?**

La IA local invierte ese patrón: los pesos del modelo viven en tu disco, la inferencia ocurre en tu CPU/GPU y ningún byte de tu prompt sale del equipo. Pero "local" es una afirmación de arquitectura, no una etiqueta de marketing — y como toda afirmación de arquitectura, debe poder **demostrarse**.

Esta clase te da la demostración más pura que existe: el *Airplane-Mode Test*. Si tu aplicación genera tokens con la red desactivada, era local. Si falla, tenías una dependencia oculta.

---

## Concepto

### Las cuatro cosas que la gente confunde con "IA local"

| Término | Qué significa | ¿Sobrevive sin red? |
|---|---|---|
| **Modelo local** | Los pesos (los archivos) están en el disco del dispositivo | Solo si además cargas e infieres localmente |
| **Inferencia local** | La computación que produce tokens ocurre en el dispositivo | Sí — es la definición operativa |
| **Aplicación local-first** | Diseñada para que su funcionalidad núcleo sobreviva sin conectividad | Sí, por diseño |
| **App que cachea** | Descarga assets o respuestas pero sigue dependiendo de un servicio remoto de inferencia | No |

Un **modelo local** sin inferencia local es solo un archivo grande. La combinación completa — pesos en disco + runtime + memoria + pipeline de salida en la misma máquina — es lo que hace posible el modo avión.

### Entrenamiento ≠ descarga ≠ carga ≠ inferencia

Estas cuatro fases se confunden constantemente. Sepáralas con precisión:

```text
ENTRENAMIENTO   (una vez, en un datacenter, hace meses)
   produce los pesos → GGUF
DESCARGA        (una vez, cuando hay red)
   copia los pesos a tu disco (caché)
CARGA           (cada sesión)
   lee los pesos del disco hacia RAM/VRAM
INFERENCIA      (por cada prompt)
   predice tokens usando los pesos ya en memoria
```

Solo la **descarga** requiere red. Carga e inferencia son operaciones puramente locales sobre archivos que ya tienes. Esta distinción es la clave de todo el curso: si aprovisionas primero, todo lo demás puede ocurrir en un avión.

### El Airplane-Mode Test

Una definición práctica de IA local debe ser **testeable**:

1. Con red disponible, descarga/provisiona el modelo.
2. Cárgalo y ejecútalo una vez (verifica que funciona).
3. Cierra la aplicación.
4. **Desconecta la red del dispositivo.**
5. Reinicia la aplicación.
6. Carga el modelo ya provisionado.
7. Genera una nueva respuesta.

Si el paso 7 produce texto, acabas de demostrar inferencia 100% local. Este test será tu herramienta de verificación durante todo el bootcamp — lo volverás a usar en RAG, voz y sistemas distribuidos.

---

## Modelo mental

Antes de tocar código, fija este mapa mental de QVAC:

```text
┌─────────────────────────────────────────────────┐
│ TU PROCESO                                      │
│                                                 │
│  Tu aplicación (JS/TS)                          │
│        │  llamadas a funciones                  │
│        ▼                                        │
│  QVAC SDK (cliente)                             │
│        │  RPC                                   │
│        ▼                                        │
│  Worker Bare (runtime de inferencia)            │
│        │  carga                                 │
│        ▼                                        │
│  Modelo en memoria (pesos desde disco/caché)    │
└─────────────────────────────────────────────────┘
         │ tokens / eventos
         ▼
   Tu aplicación otra vez
```

Dos propiedades del worker que debes retener:

- **Perezoso (*lazy*):** fuera del runtime Bare, el SDK arranca el worker Bare solo en la primera operación que lo necesita — no al importar.
- **Compartido (*shared*):** el mismo worker se reutiliza para operaciones subsecuentes. No pagas el arranque dos veces. En Bare mismo, las peticiones corren in-process.

Y una propiedad del ciclo de vida que sorprende a todos:

- Los modelos pueden **permanecer cargados** y reutilizarse hasta que tú los descargas explícitamente. Cargar es caro; hacerlo una vez y reutilizar es la estrategia normal.

---

## Inside QVAC

Las cuatro funciones que gobiernan esta clase (todas DOCUMENTADAS en v0.18.x):

### `downloadAsset()` — provisionar sin cargar

```ts
import { downloadAsset, LLAMA_3_2_1B_INST_Q4_0 } from "@qvac/sdk";

const op = downloadAsset({
  assetSrc: LLAMA_3_2_1B_INST_Q4_0,
  onProgress: (p) => console.log(`${p.percentage.toFixed(0)}%`),
});
// op.requestId está disponible sincrónicamente (para pausar con cancel()).
const assetId = await op;
```

- Descarga el asset **sin** cargarlo en memoria. Es la forma explícita de preparar offline.
- Acepta constantes de catálogo (`LLAMA_3_2_1B_INST_Q4_0`), URLs o rutas `pear://`.
- Las descargas son **reanudables por defecto**: los parciales van al disco y la próxima llamada continúa donde quedó.

### `loadModel()` — del caché a la memoria

```ts
import { loadModel, LLAMA_3_2_1B_INST_Q4_0 } from "@qvac/sdk";

const modelId = await loadModel({
  modelSrc: LLAMA_3_2_1B_INST_Q4_0,
  modelConfig: { ctx_size: 2048 },
});
```

Cuando `modelSrc` es una constante de catálogo, `loadModel()` **consulta primero el caché configurado**, valida los archivos contra el tamaño y checksum empaquetados en el catálogo, y si son válidos **carga sin contactar el registro**. Esa validación checksum es lo que permite confiar en la copia local tanto como en la original.

Detalle crítico: la instancia del SDK que descarga y la que carga deben usar el mismo `cacheDirectory`.

### `completion()` — producir tokens

Superficie canónica (v0.18.x): un iterable `events` + una promesa agregada `final`.

```ts
const run = completion({
  modelId,
  history: [{ role: "user", content: "Hola" }],
  stream: true,
});
for await (const event of run.events) {
  if (event.type === "contentDelta") process.stdout.write(event.text);
}
const final = await run.final; // .contentText, .stats, .stopReason...
```

Eventos tipados: `contentDelta`, `thinkingDelta`, `toolCall`, `toolError`, `completionStats`, `completionDone`, `rawDelta`. El campo legacy `tokenStream` sigue funcionando, pero el código nuevo debe preferir `events`/`final`.

### `unloadModel()` y cierre del proceso

```ts
await unloadModel({ modelId, clearStorage: false });
```

Descargar el último modelo cierra automáticamente la conexión RPC en Node/Electron y permite que el proceso termine naturalmente. Para cerrar de forma explícita, el SDK exporta `close()` (así lo usa el ejemplo oficial de download lifecycle). Además existe `clearStorage: true` si quieres borrar también el estado asociado.

> Nota de versión: material previo del curso mencionaba un ciclo con `close()` obligatorio. En v0.18.x el cierre automático al descargar el último modelo es comportamiento documentado; `close()` queda como cierre explícito opcional.

---

## Under the Hood

¿Dónde está la física de todo esto?

- **Los pesos son el modelo.** Un GGUF cuantizado a 4 bits (~Q4_0) ocupa aproximadamente 0.5–0.6 GB por mil millones de parámetros. `LLAMA_3_2_1B_INST_Q4_0` ronda ~0.6–0.7 GB en disco: cabe en casi cualquier máquina moderna.
- **Cargar = mover bytes del disco a la memoria.** El tiempo de carga depende de la velocidad de almacenamiento (SSD vs HDD) y del ancho de banda de memoria. Es I/O, no cómputo.
- **Inferir = aritmética intensiva en memoria.** Cada token generado exige recorrer los pesos. El cuello de botella típico en CPU es el ancho de banda de memoria, no la frecuencia. De aquí saldrán tus métricas de tok/s.
- **TTFT vs throughput.** El tiempo hasta el primer token incluye procesar tu prompt (prefill); los tokens/segundo miden el ritmo de decodificación posterior. Son fenómenos distintos y se miden por separado.
- **Sin red, nada de esto cambia.** Ni la carga ni la decodificación tocan la pila de red. Por eso el modo avión funciona — y por eso cualquier fallo en modo avión señala una dependencia de red mal clasificada, no "un problema del modelo".

Qué desaparece cuando cortas la red (y qué no):

| Desaparece con la red | Sigue disponible localmente |
|---|---|
| Resolución DNS | Assets cacheados del modelo |
| Gateways de API / autenticación | Archivos locales |
| Rate limits remotos | Runtime de inferencia |
| Registro remoto de modelos | Historial de conversación en disco |
| Telemetría / almacenamiento cloud | Lógica de tu aplicación |

---

## Worked Example

El flujo completo de provisionar → inferir → limpiar, en su forma mínima:

```ts
import {
  close, completion, downloadAsset, loadModel,
  LLAMA_3_2_1B_INST_Q4_0, unloadModel,
} from "@qvac/sdk";

// FASE RED (solo esta necesita conexión)
await downloadAsset({ assetSrc: LLAMA_3_2_1B_INST_Q4_0 });

// FASE LOCAL (funciona offline si la fase anterior completó)
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

// LIMPIEZA (nunca la omitas)
await unloadModel({ modelId, clearStorage: false });
void close();
```

Ejemplos ejecutables completos en [`examples/`](examples/) — cada uno enseña exactamente un concepto.

---

## Predict

Antes de ejecutar el laboratorio, **escribe tus respuestas** (las verificarás con evidencia):

1. Ejecutas el programa dos veces seguidas **con** red. ¿En cuál esperas mayor tiempo de descarga? ¿Por qué?
2. Borras la caché y corres **sin** red desde el inicio. ¿Qué error esperas y en qué fase?
3. Provisionas con red, luego cortas la red y cargas. ¿Fallará `loadModel()`? Justifica usando el modelo mental del worker.
4. Durante la generación offline, ¿algún byte de tu prompt cruza la pila de red? ¿Cómo podrías demostrarlo más allá de "confío en ti"?

Regla de la casa: **comprometerse con una predicción antes de ejecutar** es lo que convierte una observación en aprendizaje. Una predicción incorrecta verificada vale más que diez demos miradas en silencio.

---

## Build — Prove It Works Offline

Construye el programa mínimo del laboratorio ([lab/](lab/)):

1. Descarga un modelo de catálogo reportando progreso.
2. Cárgalo y realiza una completación.
3. Descarga el modelo (`unloadModel`) y cierra (`close`).
4. Desconecta la red.
5. Vuelve a ejecutar la inferencia desde el caché.
6. Registra evidencia: capturas de salida con timestamps.

Entregable: **Airplane-Mode Proof** — la evidencia de ambos ciclos (con y sin red) más la explicación de la ruta de datos escrita con tus palabras.

---

## Break It

Rompe el sistema de forma controlada y **predice antes de romper**:

| Escenario | Predicción a escribir antes |
|---|---|
| Borrar el archivo(s) del modelo cacheado y correr offline | ¿En qué fase falla? ¿Qué mensaje esperas? |
| Mover el asset cacheado a otra carpeta | ¿Lo detecta la validación? ¿Con qué error? |
| Arrancar sin haber provisionado nunca, sin red | ¿Se distingue este error del anterior? |
| Provisionar un modelo mayor a la memoria libre disponible | ¿Falla en descarga, en carga o durante inferencia? |

Después de cada rotura, diagnostica: ¿qué fase del pipeline intentó tocar la red o el disco, y cómo lo sabe por el mensaje de error? El objetivo no es que falle — es que puedas **leer el fallo** y ubicarlo en la ruta de datos.

---

## Measure It

Captura estas métricas en tu máquina y guárdalas en una tabla (plantilla en el lab). Son **de tu equipo**: no existen valores universales y no aceptes números que no mediste.

| Métrica | Cómo se obtiene |
|---|---|
| Tamaño de descarga | Campos `downloaded`/`total` de `onProgress`; o tamaño final del asset |
| Tiempo de carga | `performance.now()` alrededor de `loadModel()` |
| TTFT (time-to-first-token) | Timestamp del primer evento `contentDelta` menos timestamp de envío del prompt |
| Tokens/segundo | `run.final.stats.tokensPerSecond` (reportado por el runtime) |
| Memoria pico del proceso | `process.memoryUsage().heapUsed` muestreado, o monitor del sistema |

Corre cada medición al menos dos veces (primera carga vs. carga tibia) y anota ambas: el sistema no se comporta igual frío que caliente.

---

## Misconcepciones comunes

1. **"Descargué el modelo, entonces mi app es local."** No: descargar es solo copiar bytes. Local es donde ocurre la *inferencia*. Una app que descarga assets pero llama a una API para generar sigue siendo cloud-dependent.
2. **"Offline significa que la app entera funciona sin red."** Local-first significa que la funcionalidad *prometida como local* funciona sin red. Tu app puede tener features que sí requieren red (telemetría, actualizaciones); lo importante es saber y declarar cuáles son.
3. **"El modelo se 'abre' cada vez que genero texto."** No: cargar es una fase aparte, cara, y el modelo permanece residente hasta `unloadModel()`. Re-cargar por turno es un anti-patrón de rendimiento.
4. **"Si falla en modo avión, el SDK no sirve para offline."** Casi siempre el fallo indica una dependencia mal clasificada (registro, telemetría, ruta absoluta de otro equipo) — diagnosticar *cuál* es justo el ejercicio.

---

## Conexiones de arquitectura

- **Clase 2 (Modelos y GGUF):** hoy tratamos el asset como una caja negra; allí abrimos la caja — pesos, tensors, tokenizer, cuantización y nombres de modelos.
- **Clase 3 (Fundamentos de inferencia):** el TTFT que mediste hoy se descompone en tokenización + prefill; el tok/s en decodificación autoregresiva y KV cache.
- **Clase 10 (Arquitecturas local-first):** el Airplane-Mode Test se convierte en criterio formal de aceptación ("Offline Capability") del capstone.

La métrica que hoy capturaste a mano es la misma que el capstone exigirá como evidencia sistemática.

---

## Checkpoint

Responde sin mirar la documentación (máximo una pregunta de recall puro):

1. *(Recall)* ¿Qué función de QVAC descarga un asset sin cargarlo en memoria?
2. *(Explicación)* Explica la diferencia entre modelo local e inferencia local usando la ruta de datos. ¿Puede existir una sin la otra?
3. *(Predicción)* Provisionaste con red. Luego borraste **solo** el caché del navegador y la app falla en modo avión... espera: ¿por qué este escenario es una trampa? ¿Qué debería pasar realmente?
4. *(Diagnóstico)* Tu compañero corre el lab offline y obtiene un error en `loadModel()`. Lista tres causas posibles ordenadas por probabilidad y cómo distinguirlas entre sí.
5. *(Juicio arquitectónico)* Un cliente exige "nuestra app de soporte debe funcionar en aviones". Redacta en 3–5 líneas qué prometerías exactamente (qué sí y qué no) y qué test instalarías para verificarlo en CI.

---

## Takeaway

> La IA local no es una etiqueta: es una propiedad verificable de la arquitectura.
> Provisionas cuando hay red; cargas, infieres y mides cuando no la hay.
> El Airplane-Mode Test convierte la promesa en evidencia — y esa disciplina de evidencia es el hilo conductor de todo el bootcamp.

**Siguiente clase:** abrimos el archivo GGUF — qué son realmente los pesos, la tokenización y la cuantización que acabas de descargar.

---

## Sources Used

- QVAC — Introduction & How it works: https://docs.qvac.tether.io/introduction/ · https://docs.qvac.tether.io/about/how-it-works/
- QVAC — Download lifecycle (provisión offline, resumable downloads, fallbackSrc): https://docs.qvac.tether.io/models/download-lifecycle/
- QVAC — Text generation (eventos de completion, stats): https://docs.qvac.tether.io/ai-capabilities/text-generation/
- QVAC — API Summary v0.18.x: https://docs.qvac.tether.io/reference/api/
- QVAC — Release notes v0.18.x: https://docs.qvac.tether.io/reference/release-notes/
- npm @qvac/sdk 0.18.1 (quickstart oficial): https://www.npmjs.com/package/@qvac/sdk
- Curriculum canónico: `QVAC_Course_Expanded_Learning_Edition.md`, Cap. 1 (§1.1–1.8)
