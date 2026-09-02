# The Local-First AI Systems Masterclass
## Módulo 1 — Own the Inference
### Una masterclass escrita sobre local AI, GGUF, quantization, inference y aplicaciones offline

> **Edición proof-checked — agosto de 2026.**

> Este documento fue escrito desde cero como una secuencia argumentativa. La intención no es
> enumerar tecnologías sino derivar por qué cada abstracción se vuelve necesaria. Las firmas
> y comportamientos específicos de QVAC se basan en la documentación oficial vigente de
> QVAC SDK v0.18.x; npm publica `@qvac/sdk 0.18.1` como `latest`. [Q-API] [Q-REL] [Q-NPM]

> Cuando una fuente académica solo pudo verificarse a nivel de metadata o abstract público,
> el texto no atribuye detalles experimentales que no estén disponibles. El capítulo
> *Offline-First AIED* de AIED 2026, por ejemplo, se usa para su framing arquitectónico
> verificado y no para inventar resultados cuantitativos del contenido cerrado. [A-AIED]

---

# Prólogo — ¿Qué significa poseer una inferencia?

Cuando usamos un asistente de IA alojado en la nube, la experiencia parece casi
instantánea y local. Escribimos en una caja que está dibujada en nuestra pantalla,
pulsamos Enter y aparecen palabras en el mismo dispositivo. Esa proximidad visual
engaña. La interfaz puede ser local mientras que el trabajo decisivo ocurre a cientos o
miles de kilómetros. El prompt abandona el dispositivo, atraviesa una red, llega a
infraestructura operada por otra organización, se coloca en una cola, consume
aceleradores remotos y vuelve transformado en tokens. La pantalla es local; la ruta de
inferencia no lo es.

El objetivo de este módulo es aprender a seguir esa ruta físicamente y conceptualmente.
“Own the inference” no significa poseer una marca, descargar un archivo o desconectar
Wi‑Fi durante una demo. Significa poder responder preguntas más concretas: ¿dónde están
los pesos?, ¿qué proceso los tiene cargados?, ¿qué bytes tienen que cruzar una frontera
de red?, ¿qué estado permanece en memoria entre tokens?, ¿qué parte de la latencia
ocurre antes del primer token?, ¿cómo decide el sistema qué token sale después?, ¿qué
ocurre si el usuario cancela?, ¿qué estado sobrevive un reinicio?, ¿y qué evidencia
demostraría que la aplicación sigue produciendo trabajo nuevo cuando desaparece
Internet?

Las cuatro clases forman una sola derivación. La primera elimina la red de la ruta
crítica y descubre que “local” es una propiedad mucho más precisa de lo que parece. La
segunda desmonta la palabra “modelo” hasta llegar al artefacto concreto que ocupa disco
y memoria: GGUF y sus representaciones cuantizadas. La tercera abre la caja negra
temporal de una completion y separa tokenización, prefill, decode, sampling, context y
KV cache. La cuarta descubre que ninguna de esas piezas constituye todavía una
aplicación: hace falta estado conversacional, streaming provisional, cancelación,
commit, persistencia, restore y shutdown. Al terminar, la frase “corre localmente”
deberá significar una arquitectura que podamos explicar y falsar, no una impresión.

# Cómo se investigó y cómo leer las fuentes

Las fuentes oficiales de QVAC tienen prioridad para afirmar qué hace el SDK. La API
Summary actual se titula `API Summary — v0.18.x (latest)` y las release notes actuales
abarcan v0.18.0 y v0.18.1. npm muestra `@qvac/sdk 0.18.1` como versión `latest`. [Q-API]
[Q-REL] [Q-NPM] Esta coincidencia evita la discrepancia que existía en una etapa
anterior del curso, pero aun así la regla editorial se mantiene: API reference para
signatures, capability pages para comportamiento, release notes para cambios y npm para
el paquete publicado.

La documentación de JS/TS conserva algunos ejemplos antiguos construidos sobre wrappers
como `tokenStream`, mientras que la página actual de Text Generation declara `events`
más `final` como la forma canónica de consumir `completion()` y dice que el nuevo código
debería preferir esa superficie. [Q-TEXT] Esta clase de coexistencia es normal en
documentación viva. No debemos elegir el snippet más corto y convertirlo en doctrina;
debemos leer el estado de deprecación y el contrato actual.

Los papers se utilizan con una disciplina diferente. Un speedup publicado bajo una NPU,
una GPU o un modelo concreto se presenta como resultado de ese experimento y nunca como
una ley de hardware. `llm.npu`, por ejemplo, reporta grandes aceleraciones de prefill en
su sistema on-device, pero la lección general es que prefill puede convertirse en un
cuello de botella y que la colocación heterogénea de operaciones puede cambiarlo, no que
toda NPU sea automáticamente más rápida. [A-LLMNPU] Del mismo modo, un paper sobre
offloading muestra que local y cloud pueden optimizarse conjuntamente; no demuestra que
una policy particular sea óptima para nuestra laptop.

---

# Clase 01 — Airplane-Mode Intelligence

## 1. La ruta que normalmente no vemos

Empecemos sin QVAC y sin modelos locales. Imagina una aplicación de chat convencional.
El usuario escribe “resume este contrato”. La interfaz captura el texto y quizá el
documento. Después serializa una petición, resuelve DNS, abre o reutiliza una conexión,
atraviesa Wi‑Fi, router, ISP y redes intermedias, llega al frontend del proveedor, pasa
autenticación, rate-limiting y scheduling, alcanza un servidor de inferencia, ejecuta el
modelo y envía deltas de vuelta. Casi toda esa ruta queda oculta detrás de una función
que en el código puede parecer `client.chat(...)`.

El hecho de que la respuesta vuelva a la misma ventana crea una ilusión de continuidad
local. Pero, desde systems engineering, la ruta contiene fronteras de ownership,
latencia y fallo. Si el DNS falla, la experiencia falla. Si el proveedor rechaza
credenciales, falla. Si la organización cambia el modelo remoto, el comportamiento puede
cambiar sin que el artefacto local cambie. Si la red tiene jitter, el time to first
token incluye ese jitter. Si el prompt contiene información privada, esos bytes salen
del dispositivo antes de que el modelo pueda hacer algo con ellos.

El primer movimiento intelectual del módulo consiste en hacer visible la ruta. Una
arquitectura no se entiende por dónde está dibujada la UI, sino por dónde viajan datos y
cómputo. Esta misma forma de pensar reaparecerá en P2P más adelante: “cerca” para el
usuario no equivale a “local” para la ejecución.

```text
Cloud-centric path

User
  │
  ▼
Local UI
  │ prompt / files
  ▼
Network stack
  │
  ▼
Remote API gateway
  │
  ▼
Remote scheduler
  │
  ▼
Datacenter accelerator
  │
  ▼
Remote model weights
  │ generated tokens
  ▼
Network
  │
  ▼
Local UI
```

## 2. La pregunta que cambia la arquitectura

Ahora retiremos una condición. Queremos que la red desaparezca de la ruta crítica. No
queremos solamente cachear una respuesta ni mantener abierta una sesión existente;
queremos formular una pregunta nueva y producir tokens nuevos sin comunicación remota.
¿Qué tiene que moverse? Como mínimo, el modelo o una capacidad equivalente de inferencia
debe estar accesible desde el dispositivo, el runtime debe poder ejecutar sus
operaciones, el almacenamiento debe contener los activos necesarios y la aplicación debe
ser capaz de reconstruir su estado sin consultar una autoridad remota.

Esta modificación aparentemente simple cambia el sistema completo. La latencia de red
deja de formar parte obligatoria de cada request, pero aparecen restricciones de
memoria, almacenamiento, ancho de banda interno y consumo energético. El proveedor
remoto deja de gestionar el model server, pero la aplicación local adquiere
responsabilidad sobre provisioning, compatibilidad de hardware y lifecycle. La
privacidad puede mejorar porque una clase de dato ya no necesita cruzar la red, pero el
proceso local todavía puede escribir logs, crear caches o compartir archivos. Local no
borra la necesidad de threat modeling; cambia las fronteras.

La pregunta correcta, por tanto, no es “¿local es mejor que cloud?”. Es “¿qué
propiedades cambian cuando trasladamos la inferencia y qué restricciones aparecen como
consecuencia?”. Los papers de edge y hybrid inference son útiles precisamente porque
muestran que esta decisión no tiene un ganador universal. [A-INTEL] [A-TMO] [A-WIFI]

## 3. Ocho significados que suelen mezclarse bajo la palabra «local»

Una aplicación puede tener una interfaz local y una inferencia remota. Puede almacenar
un archivo `.gguf` localmente y aun así no usarlo para el request actual. Puede ejecutar
el modelo en un servidor de la oficina y llamarlo “local” desde la perspectiva
organizacional, aunque no sea on-device. Puede seguir funcionando sin Internet porque
utiliza un edge node de la LAN, lo que es offline respecto de Internet pero no
single-device. Todas estas arquitecturas pueden ser razonables, pero no son
equivalentes.

`On-device inference` es la afirmación más física: el modelo se ejecuta en el mismo
endpoint —laptop, móvil, workstation— donde reside la aplicación o el usuario. `Edge
inference` es más amplio: el cómputo ocurre cerca del origen de datos, quizá en un
gateway, access point, appliance o dispositivo vecino. `Offline-capable` describe
comportamiento: el flujo esencial puede completarse sin conectividad bajo condiciones
declaradas. `Offline-first` convierte esa capacidad en prioridad de diseño; el sistema
no considera la red como requisito permanente para su función central.

`Local-first`, siguiendo a Kleppmann y colaboradores, no significa “nunca existe un
servidor”. El trabajo original propone ideales donde la copia local y la agencia del
usuario son centrales, mientras la red puede apoyar sincronización, colaboración o
disponibilidad multidispositivo. Entre sus siete ideales están trabajo inmediato sin
spinners, operación con network optional, privacidad/seguridad, longevidad y ownership.
[A-LOCALFIRST] Traducido a AI, esto sugiere que inferencia y datos esenciales pueden
vivir localmente aunque un sistema utilice cloud para tareas excepcionales, sync o
modelos que el dispositivo no puede ejecutar.

## 4. Local-first no es local-only

Esta distinción evita una falsa dicotomía. Intel describe en 2026 una estrategia
on-device-first para enterprise GenAI en AI PCs: la ejecución local se vuelve el default
para muchos workloads por razones de privacidad, coste y latencia, mientras cloud sigue
siendo importante para cargas demasiado complejas o pesadas. [A-INTEL] El trabajo TMO de
MobiHoc plantea una decisión parecida de forma más formal: combina un LLM local ligero y
un LLM cloud de mayor escala, y optimiza la ubicación de inferencia bajo calidad,
latencia, usage cost y restricciones de recursos. [A-TMO]

Estos enfoques no contradicen el ideal local-first; ayudan a precisar su frontera. Un
sistema puede tener una ruta local que siempre está disponible y una ruta remota que se
activa cuando la policy lo justifica. La pregunta de ownership es quién decide, qué
datos salen, qué ocurre si cloud desaparece y qué función permanece. Si la aplicación
deja de ser útil sin el servidor, es difícil defender que su núcleo sea local-first
aunque tenga un pequeño modelo local para decorar la experiencia.

La arquitectura híbrida también revela que “mejor modelo” no basta para decidir
placement. Un modelo cloud puede tener mayor calidad y peor latencia de red; el local
puede ser más rápido para una tarea simple pero insuficiente para otra. El sistema TMO
formula la decisión como optimización long-term bajo restricciones. El paper de WiFi
offload de 2026 va un paso más allá: una tarea puede ejecutarse localmente, offloadearse
a un edge AP o descomponerse en subtareas con scheduling conjunto de compute, queue y
comunicación; en sus simulaciones el framework reporta mejores tradeoffs que baselines
local-only y nearest-edge, pero esos porcentajes pertenecen a su setup y no son promesas
para cualquier WLAN. [A-WIFI]

## 5. Cuando la conectividad no es un detalle sino una desigualdad

Los trabajos de educación offline-first muestran otra motivación. Arapai se presenta
como una arquitectura de chatbot educativo diseñada para funcionar enteramente sin
Internet sobre equipos CPU-only de baja especificación, combinando modelos cuantizados,
selección de modelo hardware-aware y respuestas pedagógicamente graduadas. [A-ARAPAI] Su
framing no dice que cloud sea inútil; el propio paper lo presenta como paradigma
complementario para entornos donde infraestructura y conectividad son restricciones
reales.

El capítulo *Offline-First AIED: An Architectural Blueprint for On-Device LLM
Integration in Low-Resource Educational Contexts* apareció en AIED 2026. El acceso
público que pudimos verificar confirma título, autores, venue, páginas y el objetivo
arquitectónico de integrar LLMs on-device en contextos de bajos recursos; el full text
de Springer estaba cerrado en la fuente consultada, así que esta edición no inventa sus
resultados internos. [A-AIED] Esa limitación es un ejemplo de proof-checking: una
referencia relevante no autoriza afirmar lo que no podemos verificar.

La lección más amplia es que offline capability puede ser una propiedad de acceso, no
solo de privacidad. Si la escuela, fábrica o equipo de campo pierde conectividad, un
flujo cloud se convierte en indisponible. Mover inferencia al endpoint transforma una
dependencia social y de infraestructura en un presupuesto de compute local. El problema
no desaparece; cambia de forma.

## 6. La física vuelve: CPU, GPU, NPU y ancho de banda

Una vez que el modelo vive cerca del usuario, la red deja de ocultar la física del
cómputo. Los pesos deben estar en almacenamiento y ser accesibles a los kernels. El
sistema debe mover grandes cantidades de datos entre niveles de memoria, ejecutar
operaciones matriciales y mantener estado temporal. CPU, GPU y NPU tienen capacidades y
restricciones distintas; incluso dentro de una misma familia, drivers y backends
cambian.

`llm.npu` es interesante porque no presenta la NPU como un acelerador universal.
Identifica prefill como cuello de botella en ciertos workloads on-device y reconstruye
prompt/model en varios niveles para offload heterogéneo entre NPU y CPU/GPU. En su
evaluación reporta 22.4x de mejora promedio en prefill frente a sus baselines y 30.7x en
ahorro energético, con un máximo de 32.8x end-to-end en una aplicación concreta.
[A-LLMNPU] Esos números son resultados del sistema y hardware del paper; lo transferible
es la idea de que placement y data movement pueden dominar el rendimiento.

EdgeFM, publicado en 2026, parte de otra necesidad: edge industrial exige latencia baja
y estable, portabilidad cross-platform y menor dependencia de toolchains cerrados.
Propone un framework ligero para VLM/LLM y reporta mejoras en plataformas concretas,
incluido hasta 1.49x sobre TensorRT-Edge-LLM en NVIDIA Orin en sus experimentos.
[A-EDGEFM] De nuevo, el número no es una ley. El patrón general es que edge inference es
systems engineering: kernels, backend, hardware y workload interactúan.

## 7. Privacidad: seguir bytes, no slogans

Si un prompt ya no cruza una API remota, desaparece una frontera de exposición
importante. Eso puede ser decisivo para notas privadas, documentos empresariales o datos
de campo. Pero “local” no implica automáticamente “private”. El texto puede quedar en un
log. Un crash dump puede capturar memoria. El transcript puede guardarse sin cifrar.
Otro proceso con permisos puede leer el cache. Una función opcional puede enviar
telemetry. La forma rigurosa de hablar de privacidad es seguir datos y actores.

La filosofía local-first ayuda porque coloca ownership y privacidad dentro de la
arquitectura de datos, no como una política posterior. [A-LOCALFIRST] En AI debemos
ampliar la pregunta: además del documento, ¿dónde viven prompts, tokens, KV cache, model
files, conversation history, profiler output y logs? ¿Cuál de ellos contiene contenido
legible y cuál contiene derivados potencialmente sensibles? ¿Qué sobrevive al proceso?
¿Qué sale por red?

La prueba de “no veo tráfico” tampoco demuestra seguridad completa. Solo demuestra una
propiedad temporal bajo el instrumento y condiciones usados. El curso busca aprender a
formular claims estrechos y comprobables: “durante esta completion offline, con
networking deshabilitado y los activos provisionados, el flujo esencial produjo una
respuesta nueva sin contactar el registry”. Esa frase es más útil que “100% private AI”.

## 8. Ahora sí: ¿qué es QVAC dentro de esta historia?

Hasta aquí no necesitábamos un SDK. Ahora sí necesitamos una forma concreta de ejecutar
modelos y controlar su lifecycle en la máquina. La documentación actual de QVAC define
dos capas: un worker que ejecuta los modelos y clientes por lenguaje que conducen ese
worker. Actualmente hay clientes JS/TS y Python construidos sobre el mismo contrato y
las mismas capacidades. [Q-INTRO]

Los componentes subyacentes se ejecutan sobre Bare. Cuando el SDK se usa desde un
runtime JS distinto de Bare, QVAC crea un Bare worker donde ocurren las operaciones de
AI; el worker se inicia de forma lazy con la primera RPC. En Bare no se crea un proceso
worker separado y las requests se atienden in-process. La documentación también
establece que existe un único RPC client y Bare worker por aplicación, no uno por
modelo. [Q-HOW]

Esta arquitectura importa porque nos da fronteras nuevas para razonar. `loadModel()` no
“mete el modelo dentro de la función que lo llamó”; inicia el worker si hace falta,
adquiere o localiza el artefacto, lo carga y registra un ID. Varias cargas pueden
coexistir dentro del mismo worker. `close()` apaga explícitamente worker/RPC en
Node/Expo; en Bare es un no-op porque no hay proceso separado. [Q-HOW] Cuando hagamos
debugging, podremos distinguir application state, client/RPC state, worker state y model
state.

```text
QVAC local path

Application (JS/TS or Python)
          │
          │ generated contract / RPC
          ▼
      QVAC worker
      (Bare runtime)
          │
          ├── loaded model A
          ├── loaded model B
          └── local backend / device
                   │
                   ▼
              CPU / GPU
```

## 9. Download, cache, load e inference son cuatro verbos distintos

Decir “el modelo está descargado” no significa que esté cargado en RAM. Decir “está
cacheado” no significa que el SDK ya haya creado una instancia de inferencia. Y decir
“está cargado” no significa que una completion esté en ejecución. Separar esos estados
es la base del lifecycle local.

QVAC documenta `downloadAsset()` como una operación específicamente download-only. Sirve
para provisionar un activo sin cargarlo en memoria. `loadModel()` puede adquirir un
modelo si hace falta y después cargarlo, pero si queremos preparar un equipo antes de
quedar offline, la separación explícita es semánticamente más clara. [Q-DOWN] Un modelo
de catálogo completamente cacheado puede validarse contra metadata bundled de tamaño y
checksum y cargarse posteriormente sin contactar el registry, siempre que se use el
mismo `cacheDirectory`. [Q-DOWN]

El caso de una ruta local es distinto. QVAC permite `loadModel()` desde filesystem con
un `modelType` explícito, pero la documentación advierte que ese archivo no queda
asociado a la constante de catálogo ni es validado contra checksum de catálogo; la
aplicación asume provisioning e integridad. [Q-DOWN] Este detalle muestra que ownership
también significa responsabilidad.

## 10. Resumable downloads y por qué un archivo parcial no es un modelo listo

Las descargas actuales de QVAC son resumables por defecto. `downloadAsset()` y
`loadModel()` escriben parciales a disco; una nueva ejecución puede continuar. Ambas
operaciones devuelven una decorated promise con `requestId` disponible de forma
síncrona. Cancelar por ese ID preserva el parcial por defecto; `clearCache: true` lo
descarta. [Q-DOWN] Esta semántica convierte provisioning en un lifecycle observable.

La distinción entre parcial y activo validado importa para la prueba offline. Si
desconectamos la red antes de completar adquisición, el hecho de que exista un archivo
grande en el cache no demuestra que el modelo esté disponible. El SDK necesita terminar
y validar el estado apropiado. Una prueba rigurosa provisiona completamente, cierra el
proceso y después retira conectividad.

QVAC también permite `fallbackSrc` para un modelo de catálogo: si el origen no funciona,
puede usar una URL HTTP o ruta local alternativa y validar el resultado contra el
checksum de la constante. La feature solo aplica cuando el `modelSrc` es una constante
built-in que aporta ese checksum; no es una política genérica para cualquier URL o path.
[Q-DOWN] Este nivel de precisión evita escribir tutoriales que prometen fallback donde
no existe contrato.

## 11. El Airplane-Mode Test como experimento epistemológico

Ahora tenemos suficientes piezas para diseñar una prueba que realmente diga algo. El
claim a falsar es: “después del provisioning, esta aplicación puede producir una
inferencia nueva sin necesitar la red”. Si simplemente desconectamos Wi‑Fi cuando el
proceso ya tiene el modelo cargado, demostramos que esa instancia residente puede seguir
computando, pero no demostramos que la aplicación pueda arrancar offline. El modelo
podría haber sido adquirido durante el startup y existir solo en memoria.

Por eso el reinicio es central. Cerramos la aplicación y el worker, de manera que
desaparece el estado volátil. Deshabilitamos networking. Arrancamos otra vez.
`loadModel()` debe encontrar y validar los activos locales en cache; el worker debe
inicializarse sin registry; la completion debe generar un texto que no existía antes.
Una pregunta nueva evita que una capa de output cache produzca un falso positivo
trivial.

Incluso un test exitoso tiene límites. No demuestra que ninguna función opcional use
red. No demuestra secure erase ni privacidad frente a otros procesos. No demuestra que
todas las familias de modelos estén disponibles offline. Demuestra una propiedad
concreta del critical path bajo un estado provisionado. Esa modestia hace que la
evidencia sea más fuerte, no más débil.

## 12. Código después de la derivación: provisionar y reiniciar

Ahora el código tiene una razón. En la primera ejecución queremos transferir el activo a
cache sin mantenerlo cargado. Después cerramos. En la segunda ejecución, ya sin red,
cargamos el mismo catálogo desde cache y hacemos una completion. La documentación actual
recomienda `events` + `final` para nuevo código de `completion()`, aunque algunos
quickstarts sigan mostrando `tokenStream`. [Q-TEXT]

```typescript
import {
  close,
  completion,
  downloadAsset,
  loadModel,
  unloadModel,
  QWEN3_4B_INST_Q4_K_M,
} from "@qvac/sdk";

// Fase A: provisioning, con red disponible.
await downloadAsset({ assetSrc: QWEN3_4B_INST_Q4_K_M });
await close();

// Termina el proceso aquí.
// Desactiva la red.
// Ejecuta la fase B en un proceso nuevo.

let modelId: string | undefined;

try {
  modelId = await loadModel({
    modelSrc: QWEN3_4B_INST_Q4_K_M,
  });

  const run = completion({
    modelId,
    history: [{
      role: "user",
      content: "Explica por qué un restart offline es una prueba más fuerte.",
    }],
    stream: true,
  });

  for await (const event of run.events) {
    if (event.type === "contentDelta") {
      process.stdout.write(event.text);
    }

    if (event.type === "completionDone") {
      console.error("\nstopReason:", event.stopReason);
    }
  }

  const final = await run.final;
  console.error("\nstats:", final.stats);
} finally {
  if (modelId) {
    await unloadModel({ modelId });
  }
  await close();
}
```

## 13. Qué debemos observar además de que aparezcan palabras

Una demostración visual es útil, pero systems engineering quiere más. Conviene registrar
el resultado de `qvac doctor`, plataforma, CPU/GPU, memoria, modelo, versión del SDK,
ubicación del cache y tiempos. Los requisitos oficiales actuales indican que `qvac
doctor` valida el subconjunto machine-checkable del host y que todos los clientes
conducen el mismo worker, por lo que los requisitos son worker-level. [Q-SYS] No debemos
confundir un host que pasa checks mínimos con una garantía de que cualquier modelo cabrá
en RAM.

Los logs pueden mostrar loading e inference, pero deben interpretarse con la misma
cautela. La página de Logging documenta `subscribeServerLogs()` para todos los logs
server-side, `loggingStream()` para una fuente concreta y `getLogger()` para la
aplicación. [Q-LOG] En una prueba de privacidad, habilitar logs completos puede crear
datos sensibles en disco; la observabilidad también tiene una política de datos.

Podemos además inspeccionar network activity con herramientas del sistema operativo. Si
el modelo de catálogo intenta registry porque el cache está incompleto, eso es evidencia
de una dependencia de provisioning, no de que la inferencia matemática necesite red. El
análisis debe nombrar la etapa exacta.

## 14A. Descomponer la latencia: qué desaparece cuando quitamos la red

En una ruta cloud, el tiempo observado por el usuario es una suma de componentes. Hay
serialización local, DNS o resolución previa, establecimiento o reutilización de
transporte, propagación, colas en el servicio, prompt processing remoto, decode y
retorno de los deltas. No todas las requests pagan cada componente desde cero, porque
existen conexiones persistentes y caches, pero la red y el scheduler remoto permanecen
fuera del control directo de la aplicación. Cuando trasladamos inference al dispositivo
eliminamos varios de esos términos de la ruta obligatoria, no la latencia en general.

La diferencia es importante para razonar sobre TTFT. Un modelo pequeño local puede ganar
frente a un modelo cloud más rápido en compute si la comunicación y la cola remota
dominan una respuesta corta. El resultado puede invertirse en una generación compleja
donde el modelo local tarda mucho en decode. Por eso la idea “local = baja latencia”
necesita una condición: local elimina network round-trip del critical path, pero la
experiencia final depende del balance entre compute local y compute remoto más
comunicación.

Los sistemas híbridos explotan exactamente este hecho. TMO trata calidad, latency y
usage cost como componentes de una decisión; el framework WiFi-offload añade queueing y
comunicación junto al compute. [A-TMO] [A-WIFI] Estos trabajos son más útiles como
modelos mentales que como recetas: nos enseñan a escribir el tiempo como una suma de
fases y a preguntar cuál domina para cada workload.

## 14B. Coste marginal, capacidad y el significado económico de «local»

En un API cloud, cada request puede tener un coste marginal explícito y un coste de
infraestructura oculto detrás del precio. En local, el coste financiero por token puede
no aparecer como invoice, pero existen hardware amortization, energía, almacenamiento y
tiempo de usuario. Cambiar de cloud a local no elimina economía; cambia dónde se
contabiliza.

Esta diferencia altera qué workload conviene ejecutar dónde. Una empresa con miles de AI
PCs ya adquiridos puede aprovechar capacidad ociosa para tareas frecuentes y reservar
cloud para picos o modelos demasiado grandes. Un móvil alimentado por batería enfrenta
otra economía: cada token compite con energía, temperatura y responsiveness de otras
aplicaciones. Una workstation conectada a corriente tiene un presupuesto distinto.

El diseño local-first permite además una forma de cost predictability: una vez
provisionado el modelo, una request no depende de una tarifa por token del proveedor.
Pero el modelo puede necesitar actualización, y los assets ocupan disco. Ownership
sustituye un contrato operativo por otro conjunto de responsabilidades. Una arquitectura
madura hace visibles ambos.

## 14C. Data residency y sovereignty: una consecuencia distinta de privacidad

Privacy pregunta quién puede observar datos. Data residency pregunta dónde pueden
almacenarse o procesarse. Sovereignty añade control sobre infraestructura, política y
jurisdicción. Una inferencia on-device puede ayudar a las tres, pero son claims
distintos. Una empresa puede exigir que cierto documento no salga de un país aunque
confíe en el proveedor; otra puede aceptar cloud dentro de una región pero no logs
permanentes.

Cuando el modelo y el prompt permanecen en el endpoint, la aplicación puede diseñar una
frontera de residencia muy simple para el critical path. Sin embargo, model registry,
actualizaciones, crash reporting o sync de conversaciones pueden volver a introducir
tráfico. La arquitectura se evalúa flujo por flujo. “El LLM es local” no responde si el
transcript se sube después a un analytics backend.

El principio local-first de ownership resulta especialmente valioso porque obliga a
considerar la copia local como primaria en vez de cache descartable. [A-LOCALFIRST] En
Clase 04 aplicaremos esa idea al transcript: una conversación durable no debería
depender de que un servidor remoto siga existiendo para poder abrirse.

## 14D. Failure domains: la red deja de fallar y aparece el dispositivo

Mover inference localmente cambia el failure domain. Un outage del proveedor deja de
interrumpir el núcleo, pero un disco lleno puede impedir descargar modelos. Memory
pressure puede matar un proceso. El driver de GPU puede fallar. Un archivo corrupto
puede impedir load. El dispositivo puede entrar en thermal throttling. La ventaja no es
que el sistema ya no falle; es que sus fallos son diferentes y, en muchos casos, están
dentro de una frontera que podemos inspeccionar.

Esto también cambia fallback design. En cloud-centric software, “retry” suele significar
volver a llamar al servicio. En local, retry de `loadModel()` puede volver a usar un
parcial o cache. Una aplicación híbrida puede escalar a cloud si el local model no
carga, siempre que la policy permita enviar los datos. Un sistema estrictamente offline
necesita otra estrategia: modelo alternativo más pequeño, message de capacidad
insuficiente o un provisioning previo más robusto.

La observación importante es que resilience no surge automáticamente del término local.
Surge de diseñar estados y fallbacks para los nuevos failure modes. El Airplane-Mode
Test solo prueba una dimensión de esa resiliencia.

## 14E. Verificar el worker: local no significa que todo ocurra en el mismo hilo

La arquitectura QVAC introduce un matiz que vale la pena entender. En Node o Expo, la
aplicación y el worker Bare pueden vivir en procesos o runtimes distintos aunque ambos
estén en el mismo dispositivo. [Q-HOW] Desde la perspectiva de network sovereignty sigue
siendo local, pero desde la perspectiva de debugging existe una frontera RPC.

Esto explica por qué una app puede estar responsive mientras inference ocurre en el
worker, y por qué `close()` importa. También explica la existencia de logs server-side
separados de los logs de aplicación. El término “in-process” solo aplica a Bare según la
documentación actual; no debemos generalizarlo a todos los clientes.

La frontera RPC local es un buen recordatorio: “local” describe topología de confianza y
hardware, no ausencia de modularidad. Podemos tener procesos separados, file
descriptors, queues y streams sin abandonar el dispositivo.


## 14F. Traducir los siete ideales local-first al dominio de AI

El paper de Ink & Switch nació pensando en software colaborativo y ownership de datos,
no en LLMs. [A-LOCALFIRST] Por eso no deberíamos copiar sus siete ideales como etiquetas
y suponer que ya describen AI. Lo útil es traducir la tensión detrás de cada ideal a un
sistema de inferencia. “No spinners” habla de responsiveness y de que el trabajo local
no deba esperar un round trip para acciones ordinarias. En AI, esa intuición se
relaciona con TTFT local, pero no garantiza instantaneidad: un modelo demasiado grande
puede introducir su propio spinner. La arquitectura debe seleccionar un modelo capaz de
responder dentro del budget del dispositivo.

“Your work is not trapped on one device” introduce una tensión interesante. Un sistema
estrictamente on-device puede maximizar residencia local y, al mismo tiempo, dificultar
continuidad entre laptop y móvil. Local-first no quiere encerrar datos; quiere que el
usuario controle cómo se mueven. En AI esto puede significar sincronizar transcripts o
modelos de preferencias entre dispositivos sin convertir un servidor central en source
of truth. Ese problema se deja para módulos posteriores, pero nos recuerda que on-device
y local-first no son idénticos.

“The network is optional” es el ideal más visible para este módulo. Optional no
significa que nunca se use. Significa que la pérdida de red no impide seguir trabajando
con el estado local relevante. El Airplane-Mode Restart Test es una traducción
operacional: después de provisioning, desaparece network y la app sigue generando nuevo
trabajo. La distinción entre optional y forbidden permite que un sistema descargue
actualizaciones cuando están disponibles sin convertir la disponibilidad de esas
actualizaciones en una precondición de cada prompt.

“Seamless collaboration” y “The Long Now” parecen menos relacionados con una completion,
pero se vuelven centrales en Clase 04. Un transcript que solo existe en memory no tiene
longevidad. Un formato durable y versionado permite que conversaciones sobrevivan
actualizaciones del código. Si el usuario puede exportar su historial y los datos no
dependen de que una empresa mantenga una API, estamos más cerca del ideal de agency.

“Security and privacy by default” no autoriza a escribir “local = secure”. La traducción
correcta es reducir la cantidad de actores que necesitan recibir los datos y mantener la
arquitectura comprensible. Una app local puede seguir teniendo permisos excesivos o logs
sensibles. El ideal es una dirección de diseño, no una garantía creada por topología.

Finalmente, “ultimate ownership and control” se vuelve el criterio que une las cuatro
clases. El usuario o la aplicación puede decidir qué modelo existe en disco, cuándo se
carga, qué conversaciones se guardan, cuándo se borran y si la red participa. QVAC es
una herramienta para materializar parte de ese control; el ownership no proviene del
nombre del SDK sino de las decisiones que la arquitectura conserva bajo control local.

## 14G. Caso de arquitectura: asistente de campo con conectividad intermitente

Imaginemos un técnico que inspecciona infraestructura rural. Durante parte del día
dispone de 5G; en otras zonas no tiene señal. Necesita resumir notas, consultar
procedimientos y generar reportes. Una arquitectura cloud-only ofrece acceso a un modelo
grande cuando la red funciona, pero transforma cada túnel o zona remota en outage. Una
arquitectura on-device-only evita ese fallo, pero quizá el modelo local no pueda
resolver tareas multimodales complejas.

Un diseño on-device-first puede mantener un modelo cuantizado para tareas frecuentes y
una policy explícita de escalation cuando hay conectividad, consentimiento y una tarea
que supera la capacidad local. El prompt puede clasificarse por sensibilidad: notas
confidenciales nunca salen; preguntas públicas pueden escalar. El sistema debe mostrar
cuándo cambia de ejecución local a remota, porque esa decisión modifica latency, privacy
y cost.

Este caso permite entender offloading sin idealizarlo. Si subir una imagen de alta
resolución consume segundos y energía, el cloud model puede ser más rápido en compute y
más lento end-to-end. Si el edge node está en una WLAN cercana, la ecuación cambia. Los
trabajos TMO y WiFi-offload formalizan variaciones de esa decisión con objetivos
múltiples. [A-TMO] [A-WIFI] Nuestro producto no necesita copiar su algoritmo para
aprender que placement debe considerar comunicación y queue, no solo benchmark del
modelo.

La prueba de aceptación local no exige que el cloud path falle. Exige que, al retirar
red, la función esencial degradada siga operando y que el usuario sepa qué capacidades
no están disponibles. Local-first puede incluir graceful degradation en vez de
equivalencia perfecta entre offline y online.


## 14. Puntos de confusión de la Clase 01

La confusión más común es equiparar “offline” con “nunca usó Internet”. Una aplicación
puede necesitar red para instalar software y descargar un modelo una vez y, después,
operar completamente offline. La pregunta útil es qué fases requieren red. Provisioning
y runtime no son sinónimos.

Otra confusión es convertir “local” en “private”. Una local completion elimina el
proveedor remoto de la ruta de inferencia, pero privacidad depende también de
almacenamiento, permisos, logs y componentes secundarios. El claim correcto describe la
frontera que realmente cambió.

Finalmente, local-first no es una religión anti-cloud. El paper original permite que
servidores apoyen colaboración y disponibilidad; Intel, TMO y WiFi-offload muestran
arquitecturas donde local y remoto cooperan. [A-LOCALFIRST] [A-INTEL] [A-TMO] [A-WIFI]
La pregunta del diseñador es cuál es la autoridad, cuál es el fallback y qué sigue
funcionando cuando la red desaparece.

## Para estudiar — Clase 01

Primera pregunta. Dibuja dos rutas completas de una misma pregunta: una cloud-centric y
una on-device. No etiquetes simplemente cajas; identifica qué bytes cruzan cada
frontera, qué estado persiste y qué condiciones pueden fallar.

Segunda pregunta. Una aplicación carga un modelo con Internet, luego desconecta Wi‑Fi y
continúa respondiendo durante una hora. ¿Qué demuestra? ¿Qué todavía no demuestra?
Diseña una prueba adicional que elimine el mayor falso positivo.

Tercera pregunta. Compara un diseño on-device-only con uno on-device-first que puede
escalar a cloud. Formula tres condiciones bajo las cuales el híbrido sería preferible y
tres políticas que preservarían el carácter local-first del flujo esencial.

Cuarta pregunta. `llm.npu` reporta una gran aceleración de prefill en su plataforma.
Explica por qué no puedes convertir ese resultado en “NPU = 22.4x más rápida” y qué
información necesitarías antes de predecir rendimiento en otro dispositivo.

Quinta pregunta. Si el Airplane-Mode Test falla durante `loadModel()` pero el mismo
modelo funciona cuando ya estaba cargado antes de desconectar, ¿qué hipótesis sobre
provisioning, cache e inference se vuelve más probable? ¿Cómo la verificarías?

## Transición — Hemos quitado la red, pero aún no sabemos qué hemos cargado

La Clase 01 termina con una victoria limitada. Podemos demostrar que un proceso nuevo
carga un activo local y produce tokens sin una API remota. Pero todavía usamos “modelo”
como una palabra enorme. El disco contiene bytes; el runtime interpreta metadata,
tensores y tokenizer; la memoria contiene representaciones concretas. Dos archivos con
el mismo nombre de familia pueden ocupar cantidades muy distintas y producir perfiles de
calidad distintos. La siguiente pregunta es inevitable: cuando decimos “descargué un
modelo”, ¿qué descargamos realmente?

---

# Clase 02 — Models, GGUF and the QVAC Model Lifecycle

## 15. Desmontar la palabra «modelo»

“Descargué Llama” es una frase cómoda y técnicamente incompleta. Llama puede referirse a
una arquitectura/familia, a pesos específicos, a un checkpoint de entrenamiento, a una
variante instruct, a un tokenizer y configuración, o a un artefacto convertido para un
runtime. Si no distinguimos esas capas, preguntas como “¿cuánto ocupa el modelo?” o
“¿por qué este archivo es más rápido?” no tienen una respuesta estable.

La arquitectura describe la forma del cómputo: cuántas capas, dimensiones, atención,
normalizaciones y conexiones existen. Los parámetros son valores que esa arquitectura
utiliza y que en gran parte fueron aprendidos. Los pesos se almacenan en tensores:
arreglos multidimensionales de números. Un tokenizer y su vocabulary definen cómo el
texto se convierte en IDs que la red consume. Metadata describe propiedades necesarias
para interpretar el artefacto. Configuration puede elegir context size, backend u
opciones de runtime sin cambiar necesariamente los pesos.

El deployment local nos obliga a hacer estas distinciones porque cada componente tiene
un costo físico. Los tensores dominan storage y memory footprint. El tokenizer determina
cuántos tokens consume un prompt. La metadata permite que un executor entienda qué
arquitectura y tipos está viendo. La configuración decide cómo se instancia ese
artefacto en la máquina.

## 16. Un checkpoint de entrenamiento no es automáticamente un buen artefacto de inferencia

Durante training, el ecosistema necesita cosas que una aplicación final quizá no
necesite: optimizer state, gradientes, shards según una estrategia distribuida, formatos
pensados para PyTorch y metadata de entrenamiento. Inferencia tiene otro objetivo:
cargar rápidamente los pesos necesarios, interpretar su arquitectura de forma inequívoca
y ejecutar kernels de manera eficiente en una máquina concreta.

Por eso aparece un paso de conversión. No estamos “cambiando el modelo” en el sentido de
reentrenarlo; estamos reorganizando o representando sus parámetros en una forma que el
executor de inferencia entiende. En el ecosistema GGML/llama.cpp, GGUF cumple ese papel.
La especificación upstream dice que GGUF es un formato binario para almacenar modelos de
inferencia con GGML y executors basados en GGML, diseñado para carga/guardado rápidos,
facilidad de lectura, single-file deployment y extensibilidad. [G-GGUF]

El punto pedagógico es que formato y contenido no son lo mismo. Un archivo GGUF puede
contener tensores de alta precisión o cuantizados. Por tanto, “es GGUF” no significa “es
Q4”. GGUF responde a “¿cómo empaquetamos e interpretamos el artefacto?”; quantization
responde a “¿con qué representación numérica almacenamos y operamos sobre muchos
parámetros?”.

## 17. Abrir GGUF como una estructura, no como una extensión

El header del formato comienza con magic `GGUF`, una versión, el número de tensores y el
número de pares key-value. Después aparecen entradas de metadata y descriptores de
tensores; cada tensor tiene nombre, dimensionalidad, tamaños, tipo y offset hacia el
blob de datos. Los datos pueden estar alineados según `general.alignment`, con un
default actual de 32 en la implementación upstream. [G-GGUF-H]

Esa estructura resuelve problemas concretos. El magic/version permite reconocer el
formato y evolucionarlo. Los key-values permiten guardar architecture metadata,
tokenizer metadata y otros campos sin depender de archivos laterales. Los descriptors
indican cómo interpretar el blob binario. Alignment permite colocar los datos en offsets
adecuados para acceso eficiente. Single-file deployment reduce la fragilidad de
distribuir una colección de archivos cuyo significado depende de que todos estén en la
misma carpeta.

La especificación también enfatiza extensibilidad: nuevos campos pueden añadirse de una
forma que no obliga a reinterpretar el archivo como un layout completamente nuevo. Esto
es importante para un ecosistema que incorpora arquitecturas y metadata con rapidez.
[G-GGUF] No significa que cualquier executor entienda cualquier arquitectura nueva;
significa que el contenedor tiene mecanismos para representar información adicional.

## 18. Memory mapping: por qué el layout en disco afecta el runtime

Cuando un formato está diseñado para ser memory-mapped, el sistema operativo puede
mapear regiones del archivo al espacio de direcciones en lugar de obligar a copiar todo
mediante una lectura monolítica. Eso no significa que “el modelo no usa RAM”; las
páginas que se tocan deben estar respaldadas por memoria/cache y el OS administra
residency. Significa que el formato y el loader pueden aprovechar mecanismos del sistema
de memoria virtual.

Esta idea explica por qué file size, resident memory y load time no son la misma cifra.
Una carga puede beneficiarse del page cache del filesystem después de una primera
ejecución. Una segunda corrida parece más rápida porque el OS ya conserva páginas,
aunque el archivo y el modelo sean idénticos. Si llamamos “load benchmark” a una sola
corrida, podemos medir más el estado del filesystem que el artefacto.

El experimento correcto distingue cold y warm conditions y registra qué entendemos por
cada una. Incluso entonces, vaciar caches del OS de forma fiable puede requerir
privilegios y procedimientos específicos. La honestidad metodológica es más importante
que obtener una tabla perfectamente limpia.

## 19. Los números dentro de los tensores

Un tensor no es solo una forma; sus valores tienen un tipo de representación. FP32
dedica 32 bits por floating-point value. FP16 y BF16 usan 16 bits, pero distribuyen bits
entre signo, exponente y mantissa de forma diferente, por lo que rango y precisión
cambian. En training y deployment moderno se usan combinaciones de tipos; no existe una
única escalera donde un número mayor de bits sea siempre “mejor” en todo sentido.

Si un modelo tiene miles de millones de parámetros, multiplicar parámetros por bytes por
parámetro da una intuición inmediata del problema. Ocho mil millones de valores a dos
bytes son aproximadamente dieciséis gigabytes solo para esos valores, antes de otros
estados. Esa aritmética explica por qué un modelo que parece “pequeño” en el lenguaje de
research puede no ser cómodo en un portátil.

Aquí nace la necesidad de quantization. No como ZIP —ZIP aprovecha redundancia para
reconstruir exactamente el archivo— sino como representación aproximada. Queremos usar
menos bits para muchos valores, aceptando que ya no podemos representar exactamente cada
número original.

## 20. Quantization como aproximación numérica

Imagina un conjunto de valores floating-point dentro de un rango. Una quantization
simple elige un conjunto finito de niveles y mapea cada valor al nivel representable más
cercano, junto con parámetros como scale y, en algunos esquemas, zero-point. El error
entre el valor original y el representado es quantization error. En redes grandes, la
pregunta no es si existe error —existe— sino cómo se distribuye y cuánto afecta las
funciones que nos importan.

Los esquemas usados por llama.cpp son más sofisticados que “convierte cada float a un
int4 global”. Trabajan con bloques y tipos específicos, y las K-quants pueden asignar
diferentes tratamientos a tensores según el esquema. Por eso `Q4_K_M` no debe enseñarse
como “exactamente 4 bits por peso” sin matices. El nombre describe una familia de
quantization y una variante; el artefacto real contiene metadata de tipos por tensor.

El README oficial de `llama-quantize` describe la herramienta como transformación de un
GGUF de mayor precisión —por ejemplo F32 o BF16— a un formato cuantizado. Explica que
esto reduce tamaño y puede acelerar inference, pero puede introducir pérdida de accuracy
medida en métricas como perplexity o KL divergence, y menciona el uso de importance
matrices para reducir degradación en determinados workflows. [G-QUANT]

## 21. Por qué menos bits pueden ayudar al rendimiento

En muchos workloads de decode, mover pesos desde memoria hacia compute es una fracción
grande del coste. Si una representación reduce los bytes que deben moverse, puede
aliviar memory bandwidth pressure. Además, un modelo que antes no cabía en memoria puede
volverse viable. Esta es una de las razones físicas por las que quantization puede
acelerar inference.

Pero la palabra “puede” es esencial. Los kernels deben soportar eficientemente el
formato. Puede existir overhead de dequantization o conversión. Un backend puede estar
muy optimizado para un tipo y menos para otro. Prompt processing y decode tienen
perfiles diferentes. Una quantization más extrema puede reducir bytes y al mismo tiempo
ejecutar un kernel menos eficiente en cierto hardware. El speedup final es resultado del
sistema, no una propiedad del sufijo del archivo.

El paper *Which Quantization Should I Use?* intenta precisamente comparar formatos de
llama.cpp bajo una evaluación unificada sobre Llama-3.1-8B-Instruct, midiendo no solo
perplexity y benchmarks de calidad sino tamaño, tiempo de quantization y throughput CPU
para prefill/decode. [G-QPAPER] El valor de este trabajo es mostrar el tradeoff
multidimensional; sus rankings siguen perteneciendo a ese modelo y setup.

## 22. Calidad: por qué una diferencia pequeña puede importar mucho o nada

Perplexity resume qué probabilidad asigna un language model a una secuencia bajo un
corpus, pero no es equivalente a “quality de chatbot”. Benchmarks de reasoning,
knowledge, instruction-following y truthfulness capturan otras dimensiones y también
tienen límites. Una quantization puede producir una variación mínima promedio y fallar
precisamente en el tipo de output que tu aplicación necesita.

Por eso la selección productiva debe contener pruebas del dominio. Si el sistema genera
JSON estricto, mide validez estructural. Si responde en español, incluye preguntas en
español. Si opera sobre código, incluye código. La comparación pública reduce el espacio
de candidatos, pero la decisión final pertenece al workload.

Esta misma lógica explica por qué un modelo menor de mayor precisión puede competir con
uno mayor más cuantizado. Parameter count y precision son ejes diferentes. No existe una
fórmula simple donde “8B Q4 siempre supera 4B Q8”. Arquitectura, training, prompt, task,
hardware y runtime forman el resultado.

## 23. Requantization: aproximar una aproximación

Si el objetivo es producir una quantization Q4, la mejor fuente suele ser una
representación de mayor precisión. Quantizar desde un archivo ya cuantizado significa
partir de valores que ya contienen error de aproximación. El segundo proceso optimiza
sobre esos valores, no sobre el original, por lo que el error puede acumularse.

El tooling upstream advierte sobre esta práctica en sus notas y workflows. [G-QUANT] La
lección general es de provenance: un artefacto no se describe solo por su nombre final.
Para comparaciones serias conviene registrar de qué source weights se produjo, qué
versión de tooling, qué quant type y qué opciones se usaron.

Esa trazabilidad también sirve para reproducir una regresión. Si dos archivos se llaman
Q4_K_M pero uno fue quantized directamente desde BF16 y otro requantized desde Q8, el
sufijo no captura toda la historia que puede explicar diferencias.

## 24. Elegir un modelo es resolver un problema de restricciones

La pregunta “¿cuál es el mejor modelo local?” es demasiado vaga. Sustitúyela por una
restricción: necesitamos una calidad mínima Q, un TTFT tolerable, un throughput mínimo,
un context window determinado, un límite de RAM, un límite de disco y un backend
disponible. Ahora podemos comparar artefactos contra un objetivo.

En una máquina con 8 GB de RAM, un modelo que puntúa mejor en un benchmark pero no puede
cargarse no es una opción. En un workstation, una quantization menos agresiva puede
caber sin problema y conservar más calidad. En móvil, energía y temperatura pueden
dominar. La misma familia puede necesitar una elección distinta por dispositivo.

El resultado debería redactarse como una decisión condicional: “en esta máquina y para
este workload, este artefacto ofrece el mejor balance observado bajo nuestros
criterios”. Esa frase es revisable cuando cambia hardware o modelo. “Q4_K_M es siempre
el sweet spot” no lo es.

## 25. Volver a QVAC: model source no es model residency

La Introduction actual de QVAC documenta fuentes desde filesystem local, HTTP y registry
distribuido. Las constantes del SDK representan configuraciones de modelos publicados en
ese registry, pero el paquete no incluye los pesos dentro de npm. [Q-INTRO] El
`modelSrc` dice de dónde obtener o identificar el activo; no significa que el modelo ya
esté residente en memoria.

`loadModel()` lleva el sistema desde un source hasta una instancia registrada con un
`modelId`. El worker puede mantener múltiples modelos simultáneamente. [Q-HOW] Ese ID es
la identidad de la instancia cargada que operaciones como `completion()` utilizan.
Mientras permanece cargado, no necesitamos volver a interpretar “qué archivo” en cada
request.

`unloadModel()` libera los recursos de la instancia. La API actual dice que cuando se
descarga el último modelo y no quedan providers, Node/Electron puede cerrar
automáticamente la conexión RPC; en Bare la conexión queda abierta por default para
workers de larga vida, salvo `autoClose: true`. [Q-API] `close()` sigue siendo la forma
explícita de apagar el SDK/worker donde corresponde. Descargar un modelo no borra el
archivo cacheado.

```text
Model artifact lifecycle

model source
   │
   ├── registry constant
   ├── HTTP URL
   └── local filesystem
   │
   ▼
acquisition / validation
   │
   ▼
local bytes on disk
   │
   ▼
loadModel()
   │
   ▼
model instance in worker memory
   │
   ▼
modelId
   │
   ├── completion()
   ├── completion()
   └── completion()
   │
   ▼
unloadModel()
   │
   ▼
runtime resources freed
   │
   └── cached file may still exist
```

## 26. Por qué cargar por cada prompt es una mala arquitectura

Si una aplicación ejecuta `loadModel()` antes de cada mensaje y `unloadModel()` al
terminar, ha colocado model initialization dentro del hot path de interacción. Aunque el
archivo esté cacheado, loading implica trabajo: abrir/mmap, interpretar metadata, crear
estructuras y preparar el backend. Ese coste se repite innecesariamente.

Un chat tiene lifecycles diferentes. El modelo puede permanecer residente durante toda
una sesión o hasta que memory pressure aconseje descargarlo. Los prompts son requests
mucho más cortos. Separar ambos lifecycles reduce latencia y crea un lugar claro para
manejar errores de load.

La política tampoco debe convertirse en “cárgalo para siempre”. En una app multimodelo,
mantener LLM, embeddings, ASR y TTS simultáneamente puede superar memoria. Model
residency es una decisión de resource management. QVAC permite varias instancias, pero
la capacidad física la determina la máquina.

## 27. `qvac doctor` aparece porque ahora entendemos qué puede fallar

Antes de conocer artifacts y backends, un checklist de requisitos sería memorización.
Ahora sabemos por qué importa. Un loader necesita una plataforma soportada, un backend
de compute y memoria suficiente. La página de System Requirements actual documenta `qvac
doctor` para validar la parte machine-checkable del host. [Q-SYS]

Los requisitos incluyen diferencias por plataforma: Metal en Apple, Vulkan en entornos
documentados y fallbacks específicos. La página también advierte que QVAC no ejecuta la
ruta llama.cpp actual en emuladores móviles y requiere dispositivo físico. [Q-SYS] Estas
restricciones pertenecen al runtime vigente y pueden cambiar; por eso se citan como
versioned facts, no como propiedades eternas de local AI.

Pasar `qvac doctor` no garantiza que un artefacto grande quepa o tenga la velocidad
deseada. Es una precondición del entorno, no un admission controller perfecto. Después
necesitamos medir el modelo real.

## 28. Benchmark de carga: qué medir y qué escribir al lado del número

“Load time = 1.7 s” es casi inútil sin contexto. Necesitamos machine, OS, SDK, backend,
artefacto, file size, quantization y condición cold/warm. Si el primer load incluye
download, no estamos midiendo model load; estamos mezclando network provisioning con
initialization.

Una comparación entre quantizations debe controlar source y hardware. Si cambiamos
modelo, prompt, context y backend a la vez, el resultado describe dos sistemas completos
pero no permite atribuir la diferencia a quantization. Ambas clases de benchmark pueden
ser válidas; solo deben responder preguntas distintas.

La disciplina experimental que construimos aquí prepara la Clase 03. Hasta ahora medimos
la entrada del modelo a memoria. La siguiente etapa medirá lo que ocurre después de que
ya está residente.

## 29A. Metadata GGUF: el archivo necesita explicar cómo debe ser leído

Un blob de números no basta para reconstruir un modelo. El loader necesita saber qué
arquitectura representan, cómo se llaman los tensores, qué dimensiones tienen, qué
tokenizer corresponde y otras propiedades. GGUF resuelve esa necesidad mediante pares
key-value además de los tensor descriptors. [G-GGUF] La metadata convierte un archivo
binario en un artefacto autodescriptivo hasta el nivel que el formato y la arquitectura
soportan.

Pensemos en una consecuencia práctica. Si dos modelos tienen tensores con nombres
parecidos pero diferentes context lengths, vocabularies o architecture identifiers, un
loader no debería adivinar. Metadata explícita reduce ambigüedad. También permite
tooling de inspección que lee propiedades sin cargar todo el modelo para inference.

La extensibilidad tiene un límite importante: un executor viejo puede ignorar metadata
desconocida, pero no puede ejecutar mágicamente una arquitectura para la que no tiene
kernels o mapping de tensors. Formato extensible no significa runtime omnisciente. La
compatibilidad siempre es relación entre artefacto y software.

## 29B. Alignment, offsets y por qué la especificación habla como un sistema de archivos

El descriptor de cada tensor incluye un offset hacia el blob de datos y el formato
define alignment. [G-GGUF-H] Estas decisiones parecen de bajo nivel, pero afectan cómo
el loader puede acceder a regiones del archivo. Un tensor grande debe comenzar en una
frontera compatible con las expectativas del runtime para que mapping y acceso sean
eficientes y no ambiguos.

Este detalle ayuda a desmontar la idea de que GGUF es solo “JSON + weights”. Es un
formato binario diseñado para ejecutar. El layout físico forma parte del contrato.
Cuando un archivo está sharded o se usa un mecanismo distinto de almacenamiento, el
loader necesita otra capa que preserve la identidad lógica del modelo.

QVAC v0.18.0 añadió loading directo de sharded GGUFs desde disco según sus release
notes. [Q-REL] El detalle pertenece a la versión y no cambia el modelo mental: una
unidad lógica de modelo puede estar compuesta por varios archivos, aunque GGUF busque
single-file deployment en el caso no sharded.

## 29C. Una quantization escalar mínima para entender scale y error

Consideremos un bloque de valores reales entre un mínimo y un máximo. Si queremos
representarlos con un entero de b bits, solo tenemos un número finito de códigos. Un
esquema uniforme puede definir un scale que relaciona el rango real con esos códigos.
Cada valor se redondea al código más cercano y, durante uso, se reconstruye una
aproximación. El error local es la diferencia entre el valor original y la aproximación.

La reducción de bits funciona porque muchos cálculos toleran cierto error distribuido.
Pero no todos los pesos tienen la misma sensibilidad. Outliers y ciertos tensores pueden
contribuir más al comportamiento. Esa realidad motiva schemes por bloques, mixed
precision e importance-aware quantization. La simple ecuación escalar sirve para derivar
el problema, no para describir cada K-quant de llama.cpp.

Podemos pensar en la quantization como asignar un presupuesto de representación. Con más
niveles, el paso entre valores representables puede ser menor dentro de un rango. Con
menos, aumenta el error potencial pero disminuyen bytes. Los schemes modernos optimizan
cómo gastar ese presupuesto en vez de aplicar una regla global ingenua.

## 29D. Blocks: por qué un scale global sería demasiado tosco

Si un tensor contiene regiones con escalas muy diferentes, usar un único scale global
hace que valores pequeños pierdan resolución para poder cubrir los outliers. Dividir en
bloques permite calcular parámetros de quantization localmente. Cada bloque paga
metadata adicional pero obtiene una representación ajustada a su rango.

Este es uno de los motivos por los que “4 bits” no equivale a exactamente 0.5 bytes de
file por parámetro en el artefacto completo. Existen scales, metadata, alignment y quizá
tipos diferentes en tensores distintos. La medida efectiva `bits per weight` puede
aproximarse, pero el file size real es la autoridad para deployment.

La intuición también conecta con hardware. Un kernel optimizado sabe desempaquetar
bloques, aplicar scales y acumular operaciones. El layout del scheme y el kernel deben
estar diseñados juntos. Una quantization matemática sin un kernel eficiente puede
ahorrar almacenamiento y no dar el throughput esperado.

## 29E. Importance matrices: usar datos para decidir dónde duele el error

El README de llama-quantize menciona `imatrix` como mecanismo para minimizar pérdida en
determinadas quantizations. [G-QUANT] Conceptualmente, una importance matrix intenta
estimar qué partes de los pesos son más sensibles a la aproximación usando activaciones
o datos de calibración. La quantization puede preservar mejor información en regiones
que importan más para el comportamiento observado.

Esto introduce otra fuente de provenance. Dos quants con el mismo type pueden haber sido
producidos con calibration distinta. Si el dataset usado para importance no representa
el workload, el beneficio puede cambiar. De nuevo, el suffix del filename no captura la
historia completa.

La idea general es poderosa: compression no es solo un problema de bytes; es un problema
de dónde colocar error. En sistemas de ML, el error que importa es el que cambia outputs
bajo nuestras tasks, no una distancia numérica uniforme entre todos los pesos.

## 29F. File size, RAM, VRAM y working set no son la misma cantidad

Un modelo de 4 GB en disco no implica exactamente 4 GB de RAM total durante inference.
El runtime necesita estructuras adicionales, context/KV cache y buffers. Parte de los
weights puede estar memory-mapped o residir en GPU memory según backend. El sistema
operativo mantiene page cache. Por eso “cabe porque el archivo pesa menos que la RAM
libre” es solo una primera aproximación.

Al aumentar context, el working set cambia aunque el file size permanezca idéntico. Al
usar parallel completions, hay más secuencias y KV. Al cargar dos modelos, sus
residencies se suman con shared runtime overhead. Una model-selection decision debe
probar la configuración real, no solo comparar tamaños de Hugging Face.

QVAC expone `getModelInfo()` con cache state, expected size, quantization y loaded
instances en la API actual, y `getSystemResources()` para resource introspection.
[Q-API] Estas primitives ayudan a observar estado, pero ninguna cifra aislada reemplaza
un load real bajo la configuración objetivo.

## 29G. Cold, warm y hot: el vocabulario de benchmark necesita definición

“Cold load” puede significar que el modelo no está cargado pero el archivo está en page
cache; para otra persona significa caches del OS vacíos; para otra incluye descarga. Si
dos reports usan la misma palabra para condiciones distintas, la comparación es inútil.

Una taxonomía práctica separa al menos acquisition cold —asset ausente—, disk-resident
load —asset presente pero modelo no instanciado— y model-resident reuse —modelId ya
disponible—. Podemos además distinguir filesystem warm si repetimos un load después de
haber tocado el archivo. Lo importante es declarar la condición.

El módulo no necesita forzar términos universales; necesita enseñar a describir estados.
El benchmark reproducible comienza con una frase que permita a otra persona recrear el
estado inicial.


## 29H. Caso de selección: 4B de mayor precisión frente a 8B más cuantizado

Supongamos que tenemos dos candidatos que caben aproximadamente dentro del mismo storage
budget: un modelo de cuatro mil millones de parámetros con una representación
relativamente alta y un ocho mil millones altamente cuantizado. La tentación es declarar
ganador al 8B porque “tiene más parámetros”. Pero parameter count no especifica training
quality, architecture efficiency ni degradación por quantization. Tampoco especifica
cómo los kernels del dispositivo tratan cada formato.

La comparación debe comenzar por la tarea. Si necesitamos extracción estructurada,
preparamos un conjunto con schemas y edge cases. Si necesitamos diálogo en español,
medimos cumplimiento e idioma. Después registramos load time, TTFT y decode throughput
bajo el mismo hardware. Es posible que el 8B sea claramente mejor en quality y algo más
lento; es posible que el 4B cumpla el target con menor latency. Solo el requirement
convierte esa observación en decisión.

El memory budget incluye KV. Si ambos files caben, el modelo mayor puede dejar menos
margen para context largo. Un benchmark con prompt de 100 tokens no revela esa
diferencia. Debemos probar la configuración real de `ctx_size`. Asimismo, un Q4 que
libera memoria puede permitir un context que el modelo de mayor precisión no soporta
operacionalmente en esa máquina. Eso es una mejora del sistema aunque una métrica de
perplexity sea peor.

La conclusión correcta podría ser: “para laptop tier A usamos 4B porque alcanza 95% de
nuestro task acceptance con TTFT menor a 800 ms y deja margen para 8k de context; en
workstation tier B usamos 8B porque la mejora de quality justifica el coste”. La
arquitectura aplicativa permanece igual y la selección del artefacto se vuelve
adaptativa.

## 29I. GGUF frente a un tensor container de entrenamiento: una diferencia de intención

Formatos como safetensors pueden almacenar tensores de forma segura y eficiente para
ecosistemas de ML, pero un artefacto de deployment necesita además un contrato con su
executor. GGUF busca contener metadata suficiente para loaders GGML y facilitar
deployment. La diferencia no debe caricaturizarse como “safetensors es training y GGUF
inference” universalmente; ambos pueden participar en distintos workflows. La diferencia
que importa aquí es qué información y layout espera llama.cpp/QVAC para su ruta de text
generation.

La documentación de QVAC Text Generation especifica modelos de chat/texto compatibles
con llama.cpp y formato `.gguf`. [Q-TEXT] Esa es una constraint concreta del backend
vigente. Un checkpoint upstream puede necesitar conversión antes de que QVAC pueda
cargarlo como llamacpp-completion.

Separar ecosystem format de model identity también ayuda a evitar un error de
provenance. Convertir no crea un nuevo entrenamiento, pero quantizar después sí modifica
representación numérica. Si una respuesta cambia, debemos saber si comparamos pesos
equivalentes, conversion tooling distinto o quantization distinta.

## 29J. Model info y la diferencia entre catalog truth y local-path responsibility

La API actual de `getModelInfo()` expone información para modelos de catálogo: expected
size, cache files, sha256 checksums, quantization, cache/load state y loaded instances.
[Q-API] Ese nivel de introspection es posible porque el catalog conoce metadata del
artefacto. No debemos asumir la misma autoridad para un path arbitrario.

Cuando usamos un file local fuera del catálogo, la documentación de Download Lifecycle
dice que la aplicación es responsable de provisioning e integrity. [Q-DOWN] Podemos
calcular nuestro propio checksum y manifest. Esa responsabilidad es parte de “owning” el
asset.

Una organización que distribuye modelos internamente puede construir un catálogo privado
o manifest firmado encima de paths. El principio es el mismo: identidad de un artefacto
debe ser más fuerte que su nombre de archivo si queremos reproducibilidad y supply-chain
control.


## 29. Puntos de confusión de la Clase 02

GGUF no es quantization. Un GGUF puede contener distintos tipos de tensor; quantization
es una elección de representación. Tampoco es un ZIP: el objetivo no es recuperar
exactamente cada float original.

Más pequeño no implica universalmente más rápido. Reducir bytes puede aliviar memory
bandwidth y permitir que el modelo quepa, pero kernels, backend y overhead importan. Un
benchmark de CPU no se extrapola a Metal/Vulkan/NPU sin evidencia.

`unloadModel()` no borra el modelo de disco. Model residency y asset persistence son
lifecycles diferentes. `close()` tampoco es “delete”; apaga el worker/RPC en los
runtimes donde existe un worker separado. [Q-HOW]

## Para estudiar — Clase 02

Primera pregunta. Explica la cadena checkpoint → conversión → GGUF → quantization
opcional → load. ¿Qué información cambia en cada paso y cuál no necesita cambiar?

Segunda pregunta. Un Q4 ocupa la mitad de un Q8, pero en tu GPU el Q8 genera más rápido.
Construye tres explicaciones plausibles que no contradigan la teoría de quantization y
diseña la observación que distinguiría entre ellas.

Tercera pregunta. ¿Por qué un nombre de archivo no basta para reproducir una
quantization? Incluye source precision, tooling, scheme y cualquier información de
provenance que consideres necesaria.

Cuarta pregunta. Diseña una model-selection decision para dos laptops con diferente RAM.
La misma aplicación debe mantener calidad mínima pero puede escoger artefactos
distintos. Explica por qué eso no viola la idea de una arquitectura común.

Quinta pregunta. Demuestra conceptualmente por qué medir un primer `loadModel()` que
descarga 2 GB y compararlo con un segundo `loadModel()` desde cache no es una
comparación de “cold vs warm model initialization” pura.

## Transición — Sabemos qué está cargado; ahora el tiempo importa

El modelo ya no es una caja abstracta: conocemos su artefacto, representación y
residency. Pero `completion()` todavía parece una operación mágica que consume history y
emite texto. La próxima pregunta ocurre en milisegundos y segundos: ¿qué trabajo tiene
que suceder entre el prompt y el primer token, y por qué el segundo token cuesta algo
diferente del primero?

---

# Clase 03 — Local Inference Fundamentals

## 30. El modelo no recibe palabras

Escribimos caracteres y pensamos en palabras, pero el modelo autoregresivo opera sobre
IDs de tokens. Un tokenizer transforma texto en una secuencia discreta perteneciente a
un vocabulary. Según el tokenizer, una palabra puede ser un token, varios subword tokens
o combinarse con espacios/puntuación de maneras que no coinciden con nuestra intuición
visual.

Esta representación importa porque el context window se mide en tokens. Dos textos con
el mismo número de caracteres pueden consumir presupuestos distintos, especialmente
entre idiomas, código y formatos. Por eso las reglas “un token son 0.75 palabras” son
aproximaciones estadísticas, no contratos de un modelo concreto.

El tokenizer es parte del artefacto lógico del modelo. Si se tokeniza con una convención
incompatible, los IDs dejan de representar las unidades sobre las que los pesos fueron
entrenados. GGUF puede incluir metadata de tokenizer precisamente porque loading
necesita más que tensores.

## 31. De IDs a predicción del siguiente token

Una vez que tenemos una secuencia de IDs, el modelo calcula representaciones internas y
produce logits para candidatos del vocabulary en la posición siguiente. Un logit es una
puntuación real antes de convertirla en una distribución normalizada. El softmax
transforma un vector de logits z en probabilidades relativas mediante exponentiales:
\(p_i = e^{z_i}/\sum_j e^{z_j}\).

El modelo no produce una oración completa de una sola vez en la forma autoregresiva
clásica. Selecciona un token, lo añade al contexto operativo y repite. El siguiente paso
ahora condiciona también en el token que acaba de producir. Esta dependencia hace que la
generación sea secuencial a nivel de posiciones de output: no podemos conocer el token
20 exactamente antes de decidir los 19 anteriores.

PHOTON aparece en las fuentes como investigación que intenta replantear precisamente esa
estructura horizontal token-by-token mediante representación jerárquica y
multi-resolution. El paper reporta grandes ventajas de throughput por memoria en sus
modelos/experimentos, pero es una arquitectura de investigación, no una descripción de
cómo funciona el backend actual de QVAC. [I-PHOTON] Su utilidad aquí es mostrar que la
secuencialidad y el tráfico de KV son cuellos de botella tan importantes que motivan
nuevas arquitecturas.

```text
Autoregressive loop

history / prompt
      │
      ▼
 tokenization
      │
      ▼
[ t1, t2, ... tn ]
      │
      ▼
model forward state
      │
      ▼
logits for token n+1
      │
      ▼
sampling / decoding rule
      │
      ▼
selected token
      │
      └─────────────── append ──────────────┐
                                            │
                                            ▼
                                      next iteration
```

## 32. El primer token y los demás no pagan exactamente el mismo trabajo

Antes de generar el primer token, el modelo tiene que procesar todo el prompt inicial.
Esa fase se denomina prefill o prompt processing. Muchos tokens de input ya se conocen
simultáneamente, por lo que parte del cálculo puede explotarse con más paralelismo que
el bucle de decode.

Después del primer token empieza decode: cada step depende del token anterior. El
runtime reutiliza estado del pasado y calcula la siguiente posición. Aunque cada step
procesa menos tokens nuevos, la secuencialidad reduce ciertas oportunidades de
paralelismo y el movimiento de pesos/KV puede dominar.

Esta separación explica por qué dos workloads con el mismo número total de tokens pueden
sentirse diferentes. Un prompt de 8 000 tokens que solicita diez tokens tiene un gran
componente de prefill. Un prompt de 50 tokens que genera 2 000 hace relativamente poco
prefill y mucho decode. Una sola cifra “tokens por segundo” puede ocultar cuál etapa
estamos midiendo.

## 33. `llm.npu` vuelve a aparecer ahora con un significado más preciso

En Clase 01 dijimos que `llm.npu` optimiza on-device inference. Ahora podemos explicar
qué parte. El paper identifica prefill como cuello de botella importante en tasks como
screen UI understanding y construye un sistema de offload hacia NPU mediante
transformaciones a nivel de prompt, tensor y block, ejecutando ciertas partes en CPU/GPU
en paralelo según afinidad y sensibilidad. [A-LLMNPU]

El resultado de más de 1 000 tokens/s de prefill para un modelo de mil millones de
parámetros en su plataforma es llamativo, pero no describe decode y no debe convertirse
en “el modelo genera 1 000 tokens/s”. Prefill throughput y output token throughput son
métricas distintas. Este ejemplo demuestra por qué los nombres de las métricas importan.

El diseño también enseña que hardware acceleration no se reduce a “mover todo a la NPU”.
Los autores separan outliers y blocks según suitability. El systems lesson es
heterogeneity: el acelerador óptimo puede cambiar por operación y fase.

## 34. TTFT, decode throughput y latencia total

Time to First Token mide el tiempo desde que lanzamos la petición hasta que el usuario o
consumer recibe el primer contenido. Incluye trabajo previo a la primera salida:
scheduling, tokenization en el path que corresponda, prompt processing y overhead de
software. En un sistema remoto incluiría además comunicación. En local desaparece ese
componente remoto, pero no desaparece prefill.

Decode throughput suele expresarse en output tokens por segundo. Describe la velocidad
sostenida de la fase autoregresiva bajo una condición. Total latency es el intervalo
completo hasta terminar. Para respuestas breves, TTFT puede dominar la percepción. Para
respuestas largas, throughput de decode domina el tiempo final.

Streaming modifica cuándo vemos output, no necesariamente cuánto compute hace el modelo.
Una UI que muestra el primer delta a los 400 ms se siente más rápida que una que espera
cinco segundos para imprimir la respuesta completa, aunque ambas hayan terminado en los
mismos cinco segundos. Perceived latency y model throughput deben mantenerse separados.

## 35. Una mirada mínima a attention antes de hablar de cache

Para entender KV cache necesitamos un poco de Transformer, pero no toda su derivación.
En self-attention, cada posición produce representaciones que se proyectan
conceptualmente en queries, keys y values. La query de una posición compara con keys de
posiciones relevantes y combina values según los pesos de atención. Durante generación
causal, el token nuevo puede atender a tokens anteriores.

Sin cache, al generar una nueva posición tendríamos que reconstruir repetidamente keys y
values de tokens pasados que no cambiaron. Ese trabajo es redundante. Si almacenamos los
K y V ya calculados para el prefix, cada decode step necesita producir el estado del
token nuevo y consultar el pasado almacenado.

Ahora KV cache deja de ser una “opción de velocidad” misteriosa. Es una estructura
concreta que intercambia memoria por recomputación. El tiempo que ahorra depende de
cuánto prefix puede reutilizarse y del workload; el coste aumenta con secuencia, capas,
heads/dimensiones y dtype. El detalle exacto varía por arquitectura, pero la relación
general es física.

## 36. KV cache no es memoria conversacional

La palabra cache provoca una confusión productiva. Si el modelo “tiene cache”, ¿recuerda
la conversación? No en el sentido de producto. KV cache contiene estado numérico
derivado de un prefix bajo un modelo y configuración concretos. No es el transcript
autoritativo. Si borras el cache pero conservas history, puedes recomputar. Si conservas
cache pero pierdes el transcript, no tienes necesariamente una representación durable y
portable de la conversación que tu aplicación pueda editar, migrar o mostrar.

Tampoco es RAG. RAG recupera conocimiento externo según una query; KV cache evita
repetir cálculo sobre tokens ya procesados. Ambos pueden ahorrar trabajo de formas
diferentes, pero sus semánticas no se parecen.

Esta distinción prepara la Clase 04: conversation state pertenece a la aplicación; KV
state pertenece al runtime de inferencia. Una buena arquitectura puede usar ambos y
mantener sus lifecycles separados.

## 37. CachedAttention: por qué multi-turn vuelve caro lo que ya calculamos

En una conversación multi-turn convencional, cada nueva request incluye una historia más
larga. Si el serving engine reconstruye KV de toda la historia una y otra vez, repite
prompt processing. CachedAttention estudia este problema y propone guardar/reutilizar KV
de requests anteriores mediante una jerarquía de memoria/storage, junto con prefetching
y scheduling. [A-CACHED]

El paper reporta reducciones de TTFT de hasta 87%, mejoras de prompt prefilling
throughput de hasta 7.8x y reducciones de coste de hasta 70% en sus experimentos.
[A-CACHED] Es importante conservar “hasta” y “en su sistema”. El resultado no predice
directamente lo que veremos con `kvCache: true` en QVAC sobre una laptop.

Lo que sí transferimos es el mecanismo: los prefixes repetidos contienen trabajo
reutilizable, pero guardarlo crea una jerarquía de memoria y políticas de eviction. La
cache no es gratis.

## 38. Por qué KV cache puede convertirse en el problema de memoria dominante

A medida que crecen context length y número de secuencias concurrentes, el KV cache
crece. En modelos de contexto largo, mover y mantener ese estado puede superar otras
partes del memory footprint. KV-CAR describe KV cache como un bottleneck de memoria
durante decode y propone compresión con autoencoders más reuse entre heads/layers; en
sus experimentos sobre GPT-2 y TinyLLaMA reporta hasta 47.85% de reducción con impacto
limitado en sus métricas. [I-KVCAR]

CSR aborda el mismo problema mediante sparse representation y un dictionary aprendido;
Lexico usa sparse coding con diccionarios universales. [I-CSR] [I-LEXICO] Son señales de
una línea de research: si KV fuera una estructura insignificante, no existiría esta
diversidad de trabajos para comprimirla.

Ninguna de estas técnicas debe enseñarse como feature de QVAC. La documentación actual
de QVAC expone caching y políticas de persistencia propias; no dice que implemente
KV-CAR, Lexico o CSR. Los papers sirven para entender por qué el recurso importa, no
para describir el SDK.

## 39. El contrato actual de `kvCache` en QVAC

La página actual de Text Generation especifica tres formas. Un string no vacío actúa
como key caller-managed: la aplicación controla identidad y puede borrar con
`deleteCache({ kvCacheKey })`. `true` activa auto cache gestionado por el SDK, que
deriva la identidad de la conversación. `false` o `undefined` significa sin caching y es
el default. [Q-TEXT]

Las auto caches actuales tienen una política de retención documentada: 24 horas de idle
o presión de cuota, con 512 MiB en React Native y 4 GiB en otros runtimes. Las caches
con string caller-managed no están sujetas a esa retención automática. [Q-TEXT] Estos
números son facts de versión y deben revalidarse si el curso se actualiza.

Notemos la semántica: `kvCache` es tanto enable como identidad. No existe un parámetro
separado `kvCacheKey` en `completion()` según la página vigente. Inventar uno a partir
de una versión antigua produciría código incorrecto.

## 40. De logits a decisiones: primero greedy

Volvamos al loop autoregresivo. El modelo produce logits; necesitamos una regla que
elija. La más directa es greedy decoding: escoger el candidato de mayor probabilidad en
cada step. Es determinista bajo condiciones deterministas y parece racional si
confundimos “más probable localmente” con “mejor secuencia global”.

Ese salto es peligroso. Un language model fue entrenado para asignar probabilidad, pero
la mejor estrategia para producir texto humano no tiene por qué ser maximizar en cada
paso. Holtzman y colaboradores estudian neural text degeneration y observan que
estrategias de maximización pueden producir texto bland, incoherente o repetitivo en
open-ended generation. [A-DEGEN]

El insight es profundo: quality del modelo y decoding policy son capas diferentes.
Podemos usar exactamente los mismos pesos y producir comportamientos cualitativamente
distintos solo cambiando cómo elegimos el siguiente token.

## 41. Temperature como transformación matemática, no slider de creatividad

Temperature modifica logits antes del softmax. En la forma habitual usamos \(p_i(T) =
rac{e^{z_i/T}}{\sum_j e^{z_j/T}}\). Con T menor que 1, las diferencias entre logits se
amplifican en la distribución y esta se concentra. Con T mayor que 1, se aplana y
candidatos menos probables obtienen más masa relativa.

Cuando T tiende a cero, la distribución se concentra fuertemente en el máximo,
acercándose al comportamiento greedy bajo condiciones habituales. Eso no significa que
“T=0 produce verdad”. Solo reduce stochasticity en selección. Si el candidato de mayor
probabilidad es incorrecto, la baja temperatura no corrige conocimiento.

La metáfora “creativity slider” es pobre porque high temperature puede afectar formato,
idioma y coherencia. El trabajo de Language Confusion encuentra que temperaturas altas
agravaron respuestas en idioma incorrecto en varios modelos y prompts evaluados.
[A-LANG] La política de sampling cambia un sistema conductual completo, no una variable
estética aislada.

## 42. Top-k: limitar cardinalidad

Top-k ordena candidatos por score/probabilidad y restringe sampling a los k mejores. A
diferencia de temperature, no cambia solo la forma relativa; elimina explícitamente la
cola fuera del conjunto. Con k pequeño, la distribución candidata es estrecha; con k
grande, permite más alternativas.

La debilidad conceptual es que k es fijo aunque la distribución cambie. En un paso, los
primeros cinco tokens pueden contener casi toda la masa; en otro, la probabilidad puede
estar dispersa entre decenas. Top-k trata ambos con la misma cardinalidad.

Esto prepara top-p, que responde a la forma de la distribución. Sebastian Raschka ofrece
una explicación pedagógica clara de cómo temperature, top-k y top-p actúan sobre la
selección, pero las definiciones matemáticas y el paper original de nucleus son las
referencias más fuertes para el concepto. [S-RASCHKA] [A-DEGEN]

## 43. Nucleus sampling: una frontera que cambia con cada token

Top-p, o nucleus sampling, elige el conjunto mínimo de tokens más probables cuya masa
acumulada alcanza un umbral p y después samplea dentro de ese núcleo. Si la distribución
está muy concentrada, el conjunto puede ser pequeño. Si es plana, puede crecer. La
cardinalidad se adapta al step.

Holtzman et al. motivan nucleus sampling al observar una “unreliable tail” en la
distribución para generación abierta y buscan preservar diversidad truncando esa cola.
[A-DEGEN] El aporte histórico no implica que top-p sea siempre la mejor política para
cualquier task moderno; muestra por qué maximum-likelihood training no convierte
maximization-based decoding en una elección obvia.

Temperature y top-p pueden combinarse: una transforma la distribución y otra selecciona
un núcleo sobre la distribución resultante según la implementación. Cambiar ambas a la
vez hace difícil atribuir una diferencia experimental. En clase, primero modificamos una
sola variable y solo después estudiamos interacciones.

## 44. Context window como presupuesto de sistemas

El context window contiene lo que el modelo puede atender en una completion: system
instructions, conversation history, prompt actual y, en módulos futuros, evidencia de
RAG o tool results. Es un recurso finito. Aumentarlo cambia prompt processing y KV
cache; también puede cambiar quality por cómo el modelo utiliza context largo.

QVAC v0.18.1 expone descripciones de schemas y documenta `ctx_size`: el release note
muestra que `0` usa el context length entrenado y que el default del campo descrito es
1024 en ese schema. [Q-REL] En material runnable debemos verificar la config del
modelo/versión en vez de copiar un valor global.

La app de Clase 04 tendrá que decidir cuánto history incluir. Eso no es un detalle de
UI; es una política de resource allocation. Una conversación que crece sin límite
eventualmente choca con el budget.

## 45. Streaming: el runtime no devuelve «un string»

La API actual de QVAC declara `completion()` como un `CompletionRun` con un iterable
async ordenado `events` y una Promise agregada `final`. Los eventos discriminados
incluyen `contentDelta`, `thinkingDelta`, `toolCall`, `toolError`, `completionStats`,
`completionDone` y `rawDelta`. [Q-TEXT] Para esta clase nos concentramos en contenido,
stats y terminación.

Este modelo refleja la realidad temporal. Durante inference el sistema conoce cosas
incrementalmente. El texto aparece en deltas. Las stats pueden emitirse. Al final llega
una razón de terminación. Pensar en eventos permite construir UI, cancelación y
observabilidad sin pretender que toda la operación es un valor atómico.

`final` agrega `contentText`, thinking, tool calls, stats y raw output cuando aplica. La
página actual declara que wrappers como `tokenStream` y `toolCallStream` siguen
soportados como conveniences alrededor de la superficie canónica, y que el nuevo código
debería preferir `events`/`final`. [Q-TEXT]

```typescript
import {
  completion,
  loadModel,
  unloadModel,
  QWEN3_600M_INST_Q4,
} from "@qvac/sdk";

const modelId = await loadModel({
  modelSrc: QWEN3_600M_INST_Q4,
  modelConfig: { ctx_size: 4096 },
});

try {
  const startedAt = performance.now();
  let firstContentAt: number | undefined;

  const run = completion({
    modelId,
    history: [{
      role: "user",
      content: "Explica la diferencia entre prefill y decode.",
    }],
    stream: true,
    kvCache: true,
  });

  for await (const event of run.events) {
    if (event.type === "contentDelta") {
      firstContentAt ??= performance.now();
      process.stdout.write(event.text);
    }

    if (event.type === "completionStats") {
      console.error("\nstats event:", event.stats);
    }

    if (event.type === "completionDone") {
      console.error("\nstopReason:", event.stopReason);
    }
  }

  const final = await run.final;

  console.error({
    appMeasuredTTFT:
      firstContentAt === undefined ? undefined : firstContentAt - startedAt,
    appMeasuredTotal: performance.now() - startedAt,
    sdkStats: final.stats,
  });
} finally {
  await unloadModel({ modelId });
}
```

## 46. Stop reason es información, no decoración

Una generation puede terminar porque el modelo emitió end-of-sequence, porque alcanzó un
límite, porque el usuario canceló o por un error. La página de Text Generation da
ejemplos como `eos`, `length` y `cancelled` en `completionDone.stopReason`. [Q-TEXT] La
aplicación debe conservar esa diferencia.

`length` no es un crash. Significa que una restricción de longitud terminó el output. Un
texto puede quedar truncado y aún ser parcialmente útil. `cancelled` expresa una
decisión externa. `error` necesita otra ruta. En Clase 04 la política de commit decidirá
qué estado persistir para cada terminación.

La observabilidad mejora cuando no convertimos todos los finales no-eos en `catch`.
Algunas terminaciones son parte del contrato normal de una request.

## 47. Profiler: ¿cómo sabemos dónde se fue el tiempo?

Medir `Date.now()` alrededor de una función da wall-clock desde la aplicación. Eso es
valioso porque representa la experiencia externa. Pero no explica qué parte del SDK
consumió el tiempo. QVAC expone un `profiler` process-wide en JS/TS, habilitable
globalmente o por llamada, con export de summary, table y JSON; también puede incluir
breakdown y resource gauges según configuración actual. [Q-PROF]

El profiler no sustituye la medición de la UI. Si wall-clock y timing interno divergen,
esa diferencia puede revelar overhead de rendering, queueing, serialización o trabajo
fuera del SDK. Dos instrumentos responden preguntas complementarias.

Los resource gauges son diagnósticos, no una promesa de admission. Un snapshot de
memoria no garantiza que el siguiente model load vaya a ser seguro. El propio curso debe
resistir la tentación de convertir instrumentation en policy universal.

## 48. Serving research como espejo de los mismos recursos

El survey de LLM Inference Serving revisa optimizaciones de sistemas como memory
management, scheduling y serving desde 2023. [I-SURVEY] Aunque el módulo se centra en
local single-user, los mismos recursos reaparecen: weights, KV cache, batching, context
y device utilization. El entorno cambia de escala, no de física.

El trabajo sobre Pareto-optimal throughput para Small Language Models observa que
modelos pequeños pueden caber de forma que la utilización de un solo accelerator permite
estrategias como replication para mejorar throughput dentro de resource capacity.
[I-PARETO] No necesitamos convertir la clase en un servidor multiuser para extraer la
lección: model size y resource occupancy determinan qué paralelismo es posible.

QVAC v0.18.0 añadió soporte documentado para varias completions concurrentes sobre un
modelo cargado cuando `modelConfig.parallel >= 2`; la página actual explica que
`ctx_size` se divide entre slots paralelos. [Q-TEXT] Esto es otro ejemplo de un
tradeoff: aumentar concurrency puede reducir context disponible por request.

## 49. Diseñar experimentos que puedan estar equivocados

Un experimento de context length debería mantener modelo, output budget y sampling
constantes y cambiar solo el history/prompt. Nuestra predicción es que más input puede
elevar TTFT por más prefill. Pero un resultado plano no “demuestra que context no
importa”; puede indicar que la diferencia era pequeña, que cache intervino o que el
instrumento tiene ruido. La hipótesis necesita una escala de cambio suficiente.

Un experimento de KV cache compara un follow-up con prefix reutilizable contra una
condición sin cache. Esperamos mayor impacto cuando el prefix es largo; con diez tokens
quizá el overhead de cache sea comparable al trabajo evitado. Un resultado sin speedup
no falsifica la utilidad de KV de forma universal; falsifica una expectativa bajo esa
condición.

Para sampling, usamos varias repeticiones porque el output es stochastic. Si cambiamos
temperature, medimos variabilidad, cumplimiento, idioma y estructura, no solo “me gustó
más”. Para top-p hacemos otro experimento. El objetivo no es encontrar el setting
perfecto; es aprender qué mecanismo cambió.

## 50A. Byte Pair Encoding y por qué «subword» resuelve un compromiso

Un vocabulary con una entrada para cada palabra imaginable sería enorme y aun así
fallaría con nombres nuevos, errores tipográficos o lenguajes productivos. Un vocabulary
de caracteres sería universal pero produciría secuencias largas. Subword tokenization
ocupa un punto intermedio: unidades frecuentes pueden representarse compactamente y
palabras raras se descomponen en piezas.

Byte Pair Encoding y familias relacionadas construyen vocabularies a partir de
frecuencias o merges aprendidos. Para este módulo no necesitamos reimplementar el
trainer, pero sí entender el tradeoff: vocabulary size y sequence length están
acoplados. Cambiar tokenizer cambia los IDs y la longitud efectiva del context.

Esta es la razón por la que comparar “un prompt de 2 000 palabras” entre modelos no
controla realmente la cantidad de input. El experimento correcto usa token count del
tokenizer de cada modelo o, si compara el mismo modelo, mantiene la secuencia exacta.

## 50B. Softmax: de puntuaciones no normalizadas a masa probabilística

Los logits pueden ser positivos, negativos y no suman uno. Softmax usa exponenciales
para convertir diferencias aditivas en razones de probabilidad. Si un logit supera a
otro por Δ, antes de normalizar su factor relativo es \(e^{\Delta}\). Por eso
diferencias aparentemente pequeñas pueden concentrar mucha masa.

Numéricamente, implementations estables restan el logit máximo antes de exponentiar para
evitar overflow; esta transformación no cambia las probabilidades porque multiplica
numerador y denominador por el mismo factor. El detalle sirve para recordar que la
matemática teórica y la implementación deben cuidar finite precision.

Sampling opera sobre esta distribución transformada o sobre variantes truncadas. Cuando
modificamos temperature, no estamos cambiando los logits producidos por los weights;
estamos cambiando cómo los interpretamos para selección.

## 50C. Temperature vista como escala de diferencias

Dividir logits por T modifica sus separaciones efectivas. Si T=0.5, una diferencia Δ se
convierte en 2Δ antes del softmax y la razón exponencial se vuelve más extrema. Si T=2,
la diferencia se reduce a Δ/2 y la distribución se aplana. Esta perspectiva explica el
efecto sin recurrir a metáforas de personalidad.

En el límite conceptual T→0+, la masa se concentra en el máximo; si hay empates o
detalles de implementación, el comportamiento exacto necesita especificación. T→∞ hace
que diferencias finitas se vuelvan pequeñas y la distribución se acerque a uniforme
sobre candidatos antes de otros filtros. Esos límites muestran qué variable estamos
manipulando.

Top-k y top-p después pueden recortar el espacio. Una temperature alta seguida de top-p
pequeño no equivale a temperature alta sin truncation. El sistema de sampling es una
composición de transformaciones.

## 50D. Prefill como cálculo matricial y decode como flujo memory-bound

Durante prefill, muchas posiciones del prompt están disponibles y los aceleradores
pueden usar operaciones matriciales grandes con alto paralelismo. Durante decode, cada
step añade una posición y la dependencia temporal reduce el tamaño del trabajo nuevo. En
muchas arquitecturas/hardware, decode termina limitado por mover weights y KV con poca
aritmética por byte en comparación con prefill.

Esta diferencia ayuda a entender por qué optimizaciones de serving separan prefill y
decode o incluso los ejecutan en recursos distintos. El survey de serving recopila una
amplia clase de técnicas de scheduling, batching y memory management construidas
alrededor de estas propiedades. [I-SURVEY]

Para local AI, la conclusión práctica es medir fases. Una GPU puede tener TFLOPS enormes
y aun así un pequeño decode batch no saturar compute. Una CPU con buena memory bandwidth
puede ser competitiva en ciertos quants. Las especificaciones de pico del fabricante no
predicen tokens/s sin considerar el workload.

## 50E. Una aproximación al tamaño de KV cache

Sin fijar una arquitectura concreta podemos construir una fórmula conceptual. Cada token
guarda keys y values por layer para un cierto número de heads/dimensión y dtype. Si
llamamos L al número de layers, S a sequence length, H_kv al número de KV heads, D a
head dimension y B a bytes por elemento, una aproximación común para un cache denso es
proporcional a \(2     imes L  imes S  imes H_{kv}     imes D  imes B\). El factor 2
representa K y V.

La fórmula no pretende reemplazar la documentación de un modelo: grouped-query
attention, quantized KV y layouts internos cambian detalles. Su valor es mostrar
relaciones. Duplicar sequence length duplica este término. Usar un dtype de la mitad de
bytes reduce el componente proporcionalmente. Multiplicar secuencias concurrentes
aumenta el total.

Ahora podemos entender por qué context length y parallel slots compiten por memoria. Un
modelo puede caber perfectamente con 2k de context y fallar con 32k, aunque los weights
no hayan cambiado.

## 50F. Prompt reuse no es lo mismo que output cache

KV cache acelera cálculo cuando el prefix coincide de la forma que el runtime puede
reutilizar. No devuelve una respuesta almacenada. El modelo sigue decodificando tokens
nuevos. Un output cache, en cambio, podría asociar un prompt a una respuesta previa y
devolverla sin inference. Ambas técnicas pueden reducir latencia, pero demuestran cosas
distintas.

Esta diferencia importa para el Airplane-Mode Test. Si preguntamos exactamente lo mismo
y una app tiene output cache, obtener la misma respuesta no prueba una generation nueva.
Una pregunta nueva o un nonce semánticamente inocuo reduce ese falso positivo.

También importa para privacidad: una output cache contiene texto legible; KV cache
contiene estado numérico. Ambos pueden ser sensibles, pero su lifecycle y uso son
diferentes.

## 50G. `completionStats` y métricas: leer lo que existe, no inventar fields

La página actual de Text Generation muestra `completionStats` con `event.stats` y el
`final.stats`, e ilustra `tokensPerSecond`. [Q-TEXT] La API Summary es intencionalmente
de alto nivel y no expone en la página todos los fields anidados de completion stats.
Por eso esta edición no afirma que `generatedTokens` o `emittedTokens` sean fields
públicos actuales solo porque aparecieron en release notes antiguas.

La aplicación siempre puede medir TTFT y total wall-clock externamente, como hace
nuestro snippet. Esa medida tiene una ventaja: no depende de un field interno. El SDK
stats añade información cuando está disponible. Un curso que sobrevive versiones debe
separar métricas que podemos medir desde el boundary de app de fields versionados de una
API.

Si una nueva versión añade o renombra stats, el concepto de TTFT no cambia. Esta
separación entre concepto y surface es uno de los objetivos del bootcamp.

## 50H. Concurrencia: el modelo puede tener más de una request en vuelo

QVAC v0.18.0 añadió concurrent completions en un mismo loaded LLM. La documentación
actual explica que `modelConfig.parallel >= 2` abre slots y que requests adicionales
hacen queue; cada completion mantiene su propio `requestId`, events, final y stats.
[Q-TEXT]

El detalle que convierte esto en systems lesson es `ctx_size`: el context total se
divide entre slots paralelos. Un `ctx_size` de 4096 con `parallel: 4` deja alrededor de
1024 tokens por request según el ejemplo oficial. [Q-TEXT] Aumentar throughput
concurrente reduce un recurso por request si no aumentamos el context allocation.

Por eso “parallel=4 es cuatro veces más rápido” sería una mala inferencia. Depende del
batching, hardware, longitud de requests y queue. Además cambia la capacidad de context.
La feature añade un eje al Pareto surface, no un botón gratuito.

## 50I. Stop sequences, EOS y longitud como semántica de control

Un modelo puede terminar porque predice un end-of-sequence token o porque el runtime
aplica una condición externa. Desde el usuario ambos casos parecen “dejó de escribir”,
pero para la aplicación son distintos. `stopReason` permite convertir esa diferencia en
data de dominio.

Un output que termina por `length` puede necesitar un botón Continue, una marca de
truncation o una política de no-commit si el formato requiere cierre. Un output `eos`
suele indicar terminación natural bajo el modelo. Un `cancelled` expresa intervención.
Ninguna de estas razones debe deducirse mirando el último carácter del texto.

La state machine de Clase 04 se apoya en esta señal. Un good API surface no solo entrega
bytes; entrega causa de terminación.


## 50J. Ejemplo numérico: tres logits y una temperature que cambia la distribución

Tomemos un vocabulary de juguete con tres candidatos A, B y C y logits [4, 3, 1]. No son
probabilidades. Si restamos el máximo para estabilidad obtenemos [0, -1, -3]. Con T=1,
softmax es proporcional a [1, e^-1, e^-3], aproximadamente [1, 0.368, 0.050]. Al
normalizar, A recibe cerca de 70.5%, B 25.9% y C 3.5%. La distribución tiene un
favorito, pero no es determinista.

Con T=0.5 dividimos los logits originales por 0.5, equivalente a duplicar diferencias.
Después de restar máximo tenemos [0, -2, -6]. Los factores son aproximadamente [1,
0.135, 0.0025], por lo que A concentra alrededor de 87.9%. No “volvimos más inteligente”
al modelo; solo convertimos la misma preferencia en una decisión más concentrada.

Con T=2, las diferencias se reducen: [0, -0.5, -1.5]. Los factores [1, 0.607, 0.223]
producen una distribución más plana, alrededor de 54.6%, 33.1% y 12.2%. Ahora C aparece
con mucha más frecuencia. Este ejemplo explica por qué high temperature puede aumentar
cambios de idioma o violaciones de formato: tokens que el modelo consideraba menos
probables reciben una fracción mayor de la masa.

Si aplicamos top-p=0.9 a la primera distribución, A+B ya suman alrededor de 96.4%, así
que C queda fuera del nucleus. Con la distribución T=2, A+B suman cerca de 87.7%, por lo
que para alcanzar 0.9 también necesitamos C. La interacción es visible: temperature
cambió cuántos tokens necesita el mismo p. Sampling parameters no son controles
independientes en efecto, aunque sean knobs separados.

## 50K. Ejemplo numérico: estimar KV cache sin pretender exactitud universal

Consideremos un modelo hipotético de 32 layers, 8 KV heads, head dimension 128 y KV en
FP16, dos bytes por elemento. Para una secuencia de 4 096 tokens, la aproximación densa
\(2 × L × S × H_{kv} × D × B\) da 2 × 32 × 4096 × 8 × 128 × 2 bytes, aproximadamente 536
870 912 bytes: unos 512 MiB. El número no describe automáticamente un modelo real, pero
hace tangible la escala.

Si el context pasa a 16 384, el término de sequence length se cuadruplica y esta
aproximación llega a unos 2 GiB. Los weights no cambiaron. Si servimos cuatro secuencias
independientes con caches equivalentes, el total potencial vuelve a crecer. Ahora
resulta evidente por qué un modelo que “cabe” con un prompt corto puede entrar en memory
pressure con context largo o concurrency.

Grouped-query attention reduce H_kv respecto del número total de query heads en muchas
arquitecturas modernas, lo que reduce cache comparado con multi-head attention
convencional. KV quantization puede reducir B. Sistemas de compression como CSR o KV-CAR
atacan otros factores. [I-CSR] [I-KVCAR] La fórmula es un mapa para entender esas
optimizaciones.

El experimento local puede aproximar el efecto midiendo resource gauges o memoria del
proceso bajo context sizes crecientes, pero el profiler y el OS pueden reportar cosas
diferentes. Lo importante es observar tendencia y declarar instrumento.

## 50L. Ejemplo de queueing con `parallel`: throughput no es latency individual

Supongamos un modelo que tarda aproximadamente dos segundos por request en una carga
determinada con `parallel: 1`. Cuatro requests simultáneas pueden terminar
secuencialmente cerca de 2, 4, 6 y 8 segundos. Con slots paralelos, QVAC puede admitir
varias juntas y el grupo puede terminar más cerca de la duración de la más lenta, según
backend y batching. [Q-TEXT] Pero cada request comparte recursos.

Si `ctx_size` total es 8192 y usamos `parallel: 4`, la documentación indica que el
context se divide entre slots, alrededor de 2048 por request. [Q-TEXT] Una conversación
que antes cabía en 6k ya no cabe. Aumentar `ctx_size` para compensar aumenta memory. El
throughput del servidor local y la capacidad de conversación entran en tensión.

Además, cuatro users interactivos no llegan necesariamente al mismo tiempo. Queueing
latency depende de arrival pattern. Un benchmark batch que lanza cuatro simultáneamente
mide un escenario distinto de una app donde requests llegan aleatoriamente. Esta es la
conexión con serving research sin necesitar construir un datacenter.


## 50. Puntos de confusión de la Clase 03

Token no equivale a palabra. Streaming no equivale a inferencia más rápida. TTFT no
equivale a tokens/s. Temperature no agrega creatividad o conocimiento; transforma la
distribución de selección. KV cache no es transcript ni RAG.

Una segunda confusión es pensar que cache siempre acelera. La cache cuesta
almacenamiento, lookup y gestión. Su beneficio depende del trabajo reutilizable. Otra es
comparar throughput de prefill con throughput de decode como si fueran la misma métrica;
`llm.npu` muestra por qué esa confusión puede producir claims absurdos.

Finalmente, research de KV compression no implica soporte en QVAC. KV-CAR, Lexico y CSR
explican un problema; el contrato real del SDK es el `kvCache` documentado. Mantener
research y product capability separados es parte del proof-checking.

## Para estudiar — Clase 03

Primera pregunta. Un sistema tiene TTFT de 4 s y luego genera a 80 tok/s. Otro tiene
TTFT de 500 ms y genera a 15 tok/s. ¿Cuál es “más rápido”? Responde para una salida de
20 tokens y una de 1 000, explicando qué métrica domina.

Segunda pregunta. Deriva por qué KV cache ahorra recomputación en decode y explica por
qué el mismo mecanismo aumenta memoria. Después explica por qué guardar el transcript
sigue siendo necesario.

Tercera pregunta. Tienes dos outputs distintos del mismo modelo. ¿Qué evidencia
necesitarías antes de atribuir la diferencia a temperature? Incluye seed/stochasticity,
top-p, prompt y estado de cache.

Cuarta pregunta. ¿Por qué el hallazgo de Language Confusion sobre temperaturas altas es
un contraejemplo útil a “temperature = creatividad”? Formula una afirmación más precisa
que sí podemos defender.

Quinta pregunta. Diseña un experimento de KV cache cuyo resultado pudiera realmente
sorprenderte. Especifica qué observación apoyaría tu mecanismo y qué observación te
obligaría a buscar otra explicación.

## Transición — Una completion observable sigue sin ser una aplicación

Ahora podemos mirar una request y distinguir casi cada etapa importante. Podemos
observar eventos, medir TTFT, pensar en context y saber qué cache reutiliza estado. Pero
si el proceso termina, no tenemos necesariamente conversación. Si el usuario pulsa Stop,
aún no hemos decidido qué se guarda. Si hay dos requests, necesitamos identidad. La
última clase cambia de inference systems a application systems.

---

# Clase 04 — Build the Offline Chat

## 51. Una respuesta única no es una conversación

Partimos de una completion que funciona. El usuario pregunta y el modelo responde. Para
convertirla en chat necesitamos que el siguiente turno dependa de los anteriores. El
modelo no tiene una memoria mágica de llamadas JS independientes; la aplicación
construye `history` y lo envía otra vez, o utiliza mecanismos de cache compatibles para
acelerar un prefix cuya semántica sigue perteneciendo a la historia.

Esta diferencia es más importante en local porque no hay un servicio remoto que esconda
session state. La aplicación ve que history es data. Si pierde el array y reinicia, la
conversación desaparece aunque el modelo GGUF siga intacto en disco.

Por tanto, la primera nueva abstracción no es una API de chat sino un objeto de dominio:
conversation. Tiene identidad, mensajes, timestamps y lifecycle propios. Ese lifecycle
no coincide con el modelo ni con la request.

## 52. Tres relojes que avanzan a velocidades distintas

El model lifecycle puede durar minutos u horas: load, múltiples operaciones, unload. El
request lifecycle puede durar segundos: begin, events, terminal state. El conversation
lifecycle puede durar días o años: create, append, persist, restore, migrate, delete. Un
bug aparece cuando tratamos uno como si fuera otro.

Cancelar una request no debería descargar el modelo. Descargar el modelo no debería
borrar el transcript. Cerrar la aplicación no debería necesariamente borrar ninguna de
las dos cosas persistentes: el asset de modelo y la conversación pueden seguir en disco.
Estas separaciones parecen obvias una vez escritas, pero son responsables de muchos
diseños frágiles.

El UI también tiene un cuarto estado temporal: rendering provisional. Mientras llegan
deltas, hay texto que el usuario ve pero que quizá todavía no hemos decidido guardar.
Ahí aparece la necesidad de una commit boundary.

```text
Long-lived                                     durable
─────────────────────────────────────────────────────────► time

MODEL
load ─────────────────────────────── unload

REQUEST 1
     start ───── deltas ───── done

REQUEST 2
                    start ─── cancel

CONVERSATION
create ─ message ─ message ─ persist ─ restart ─ continue

UI provisional
        [streaming text......]
                    │
                    └── commit? / discard? / mark partial?
```

## 53. Multi-turn significa reconstruir contexto

Supongamos que el primer history contiene un user message. Al terminar, si la respuesta
es válida según nuestra policy, agregamos un assistant message. El siguiente user turn
se añade y la nueva completion recibe esa secuencia. Desde la perspectiva del modelo, la
conversación es texto estructurado en el context actual, no una referencia abstracta a
“session 42”.

A medida que crece history, crece prompt processing y KV state. Eventualmente el context
budget obliga a truncar, resumir o seleccionar. Esa policy pertenece a la app y conecta
directamente con Clase 03. Un chat infinito no cabe simplemente porque el transcript en
SQLite sea infinito.

La persistencia debe conservar una representación que pueda reconstruir history sin
depender de una cache numérica del runtime. Roles y content son parte del dominio. Tool
messages y otras estructuras pueden añadirse más tarde; el esquema necesita versión para
evolucionar.

## 54. Streaming output todavía no es verdad durable

Cuando llega un `contentDelta`, podemos concatenarlo a un buffer y renderizarlo. Pero el
request no ha terminado. El usuario puede cancelar después de tres palabras. Puede
ocurrir un error. Puede llegar `stopReason: "length"` y nuestra policy considerar el
output truncado. Si escribimos cada delta directamente en el transcript definitivo,
estamos comprometiendo estado antes de conocer su condición terminal.

Por eso distinguimos provisional buffer de committed assistant message. La UI puede
mostrar el buffer en tiempo real. Al terminar, una función de policy decide qué hacer:
commit completo, guardar como partial con metadata o descartar. No existe una única
policy universal. Una app de notas quizá quiera conservar lo cancelado; un chat que
reutiliza history quizá prefiera no enviar un fragmento cortado como si fuera una
respuesta completa.

La documentación de Cancellation de QVAC hace esta preocupación explícita: una assistant
turn cancelada es parcial y recomienda eliminarla o marcarla antes de añadir el
siguiente user turn; también advierte que romper el iterator temprano puede dejar un
turn truncado que debe tratarse como parcial. [Q-CANCEL] Aquí el concepto de commit
boundary surge directamente del contrato de inference.

## 55. `requestId`: identidad antes de poder cancelar

Un botón Stop necesita saber qué trabajo detener. Si usamos solo `modelId`, podríamos
interrumpir otras requests que comparten el modelo. QVAC define `requestId` como primary
path de cancelación para operaciones largas. `completion()` devuelve un `CompletionRun`
con `requestId` síncrono; varias decorated promises como `loadModel()` también exponen
el ID antes del `await`. [Q-CANCEL]

`cancel({ requestId })` sobre una completion cierra limpiamente el iterable de events,
produce un `completionDone` terminal con `stopReason: "cancelled"` y hace que `final`
rechace con `InferenceCancelledError`. Otras completions sobre el mismo modelo
continúan. [Q-CANCEL] Eso es exactamente la semántica que una UI per-request necesita.

Existe un broad cancel por `modelId` como escape hatch para unload, shutdown o admin
sweeps. La documentación también contiene caveats de otras operaciones: no todas tienen
hard mid-decode cancellation. Nuestro chat se centra en completion, donde targeted
cancel es la ruta apropiada.

```typescript
import {
  cancel,
  completion,
  InferenceCancelledError,
} from "@qvac/sdk";

async function runAssistantTurn(modelId: string, history: any[]) {
  const run = completion({
    modelId,
    history,
    stream: true,
  });

  let provisional = "";
  let terminalStopReason: string | undefined;

  stopButton.onclick = () => {
    void cancel({ requestId: run.requestId });
  };

  try {
    for await (const event of run.events) {
      if (event.type === "contentDelta") {
        provisional += event.text;
        renderProvisional(provisional);
      }

      if (event.type === "completionDone") {
        terminalStopReason = event.stopReason;
      }
    }

    const final = await run.final;

    return {
      kind: "complete" as const,
      content: final.contentText,
      stopReason: final.stopReason,
      stats: final.stats,
    };
  } catch (error) {
    if (error instanceof InferenceCancelledError) {
      return {
        kind: "cancelled" as const,
        provisional,
        stopReason: terminalStopReason ?? "cancelled",
      };
    }
    throw error;
  }
}
```

## 56. Qué ocurre después de cancel: la policy pertenece a la aplicación

El SDK comunica cancelación; no decide cómo quieres que se vea tu conversación. Podemos
descartar el provisional y dejar solo el user message. Podemos guardar un assistant
message con `partial: true`. Podemos ofrecer “keep partial response”. Cada opción tiene
consecuencias para el siguiente history.

Si enviamos un texto cortado de mitad de oración como assistant turn normal, el modelo
del siguiente request puede interpretarlo como una respuesta deliberadamente terminada.
QVAC documenta este riesgo de history trim. [Q-CANCEL] Por eso una policy simple para el
curso será no incluir partial assistant turns en el history siguiente, aunque la UI
pueda conservarlos visualmente con una etiqueta.

El punto general es que stopReason entra en el state machine de la aplicación. No es
solo una línea de log.

## 57. Persistencia: el transcript es primary data, no cache

Ink & Switch distingue local data como parte del ownership del usuario. [A-LOCALFIRST]
En nuestro chat, el transcript debe sobrevivir a la pérdida del proceso. Si solo vive en
un array de React o Node, la aplicación es offline durante una sesión pero no durable.

JSON es una buena primera representación porque hace visible el esquema. Una
conversación puede tener `schemaVersion`, `conversationId`, timestamps y messages con
IDs, role, content y stopReason. Metrics pueden guardarse aparte o dentro si son parte
del producto. Lo importante es no serializar objetos internos opacos del SDK como si
fueran un formato estable de dominio.

Cuando el producto crece, SQLite puede ofrecer transacciones, índices y updates
parciales, pero no cambia el principio. Persistence engine y conversation schema son
capas distintas.

```json
{
  "schemaVersion": 1,
  "conversationId": "01J...",
  "createdAt": "2026-08-27T19:00:00-06:00",
  "updatedAt": "2026-08-27T19:04:11-06:00",
  "messages": [
    {
      "id": "01J...A",
      "role": "user",
      "content": "¿Qué trabajo evita una KV cache?",
      "createdAt": "2026-08-27T19:00:07-06:00"
    },
    {
      "id": "01J...B",
      "role": "assistant",
      "content": "Evita recomputar...",
      "stopReason": "eos",
      "createdAt": "2026-08-27T19:00:09-06:00"
    }
  ]
}
```

## 58. Atomic write: descubrir el problema destruyendo el proceso

Supongamos que hacemos `writeFile("conversation.json", JSON.stringify(...))` y el
proceso muere después de truncar el archivo pero antes de escribir todos los bytes. Al
reiniciar, la única copia puede ser JSON inválido. La persistencia local crea una nueva
responsabilidad: crash consistency.

Un patrón simple escribe primero a un archivo temporal en el mismo filesystem y después
renombra al path final. El rename puede ofrecer propiedades atómicas útiles dependiendo
del filesystem y plataforma. Para garantías más fuertes necesitamos estudiar fsync y
semantics del entorno. La lección no es “rename siempre soluciona todo”; es reducir la
ventana donde la única versión durable está incompleta y conocer las garantías reales de
almacenamiento.

SQLite resuelve varias de estas preocupaciones mediante transacciones, pero tampoco
elimina la necesidad de schema migrations y backups. Empezar con JSON permite ver el
problema que una base de datos luego abstrae.

## 59. Restore: la aplicación debe reconstruirse desde estado durable

La prueba importante no es guardar un archivo, sino usarlo después de perder RAM.
Cerramos la app, el worker y el modelo. Al arrancar, leemos conversations, seleccionamos
una, reconstruimos `history`, cargamos el modelo desde activos locales y ejecutamos un
turn nuevo. Si esto funciona sin red, hemos combinado durabilidad de application state
con durabilidad de model assets.

La KV cache puede no sobrevivir o puede tener su propio lifecycle. Eso no impide
restore; recomputaremos el prompt si es necesario. Esta propiedad demuestra por qué
transcript y cache no pueden ser la misma cosa.

El restart también prueba que el código de startup entiende los estados: cache de modelo
existe pero modelo no residente; conversation existe pero UI no renderizada; worker
todavía no iniciado hasta la primera RPC. Cada capa se reconstituye.

## 60. Logging: observar sin convertir el chat en un leak

Antes de activar logging preguntamos qué necesitamos ver. Para model lifecycle interesan
mensajes de loading/backend. Para requests, errores y actividad de inference. Para
worker, server logs. QVAC ofrece `subscribeServerLogs()` para todos los server-side
logs, `loggingStream()` para una fuente y `getLogger()` para application code. [Q-LOG]

La observabilidad tiene un costo de privacidad. Un developer puede imprimir prompts y
answers para depurar; en producción eso crea una copia adicional. El log file quizá
tenga retención y permisos distintos del transcript. Local-first no significa “guardar
más porque nadie externo lo ve”. Data minimization sigue siendo necesaria.

Una práctica útil es separar telemetry numérica de content logging. TTFT y stopReason
pueden registrarse sin guardar necesariamente el prompt completo. Cuando content es
necesario para debugging, se limita a entornos o corpus apropiados.

## 61. Suspend/resume: application lifecycle se cruza con runtime lifecycle

En móvil o desktop, la aplicación puede pasar a background. Mantener sockets y handles
activos desperdicia batería o produce estados rotos cuando el OS suspende recursos. QVAC
documenta `suspend()`, `resume()` y `state()` con estados active, suspending, suspended
y resuming. [Q-LIFE]

Mientras el runtime no está active, nuevas operaciones no-lifecycle fallan rápido con
`LIFECYCLE_OPERATION_BLOCKED` en lugar de colgarse. Las operaciones iniciadas antes de
suspend tienen comportamientos distintos: la documentación actual dice que local native
inference como `completion()` corre hasta completar, mientras otros tipos pueden stall o
ser severed según la matriz. [Q-LIFE]

Esto crea otra separación de tiempos. App lifecycle no es conversation lifecycle. Ir a
background no debería borrar el transcript. Runtime lifecycle no es model artifact
lifecycle. Una app bien diseñada decide qué recursos pausar y qué estado persistir.

## 62. Graceful shutdown: cerrar es una secuencia

Llamar `process.exit()` de inmediato evita que cleanup tenga oportunidad de terminar. Un
shutdown ordenado deja de aceptar trabajo nuevo, cancela o espera requests según policy,
compromete estado durable, descarga modelos cuando corresponde y cierra el SDK. El orden
exacto depende de la app, pero cada paso responde a un lifecycle que ya entendemos.

`close()` es explícito y, según la documentación actual, en Node/Expo termina el worker
y libera RPC; en Bare no hay worker separado, por lo que es no-op. [Q-HOW] Después de
`close()`, una futura SDK call reinicializa el client y crea un worker nuevo cuando
aplica.

Esta capacidad es importante para la prueba offline final porque queremos demostrar que
el sistema no se apoya en memoria residual de un worker anterior. Cerramos de verdad y
arrancamos de nuevo.

## 63. El acceptance test acumulativo: Airplane-Mode Restart

La Clase 01 probó que un model asset provisionado podía cargarse tras un restart
offline. Ahora la prueba incluye la aplicación completa. Con red, provisionamos el
modelo y creamos una conversación. Guardamos al menos un turn. Cerramos de forma
ordenada. Desactivamos la red. Lanzamos un proceso nuevo.

El proceso debe encontrar el transcript en almacenamiento local y el model asset en
cache. El worker se inicializa localmente. `loadModel()` crea una nueva instancia. La
app reconstruye history. Hacemos una pregunta nueva relacionada con el turn anterior,
observamos `contentDelta`, obtenemos un terminal, aplicamos commit policy y persistimos
el nuevo assistant message. Después cerramos.

Si todo funciona, ya no demostramos solo “el modelo calcula sin red”. Demostramos que
modelo, runtime y application state forman una ruta durable local-first. Si falla, el
lugar del fallo es informativo: asset acquisition, load, restore, context construction,
inference o persistence.

```text
Final acceptance path

          BEFORE OFFLINE
               │
      provision model asset
               │
      create conversation
               │
      commit transcript
               │
            close()
               │
        TURN NETWORK OFF
               │
               ▼
        NEW OS PROCESS
               │
               ├── read local transcript
               ├── initialize QVAC worker
               ├── load GGUF from local cache
               ├── rebuild history
               ├── issue NEW completion
               ├── receive typed events
               ├── observe stopReason
               ├── commit new assistant turn
               └── persist + shutdown
```

## 64A. Diseñar el conversation schema para que pueda cambiar

El primer schema JSON parece obvio hasta que añadimos features. Quizá mañana el
assistant pueda usar tools, adjuntar imágenes o guardar provenance. Si serializamos sin
`schemaVersion`, la app nueva no sabe qué invariantes puede asumir de un archivo viejo.
Versionar el schema no requiere un sistema complejo; requiere aceptar que durable data
vive más que el código que lo creó.

Una migration puede añadir defaults, convertir fields o separar un mensaje antiguo en
una estructura nueva. Debe ejecutarse antes de que la UI trate el transcript como
current. La migración también necesita crash safety: escribir una nueva versión sin
destruir la última válida hasta que termine.

Este problema es una consecuencia directa de local-first longevity. Si los datos
pertenecen al usuario y viven localmente, la aplicación no puede asumir que todos los
dispositivos actualizan al mismo instante ni que un backend central reescribe la base
por nosotros.

## 64B. Message identity: por qué el orden del array no basta

Un índice de array funciona mientras una conversación sea append-only en un solo
proceso. En cuanto queremos editar, retry, sincronizar o referenciar un mensaje desde
metrics, una identidad estable ayuda. Un `messageId` permite distinguir dos assistant
turns aunque su texto sea igual y relacionar un cancellation event con el mensaje
provisional correcto.

Los IDs también hacen posible escribir updates idempotentes. Si un crash ocurre después
de persistir un turn pero antes de actualizar la UI, al reiniciar podemos detectar que
ese messageId ya existe en vez de duplicarlo. La idempotencia se vuelve importante
cuando operations y persistence no forman una transacción global.

El curso no impone UUID, ULID u otro esquema como dogma. La propiedad necesaria es una
identidad suficientemente estable para el lifecycle del producto.

## 64C. Atomic write más allá del rename: durability tiene capas

`temp + rename` reduce riesgo de un archivo parcialmente reemplazado, pero un filesystem
puede mantener datos en caches antes de persistirlos físicamente. `fsync` y semantics de
directorio importan si necesitamos garantías frente a power loss. Los detalles varían
por OS y filesystem, por lo que una afirmación absoluta sería irresponsable.

El objetivo de la masterclass es reconocer niveles. Crash del proceso, crash del OS y
pérdida de energía son failure models distintos. SQLite/WAL u otros engines implementan
protocolos más robustos para transacciones, pero también tienen configuración y
recovery.

Para un demo educativo, temp+rename puede ser suficiente para enseñar commit. Para un
producto crítico, se elige un storage engine y se estudian sus garantías. Local-first
aumenta la importancia de ese trabajo porque no existe una copia cloud autoritativa por
defecto.

## 64D. El problema del doble submit y requests concurrentes

Un usuario puede pulsar Enter dos veces, o la UI puede permitir varias conversations
simultáneas. Con QVAC `parallel` mayor a uno, incluso el mismo modelo puede procesar
varias requests. [Q-TEXT] La app necesita asociar cada provisional buffer, requestId y
terminal state con su conversation y message ID.

Un global `currentText` deja de ser suficiente. El state store necesita una estructura
por request. Cancelar una debe usar su `requestId`, no el modelId. Persistir una
respuesta debe verificar que sigue perteneciendo al turn esperado.

La concurrencia convierte errores de identidad en bugs de datos: un delta de la
conversación A puede terminar en B si el routing es incorrecto. La typed event stream
facilita la secuencia dentro de una run, pero la aplicación sigue siendo responsable de
mapear runs a dominio.

## 64E. La cancelación de `loadModel()` tiene un caveat distinto de la completion

La página actual de Cancellation documenta una sutileza: durante la fase de download,
`loadModel()` respeta cancel por requestId end-to-end, pero la fase posterior de addon
load no acepta hoy una cancellation signal. Si el cancel llega durante esa fase, la
Promise del cliente rechaza con `InferenceCancelledError` pero el addon puede terminar
de cargar el modelo en background, creando un modelo huérfano server-side. [Q-CANCEL]

Esta caveat no cambia la semántica de Stop en una completion, pero muestra por qué
debemos leer cancellation por operación. “QVAC soporta cancel” no significa que cada
backend pueda interrumpir cualquier instrucción nativa en el mismo punto.

Para una UI de model provisioning, el comportamiento implica cleanup consciente después
de cancelar un load. Para el chat, targeted completion cancel sí ofrece el terminal
`completionDone: cancelled` y mantiene otras completions activas.

## 64F. Error recovery: no todo fallo debe convertirse en un assistant message

Si `completion()` falla antes de producir contenido, guardar un assistant message
“Error” dentro del transcript puede contaminar history. Ese texto pertenece a UI/system
state, no a la conversación semántica con el modelo. El schema debe distinguir errores
operacionales de mensajes que queremos reenviar como context.

Si el fallo ocurre después de varios deltas, tenemos la misma pregunta que en cancel:
partial output. Puede mostrarse con una etiqueta y excluirse del history. La policy debe
ser consistente para que restore no transforme un error visual en memoria del modelo.

Esta separación entre domain data y UI status es una aplicación directa de event-driven
design. El transcript contiene aquello que debe influir en futuros turns; el request log
contiene cómo intentamos producirlo.

## 64G. Conversation compaction: cuando el transcript excede el context

Durable history puede crecer sin límite mientras model context no. En algún momento la
aplicación debe seleccionar una ventana, resumir o usar otro mecanismo. Borrar mensajes
antiguos del archivo para que “quepa” sería confundir persistence con prompt
construction.

Una mejor arquitectura conserva el transcript completo y construye un history view para
cada completion. Ese view puede contener los últimos turns, un summary o elementos
seleccionados. La policy exacta pertenece a etapas posteriores del curso; aquí importa
distinguir source of truth de context projection.

Cuando llegue RAG en el Módulo 2, la misma separación reaparecerá: los documentos
completos pueden vivir en almacenamiento y solo una selección entra al context. Context
es una ventana, no el universo de datos.

## 64H. Privacy de la persistencia: el archivo local también necesita una política

Guardar conversaciones localmente elimina la necesidad de un backend remoto para
restore, pero crea un archivo que puede contener información sensible durante meses. La
aplicación debe decidir permisos, encryption at rest si el threat model lo exige, backup
y retention.

El principio local-first de ownership incluye capacidad de borrar y exportar.
[A-LOCALFIRST] Un formato portable mejora agency, pero un archivo exportado puede
escapar de protecciones del store interno. Product design debe comunicar esa frontera.

Ninguna primitive de `completion()` resuelve estas decisiones. Esa separación es
saludable: el inference SDK ejecuta modelos; la aplicación define governance de su
durable state.

## 64I. Qué hace más fuerte la prueba final que una demo offline

La prueba final combina varias pérdidas de estado. Cerramos el worker, por lo que no
puede quedar una instancia de modelo viva. Cerramos el proceso, por lo que arrays de
history y buffers de UI desaparecen. Apagamos networking, por lo que registry y APIs
externas no pueden salvarnos. Después exigimos una pregunta nueva dependiente de la
conversación previa.

Cada condición elimina un falso positivo. El restart elimina RAM residual. La pregunta
nueva elimina output cache simple. La dependencia del turn anterior prueba restore de
history. El network-off prueba que acquisition y inference usan assets locales. La
persistencia del nuevo turn prueba que el sistema no solo lee estado viejo, sino que
puede continuar su lifecycle.

Una prueba fuerte no es la que tiene más pasos, sino la que elimina explicaciones
alternativas. Esta idea —diseñar una demostración como falsificación— es quizás el
aprendizaje metodológico más importante de todo el módulo.


## 64J. Una arquitectura mínima completa: controller, store y runtime

Después de derivar los estados podemos dividir el programa en tres responsabilidades. Un
runtime service posee el loaded model y expone una operación para iniciar/cancelar
turns. Un conversation store posee transcripts durables y migrations. Un controller
coordina UI, construye history, mantiene provisional buffers y decide commit. Esta
separación no es la única posible, pero refleja los lifecycles que ya identificamos.

El runtime service no debería decidir si un partial se guarda. El store no debería
llamar al modelo. El controller no debería conocer cómo se escribe atomicamente un
archivo. Separar responsabilidades permite probar crash persistence sin cargar un LLM y
probar cancellation sin tocar storage real.

En una app pequeña todo puede vivir en el mismo repositorio y proceso; “service” aquí es
una frontera lógica. La arquitectura local-first no requiere microservices. De hecho,
introducir servicios remotos solo para imitar patrones cloud iría contra el objetivo de
reducir dependencias.

### Esqueleto TypeScript del controller

```typescript
type AssistantTurnResult =
  | {
      status: "complete";
      content: string;
      stopReason: string | undefined;
      stats: unknown;
    }
  | {
      status: "cancelled";
      partial: string;
    };

async function submitUserMessage(
  conversationId: string,
  text: string,
): Promise<void> {
  // 1. El user message sí es durable antes de iniciar inferencia.
  const conversation = await store.load(conversationId);
  const userMessage = createUserMessage(text);
  conversation.messages.push(userMessage);
  await store.commit(conversation);

  // 2. Construimos una proyección de history desde estado durable.
  const history = buildModelHistory(conversation);

  // 3. El assistant turn empieza como UI state provisional.
  const request = runtime.startTurn(history);

  ui.attachStopHandler(() => request.cancel());

  const result: AssistantTurnResult = await request.result();

  // 4. Cancelled no se convierte automáticamente en assistant history.
  if (result.status === "cancelled") {
    ui.markPartial(result.partial);
    return;
  }

  // 5. Solo después de terminal success aplicamos la policy de commit.
  const assistantMessage = createAssistantMessage({
    content: result.content,
    stopReason: result.stopReason,
  });

  conversation.messages.push(assistantMessage);
  await store.commit(conversation);
}
```

## 64K. Por qué persistir el user message antes de inference puede ser útil

En el skeleton anterior el user message se compromete antes de llamar al modelo. Si la
aplicación crashea durante inference, al reiniciar podemos ver qué pregunta quedó sin
respuesta y ofrecer retry. Si guardáramos user y assistant solo al final como una
transacción única, un crash borraría incluso la intención del usuario.

Esa policy no es obligatoria para toda app, pero muestra que commit no ocurre una sola
vez. Hay distintos domain events: user submitted, assistant completed. Podemos
modelarlos como transacciones separadas. La UI puede marcar un user message como
“pending/retry” después de restore.

La decisión también afecta idempotency. Un retry debe reutilizar el mismo user message
en lugar de duplicarlo. Message identity se vuelve necesaria. Así, un pequeño problema
de UX deriva naturalmente en un modelo de datos más robusto.

## 64L. Crash después del `completionDone` pero antes de persistir

Consideremos un failure incómodo. El modelo termina y la UI muestra la respuesta
completa, pero el proceso muere antes del `store.commit`. Después del restart, el
transcript durable no contiene el assistant turn que el usuario vio. No existe una
transacción distribuida entre UI render, inference runtime y filesystem que haga
mágicamente atómicas las tres cosas.

Podemos reducir la inconsistencia persistiendo antes de marcar visualmente el turn como
committed. La UI puede mostrar streaming provisional y, al terminal, cambiar a un
pequeño estado “saving” durante el commit. Solo después se etiqueta como durable. Si el
crash ocurre antes, restore muestra el user message sin assistant y puede ofrecer retry.

Este diseño hace visible una verdad de sistemas: UX state y durable state tienen un
orden causal. Llamar a todo “message” oculta esa diferencia.

## 64M. Crash después de persistir pero antes de actualizar la UI

El caso inverso es más fácil si tenemos IDs. Persistimos el assistant turn, el proceso
muere antes de renderizarlo y al restart el store lo contiene. La UI reconstruye desde
durable state y muestra la respuesta. El usuario quizá no la vio antes del crash, pero
no existe duplicación.

Si el retry se lanzó automáticamente antes de comprobar el store, podríamos generar una
segunda respuesta. Por eso startup recovery debe cargar el estado antes de reanudar jobs
pendientes. El transcript es source of truth; la memoria del controller es ephemeral.

Estos escenarios parecen alejados de AI, pero determinan si un chat local se comporta
como producto o demo. El LLM puede ser perfecto y la experiencia seguir siendo
inconsistente por una mala commit policy.

## 64N. Qué deberíamos guardar de performance y qué no

Guardar TTFT, total latency, model ID o quantization junto a cada turn puede ser útil
para experimentos y regressions. Pero convertir el transcript de usuario en una base de
telemetry mezcla responsabilidades y dificulta export. Una opción es mantener un
experiment log separado con message IDs como referencia.

Esto también mejora privacidad. El transcript puede contener contenido; el performance
log puede contener solo IDs, tiempos y stopReason. Si los dos stores tienen retention
diferente, la separación es explícita.

El criterio es durability semántica: si borrar la métrica no cambia el significado de la
conversación, probablemente no necesita estar embebida en cada message. Si el producto
muestra “respuesta cancelada” como parte del historial, stopReason/partial flag sí puede
ser dominio.


## 64. Puntos de confusión de la Clase 04

History no es KV cache. El transcript es durable application data; KV es runtime state
para reutilizar attention computation. Streaming text no es committed state; puede
terminar cancelado. `requestId` identifica una operación; `modelId` identifica una
instancia de modelo cargada.

`stopReason: "length"` no significa crash y `cancelled` no significa que debamos borrar
toda la conversación. `unloadModel()` no borra el asset. `close()` no borra transcript
ni cache por definición. Suspend no equivale a shutdown.

Una última confusión es llamar “offline chat” a una UI que preserva history pero
necesita descargar el modelo en cada startup. Offline es una propiedad end-to-end del
critical path. El acceptance test acumulativo existe para descubrir exactamente estas
dependencias.

## Para estudiar — Clase 04

Primera pregunta. Diseña una state machine para un assistant turn con estados
provisional, complete, cancelled y error. ¿En qué transiciones permites persistencia y
qué incluirías en el history siguiente?

Segunda pregunta. Una respuesta parcial cancelada se ve útil. ¿Por qué podría ser
peligroso reenviarla al modelo como un assistant turn normal? Propón dos policies
alternativas y sus tradeoffs.

Tercera pregunta. Compara JSON atómico y SQLite para diez mil conversaciones. No elijas
una tecnología por popularidad; relaciona volumen, transactions, migrations, concurrency
y operación offline.

Cuarta pregunta. Durante suspend, QVAC permite que una local completion iniciada
continúe hasta terminar, mientras nuevas operaciones quedan bloqueadas. ¿Qué implica
esto para una app móvil que entra en background justo después de que el usuario envía un
mensaje?

Quinta pregunta. Describe exactamente qué evidencia pedirías para aceptar la afirmación:
“este chat sigue siendo funcional después de un restart completamente offline”. Evita
responder con una checklist sin explicar qué falso positivo elimina cada observación.

---

# Síntesis del Módulo 1 — Reconstruir la ruta completa

## 65. Del input humano al estado durable

Ya podemos seguir una petición sin saltos conceptuales. El usuario produce texto. La
aplicación lo guarda provisionalmente como user turn y construye history. El cliente
QVAC conduce un worker Bare —separado o in-process según runtime— donde existe un modelo
cargado desde un artefacto GGUF local. El tokenizer transforma texto a IDs. El modelo
procesa el prefix durante prefill y establece estado de attention.

Durante decode, cada nuevo step usa el estado pasado, produce logits y una policy de
sampling elige un token. KV cache puede evitar recomputar keys/values compatibles y
consume memoria a cambio. El runtime emite eventos tipados; la UI convierte
`contentDelta` en texto provisional. `completionDone` describe la terminación y `final`
agrega el resultado. La app aplica una policy de commit.

Solo después de commit el assistant turn se vuelve conversation state durable. El
transcript se escribe con un esquema versionado. El request muere; el model puede seguir
residente. Más tarde el model se descarga y el worker puede cerrarse. Tras un restart,
el asset y el transcript sobreviven y permiten reconstruir la ruta.

```text
user input
    │
    ▼
application
    │ history / policy
    ▼
QVAC client
    │ RPC / in-process contract
    ▼
Bare worker
    │
    ▼
loaded GGUF
    │
    ▼
tokenization
    │
    ▼
prefill
    │
    ▼
KV attention state
    │
    ▼
decode ──► logits ──► sampling ──► next token
    │                                   │
    └───────────────────────────────────┘
                    repeat
                      │
                      ▼
                CompletionEvent
                      │
                contentDelta
                      │
                      ▼
              provisional UI
                      │
            completionDone/final
                      │
                      ▼
                 commit policy
                      │
                      ▼
             persistent conversation
```

## 66. Qué hemos aprendido realmente sobre «local»

Local dejó de ser una ubicación y se convirtió en una colección de propiedades. La red
no está en la ruta crítica de inferencia después del provisioning. Los weights y el
transcript tienen una existencia local durable. El compute ocurre en hardware que
podemos identificar. El model lifecycle está controlado por la aplicación. La request
tiene identidad y cancelación. El usuario puede reiniciar sin autoridad remota.

Eso no garantiza automáticamente privacidad, calidad o performance. Cada propiedad
necesita su propia evidencia. Un modelo local puede ser lento. Un transcript puede estar
mal protegido. Una quantization puede degradar un task. Un KV cache puede consumir
demasiado. La ventaja de ownership es que estas preguntas se vuelven observables y
modificables dentro de nuestra arquitectura.

El objetivo del curso no es sustituir una dependencia cloud por una fe ciega en “local”.
Es sustituir una caja negra operacional por un sistema cuyos estados podemos nombrar y
medir.

## 67. Puente al Módulo 2

Al final aparece una limitación nueva. Nuestro chat puede recordar lo que ocurrió en la
conversación porque persiste history. Pero no puede consultar automáticamente una
biblioteca privada de documentos que no caben en el context ni forman parte de sus
pesos. KV cache no resuelve esa necesidad: acelera state de attention, no busca
conocimiento externo.

La siguiente pregunta será distinta: ¿cómo hacemos que información privada y
actualizable sea recuperable por significado sin convertirla en parámetros del LLM? Esa
pregunta nos obligará a construir embeddings, similarity search y RAG. La transición es
deliberada: primero poseemos la inferencia; después poseeremos el conocimiento que
alimenta esa inferencia.

# Conclusión — De API misteriosa a sistema explicable

La frase “corre un LLM local” ya no debería ser suficiente. Ahora sabemos preguntar qué
artefacto, qué quantization, qué backend y qué lifecycle. Podemos explicar por qué el
primer token tiene un coste diferente del décimo, por qué KV cache intercambia memoria
por recomputación y por qué una policy de sampling cambia output sin cambiar pesos.
Podemos distinguir la velocidad que ve el usuario de la velocidad de decode.

También sabemos que un producto requiere más que inference. El transcript es durable,
streaming es provisional, stopReason tiene semántica y cancelación necesita identidad.
Provisioning, model load, request y conversation son lifecycles separados. Esa
separación es la arquitectura.

La prueba final no es una slide que diga “privacy-first”. Es un proceso nuevo, con la
red apagada, que carga su modelo desde activos locales, restaura una conversación
durable, genera una respuesta nueva, observa su terminal state y compromete el nuevo
turno. Cuando podemos explicar cada paso de esa ruta y dónde mirar si falla, hemos
llegado a la idea operacional de Own the Inference.

---

# Capítulo de integración — Tradeoffs que cruzan las cuatro clases

## 68. El mismo cambio puede mejorar una métrica y empeorar otra

Elegir una quantization menor puede reducir file size y mejorar el load, pero degradar
calidad. Aumentar context puede mejorar capacidad de usar history y empeorar
TTFT/memory. Activar KV cache puede reducir recomputación y aumentar disk/memory usage.
Mantener el modelo residente mejora respuesta y consume memoria mientras la app está
idle.

Estas tensiones no son excepciones; son la forma normal del problema. Systems
engineering consiste en elegir un punto de operación bajo restricciones. Por eso el
curso insiste en preguntas con presupuesto: quality target, memory budget, latency
target y offline requirements.

Una arquitectura defendible no dice “maximizamos todo”. Dice qué prioriza, qué sacrifica
y qué evidencia justifica el punto elegido.

## 69. La noción de estado atraviesa todo el módulo

En Clase 01 apareció estado en cache de modelos y worker. En Clase 02 distinguimos bytes
en disco de model residency. En Clase 03 apareció KV state y event state. En Clase 04
apareció conversation state durable. Muchos bugs son confusiones entre estas capas.

Podemos clasificarlas por recomputabilidad. Un model asset puede redescargarse si existe
red. Una loaded instance puede recrearse desde el asset. KV cache puede recomputarse
desde history. Un transcript privado quizá no pueda reconstruirse si se pierde; es
primary data. Esta jerarquía debería influir en backup y cleanup.

También podemos clasificarlas por duración. Request buffers viven segundos. KV caches
pueden vivir entre turns. Model files viven meses. El diseño de storage y identity
depende de esa duración.

## 70. El hardware no es una constante de fondo

En cloud APIs el usuario rara vez conoce la GPU exacta. En local, hardware se vuelve
parte de la especificación del producto. La misma app puede ejecutarse en CPU-only,
Metal o Vulkan con rendimientos diferentes. QVAC abstrae backends, pero no elimina la
diversidad física. [Q-SYS]

Esto cambia cómo escribimos documentación. En vez de prometer “20 tok/s”, declaramos una
matriz de dispositivos probados. En vez de recomendar un único model artifact, podemos
seleccionar por resource tier. Arapai explora hardware-aware model selection
precisamente por esta razón en entornos educativos limitados. [A-ARAPAI]

La portabilidad local no consiste en que todas las máquinas se comporten igual; consiste
en que la arquitectura pueda adaptarse sin volver a entregar control a una dependencia
remota.

## 71. Por qué local AI hace visible la computer science que cloud ocultaba

Un API remoto convierte model loading, batching, memory management y scheduling en
responsabilidad del proveedor. Eso es una gran abstracción de producto. Local AI
devuelve esas decisiones al developer. A primera vista parece más complejo;
pedagógicamente es una ventaja porque obliga a comprenderlas.

GGUF hace visible storage layout. Quantization hace visible representación numérica.
Prefill y decode hacen visible el carácter temporal de inference. KV cache hace visible
memory tradeoff. Persistence hace visible durability. El módulo no glorifica
complejidad; muestra qué trabajo siempre existió aunque antes estuviera detrás de una
API.

Una vez entendemos esas capas, podemos decidir conscientemente cuándo volver a usar
cloud. La soberanía no exige hacerlo todo uno mismo; exige saber qué delegamos y qué
perdemos al delegarlo.

## 72. Una definición operacional de Own the Inference

Podemos finalmente formular una definición más rigurosa. Poseer la inferencia significa
que el sistema controla o puede inspeccionar el artefacto de modelo, el runtime que lo
ejecuta, el placement del compute, el lifecycle de adquisición y residency, la
configuración que gobierna generation, la observabilidad de requests y el estado durable
necesario para continuar la experiencia sin una autoridad remota en el critical path.

No exige que cada transistor pertenezca al usuario ni que nunca exista software de
terceros. El OS, drivers y SDK siguen siendo dependencias. Ownership es gradual y se
expresa en capacidad de operar, auditar, reemplazar y preservar estado bajo las
fronteras que definimos.

Esta definición también deja espacio para el mesh futuro. Una inference delegada a un
peer propio ya no es on-device, pero puede seguir perteneciendo a una arquitectura
soberana si el control y trust model están explícitos. El vocabulario construido aquí
nos permitirá hablar de esa diferencia sin llamar “local” a todo.


# Apéndice — Auditoría de fuentes y bibliografía

## Política de evidencia

Las fuentes siguientes no tienen el mismo rol. La documentación oficial de QVAC es la
fuente de verdad para signatures y behavior del SDK vigente. Los repositorios upstream
GGML/llama.cpp son fuente primaria para GGUF y `llama-quantize`. Los papers académicos
sustentan mecanismos, sistemas experimentales y resultados dentro de sus setups. Blogs y
Wikipedia son secundarios y no se utilizan para contradecir una fuente primaria.

No se reprodujeron resultados detallados del capítulo AIED cerrado porque el acceso
verificado públicamente solo permitió metadata y framing. Los resultados numéricos de
`llm.npu`, CachedAttention, EdgeFM, WiFi offload, KV-CAR y otros se atribuyen a sus
respectivos experimentos. No se convierten en expectativas para QVAC ni para un hardware
no evaluado.

### [Q-API] QVAC — API Summary v0.18.x (latest)

Signatures públicas y estados de deprecation.

https://docs.qvac.tether.io/reference/api/

### [Q-REL] QVAC — SDK Release Notes v0.18.x

Cambios v0.18.0/v0.18.1 y schemas descriptivos.

https://docs.qvac.tether.io/reference/release-notes/

### [Q-NPM] @qvac/sdk npm

0.18.1 publicado como latest durante esta edición.

https://www.npmjs.com/package/@qvac/sdk?activeTab=versions

### [Q-INTRO] QVAC — Introduction

Worker/client layers, fuentes de modelo y flow general.

https://docs.qvac.tether.io/introduction/

### [Q-HOW] QVAC — How it works

Bare worker, lazy initialization, singleton, load/inference/shutdown.

https://docs.qvac.tether.io/about/how-it-works/

### [Q-DOWN] QVAC — Download lifecycle

Resumable downloads, cache validation, fallbackSrc, requestId.

https://docs.qvac.tether.io/models/download-lifecycle/

### [Q-SYS] QVAC — System requirements

Host requirements y qvac doctor.

https://docs.qvac.tether.io/system-requirements/

### [Q-TEXT] QVAC — Text generation

CompletionRun events/final, event types, KV cache y concurrency.

https://docs.qvac.tether.io/ai-capabilities/text-generation/

### [Q-CANCEL] QVAC — Cancellation

Targeted requestId, broad modelId, cancel outcomes y partial turns.

https://docs.qvac.tether.io/runtime/cancellation/

### [Q-LOG] QVAC — Logging

subscribeServerLogs, loggingStream, getLogger.

https://docs.qvac.tether.io/runtime/logging/

### [Q-PROF] QVAC — Profiler

Profiler process-wide y per-call.

https://docs.qvac.tether.io/runtime/profiler/

### [Q-LIFE] QVAC — Runtime lifecycle

suspend/resume/state y comportamiento de operaciones.

https://docs.qvac.tether.io/runtime/lifecycle/

### [A-LOCALFIRST] Kleppmann et al. — Local-first software

Siete ideales, network optional y user ownership.

https://www.inkandswitch.com/essay/local-first/

### [A-AIED] Barros et al. — Offline-First AIED

AIED 2026; metadata/arquitectura verificada, acceso de texto completo cerrado en
consulta.

https://link.springer.com/chapter/10.1007/978-3-032-29773-0_32

### [A-INTEL] Intel — On-Device-First Hybrid LLM Inference

Framing device-first hybrid para enterprise AI PCs.

https://www.intel.com/content/www/us/en/developer/articles/technical/on-device-first-hybrid-llm-inference.html

### [A-EDGEFM] Deng et al. — EdgeFM

Edge VLM/LLM inference cross-platform; resultados específicos de sus plataformas.

https://arxiv.org/abs/2604.27476

### [A-LLMNPU] Xu et al. — Fast On-device LLM Inference with NPUs

Prefill bottleneck y offload heterogéneo.

https://arxiv.org/abs/2407.05858

### [A-TMO] Yuan et al. — Local-Cloud Inference Offloading

TMO, local/cloud placement y optimización multiobjetivo.

https://doi.org/10.1145/3704413.3764429

### [A-ARAPAI] Walusimbi et al. — Arapai

Offline-first educational chatbot en CPU-only low-spec.

https://arxiv.org/abs/2603.03339

### [A-WIFI] Han & Sun — Task Decomposition for AI-Enabled WiFi Offload

Local/edge/decomposed scheduling bajo comunicación/queue/compute.

https://arxiv.org/abs/2604.21399

### [G-GGUF] GGML — GGUF specification

Formato, objetivos, metadata y extensibilidad.

https://github.com/ggml-org/ggml/blob/master/docs/gguf.md

### [G-GGUF-H] GGML — gguf.h

Estructura binaria y alignment de referencia.

https://github.com/ggml-org/ggml/blob/master/include/gguf.h

### [G-QUANT] llama.cpp — quantize README

Quantization workflow, calidad y tooling.

https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md

### [G-QPAPER] Kurt — Which Quantization Should I Use?

Evaluación unificada de llama.cpp quants en Llama-3.1-8B-Instruct.

https://arxiv.org/abs/2601.14277

### [A-CACHED] Gao et al. — CachedAttention

Reutilización de KV en multi-turn serving.

https://arxiv.org/abs/2403.19708

### [I-KVCAR] Roy et al. — KV-CAR

Compresión/reuse de KV cache.

https://arxiv.org/abs/2512.06727

### [I-LEXICO] Kim et al. — Lexico

Sparse-coding KV compression.

https://arxiv.org/abs/2412.08890

### [I-CSR] Zhang et al. — CSR

Sparse representation para KV cache.

https://arxiv.org/abs/2412.11741

### [I-PHOTON] Ichikawa et al. — PHOTON

Arquitectura autoregresiva jerárquica; investigación, no backend QVAC.

https://arxiv.org/abs/2512.20687

### [I-SURVEY] Li et al. — LLM Inference Serving

Survey de systems optimizations para serving.

https://arxiv.org/abs/2407.12391

### [I-PARETO] Recasens et al. — Towards Pareto Optimal Throughput in SLM Serving

SLM resource capacity, throughput y replication.

https://arxiv.org/abs/2404.03353

### [A-DEGEN] Holtzman et al. — The Curious Case of Neural Text Degeneration

Degeneration y nucleus sampling.

https://arxiv.org/abs/1904.09751

### [A-LANG] Marchisio et al. — Understanding and Mitigating Language Confusion

Language confusion y efecto observado de high sampling temperature.

https://aclanthology.org/2024.emnlp-main.380/

### [S-RASCHKA] Sebastian Raschka — temperature/top-k/top-p explanation

Explicación pedagógica secundaria de sampling.

https://sebastianraschka.com/faq/docs/temperature-topk-topp-sampling.html

## Fuentes complementarias del corpus original

El corpus solicitado también incluía materiales pedagógicos de APXML, Medium,
Tonisagrista, Kaitchup, KnightLi, MachineLearningMastery, BentoML, LearnCSDesigns,
ResearchGate y Wikipedia. Se consultan como apoyo cuando ayudan a construir intuición,
pero las afirmaciones centrales de GGUF/quantization, QVAC y papers se anclan en las
fuentes primarias listadas arriba. Esta decisión evita que una simplificación de un
tutorial sustituya una especificación o API vigente.
