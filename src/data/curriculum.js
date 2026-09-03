export const LEVELS = [
  { title: 'Own the inference', desc: 'Modelos locales, ciclo de vida, modo avión' },
  { title: 'Own the knowledge', desc: 'Embeddings y RAG privado' },
  { title: 'Beyond text', desc: 'ASR, TTS y traducción local' },
  { title: 'Replace the cloud', desc: 'Servidor OpenAI-compatible, arquitecturas local-first' },
  { title: 'Connect devices', desc: 'Inferencia delegada P2P e intelligence mesh' },
]

export const TEACHING = [
  {
    tag: 'Backward design',
    title: 'Primero la evidencia',
    body: 'Cada clase parte de lo que deberás demostrar al terminar. El capstone y sus acceptance tests existen antes que las lecciones.',
  },
  {
    tag: 'Predict → Run → Explain',
    title: 'Predice antes de ejecutar',
    body: 'Te comprometes con un modelo mental por escrito, y luego el sistema te confirma o lo corrige con evidencia.',
  },
  {
    tag: 'Diagnóstico · evidencia',
    title: 'Rómpelo y mídelo',
    body: 'Ninguna abstracción está entendida hasta ver un fallo significativo — y ninguna afirmación de rendimiento sin números propios.',
  },
]

export const MODULES = [
  {
    id: 'm1',
    no: 'MÓDULO 1',
    name: 'Your First Local Token — Own the inference',
    classes: [
      {
        no: '01',
        slug: 'class-01',
        title: 'Airplane-Mode Intelligence',
        desc: '¿Qué significa realmente que una app de IA sea local? Provisiona, ejecuta offline y demuéstralo.',
        href: '/class/01',
        available: true,
        badges: ['lesson', 'lab', 'examples', 'challenge', 'assessment', 'instructor', 'notebooklm'],
      },
      {
        no: '02',
        slug: 'class-02',
        title: 'Models, GGUF and the QVAC Lifecycle',
        desc: '¿Qué cargamos realmente al "cargar un modelo"? Pesos, tokenizer, cuantización y nombres.',
        href: '/class/02',
        available: true,
        badges: ['lesson', 'lab', 'examples', 'challenge', 'assessment', 'instructor', 'notebooklm'],
      },
      {
        no: '03',
        slug: 'class-03',
        title: 'Local Inference Fundamentals',
        desc: '¿Qué ocurre entre un prompt y el siguiente token? Tokens, sampling, KV cache, TTFT vs tok/s.',
        href: '/class/03',
        available: true,
        badges: ['lesson', 'lab', 'examples', 'challenge', 'assessment', 'instructor', 'notebooklm'],
      },
      {
        no: '04',
        slug: 'class-04',
        title: 'Build the Offline Chat',
        desc: 'De inferencia aislada a aplicación confiable: historial, streaming, cancelación y persistencia local.',
        href: '/class/04',
        available: true,
        badges: ['lesson', 'lab', 'examples', 'challenge', 'assessment', 'instructor', 'notebooklm'],
      },
    ],
  },
  {
    id: 'm2',
    no: 'MÓDULO 2',
    name: 'Private Knowledge — Own the knowledge',
    classes: [
      {
        no: '05',
        slug: 'class-05',
        title: 'Embeddings: Meaning as Geometry',
        desc: 'Cómo encontrar significado relacionado sin coincidencia literal de palabras.',
        href: '/class/05',
        available: true,
        badges: ['lesson', 'lab', 'examples', 'challenge', 'assessment', 'instructor', 'notebooklm'],
      },
      {
        no: '06',
        slug: 'class-06',
        title: 'Local RAG and Private Knowledge',
        desc: 'Responder desde conocimiento fuera de los pesos: chunk → embed → store → retrieve → cite.',
        href: '/class/06',
        available: true,
        badges: ['lesson', 'lab', 'examples', 'challenge', 'assessment', 'instructor', 'notebooklm'],
      },
    ],
  },
  {
    id: 'm3',
    no: 'MÓDULO 3',
    name: 'Beyond Text — Expand beyond text',
    classes: [
      {
        no: '07',
        slug: 'class-07',
        title: 'Speech Systems: ASR and TTS',
        desc: 'Audio continuo como entrada y salida: PCM, streaming, Whisper/Parakeet y síntesis local.',
        href: '/class/07', available: true,
        badges: ['lesson', 'lab', 'examples', 'challenge', 'assessment', 'instructor', 'notebooklm'],
      },
      {
        no: '08',
        slug: 'class-08',
        title: 'Translation and the Voice Relay',
        desc: 'Múltiples modelos especializados convertidos en una experiencia de intérprete en tiempo real.',
        href: '/class/08', available: true,
        badges: ['lesson', 'lab', 'examples', 'challenge', 'assessment', 'instructor', 'notebooklm'],
      },
    ],
  },
  {
    id: 'm4',
    no: 'MÓDULO 4',
    name: 'Drop-in Sovereignty — Replace cloud dependencies',
    classes: [
      {
        no: '09',
        slug: 'class-09',
        title: 'The OpenAI-Compatible Escape Hatch',
        desc: 'Cambiar dónde corre la inteligencia sin rediseñar el cliente: localhost:11434/v1.',
        href: '/class/09', available: true,
        badges: ['lesson', 'lab', 'examples', 'challenge', 'assessment', 'instructor', 'notebooklm'],
      },
      {
        no: '10',
        slug: 'class-10',
        title: 'Designing Local-First Architectures',
        desc: '¿Debe todo correr local? Fronteras de privacidad, fallbacks y Architecture Decision Records.',
        href: '/class/10', available: true,
        badges: ['lesson', 'lab', 'examples', 'challenge', 'assessment', 'instructor', 'notebooklm'],
      },
    ],
  },
  {
    id: 'm5',
    no: 'MÓDULO 5',
    name: 'The Intelligence Mesh — Connect intelligence across devices',
    classes: [
      {
        no: '11',
        slug: 'class-11',
        title: 'Delegated Inference Over P2P',
        desc: 'Conecta a un providerPublicKey conocido sobre Hyperswarm DHT; cold/warm, timeouts y fallbackToLocal.',
        available: false,
      },
      {
        no: '12',
        slug: 'class-12',
        title: 'Build the Intelligence Mesh',
        desc: 'Topología multi-dispositivo, routing por capacidades y defensa de decisiones de colocación.',
        available: false,
      },
    ],
  },
]

export const CAPSTONE = {
  no: '★',
  title: 'Build and Defend a Local-First AI System',
  desc: 'Diseña, construye, mide y defiende un sistema que combina inferencia local, RAG privado, voz, servidor compatible y una ruta delegada — con seis acceptance tests incluido el Airplane-Mode Test.',
}

export const CLASS01 = {
  id: 'class-01',
  kicker: 'Clase 01 · Módulo 1 — Your First Local Token',
  title: 'Airplane-Mode Intelligence',
  eq: '¿Qué significa realmente que una aplicación de IA sea local?',
  outcomes: [
    { tag: 'Outcome 1–2', title: 'Concepto + ruta de datos', body: 'Cuatro categorías de "local", cuatro fases, y el mapa App → SDK → worker Bare → modelo.' },
    { tag: 'Outcome 3–4', title: 'Provisionar + offline', body: 'downloadAsset() con progreso reanudable y carga desde caché validada por checksum.' },
    { tag: 'Outcome 5–6', title: 'Clasificar + medir', body: 'Dependencias local vs red, y tus números: descarga, load time, TTFT, tok/s.' },
  ],
  dodItems: [
    { id: 'corridaA', label: 'Corrida A (con red) documentada con salida completa' },
    { id: 'corridaB', label: 'Corrida B (modo avión) generando texto desde caché' },
    { id: 'metricas', label: 'Tabla frío/tibio con unidades: descarga, carga, TTFT, tok/s' },
    { id: 'breakit', label: 'Los 4 escenarios con predicción previa + diagnóstico' },
    { id: 'checkpoint', label: 'Checkpoint respondido (nivel ≥3 en criterios 1–5 de la rúbrica)' },
  ],
}

export const CLASS02 = {
  id: 'class-02',
  kicker: 'Clase 02 · Módulo 1 — Your First Local Token',
  title: 'Models, GGUF and the QVAC Lifecycle',
  eq: '¿Qué estamos cargando realmente cuando "cargamos un modelo"?',
  outcomes: [
    { tag: 'Outcome 1–2', title: 'Anatomía + GGUF', body: 'Pesos, tensors, tokenizer, metadata — y por qué checkpoint ≠ formato de inferencia.' },
    { tag: 'Outcome 3–4', title: 'Cuantización + nombres', body: 'F32→Q4 con números de referencia, y la gramática de QWEN3_4B_INST_Q4_K_M.' },
    { tag: 'Outcome 5–6', title: 'Ciclo de vida + decisión', body: 'find→download→validate→load→infer→reuse→unload→close, medido y justificado.' },
  ],
  dodItems: [
    { id: 'anatomia', label: 'Explicas las piezas internas de un GGUF sin mirar la lección' },
    { id: 'nombres', label: 'Decodificas 3 nombres de catálogo (familia/escala/INST/cuant)' },
    { id: 'comparacion', label: 'Comparación medida de 2 modelos (carga, TTFT, tok/s, memoria)' },
    { id: 'breakit', label: 'Un fallo de recurso insuficiente diagnosticado por fase' },
    { id: 'report', label: 'Model Selection Report con matriz + defensa oral de 3 minutos' },
  ],
}

export const CLASS03 = {
  id: 'class-03',
  kicker: 'Clase 03 · Módulo 1 — Your First Local Token',
  title: 'Local Inference Fundamentals',
  eq: '¿Qué ocurre entre un prompt y el siguiente token generado, y cómo podemos observar las consecuencias?',
  outcomes: [
    { tag: 'Outcome 1–3', title: 'Tokens + autoregresión', body: 'Texto ≠ tokens, bucle next-token, y la diferencia entre prefill y decodificación.' },
    { tag: 'Outcome 4–6', title: 'Streaming + sampling', body: 'Superficie canónica events/final, contentDelta → completionDone, y temp/top_k como reglas de selección.' },
    { tag: 'Outcome 7–9', title: 'Contexto + cache + métricas', body: 'Presión de history, KV cache reutilizable, y TTFT ≠ tok/s ≠ latencia total.' },
  ],
  dodItems: [
    { id: 'streaming', label: 'Corrida streaming interpretando contentDelta → completionStats → completionDone' },
    { id: 'sampling', label: 'Comparación de sampling (mismo prompt, una variable controlada)' },
    { id: 'context', label: 'Experimento de contexto (history corta vs larga)' },
    { id: 'kvcache', label: 'Comparación KV cache on vs off en follow-up' },
    { id: 'breakit', label: 'Diagnóstico con evidencia (stopReason, stats, contenido parcial)' },
    { id: 'report', label: 'Inference Experiment Report con conclusión basada en medición' },
  ],
}

export const CLASS04 = {
  id: 'class-04',
  kicker: 'Clase 04 · Módulo 1 — Your First Local Token',
  title: 'Build the Offline Chat',
  eq: '¿Cómo convertimos inferencia local en una aplicación de chat confiable con historial, streaming y persistencia?',
  outcomes: [
    { tag: 'Outcome 1–5', title: 'Estado + history + streaming', body: 'Tres lifecycles, historial multi-turno explícito, events/final, y frontera provisional vs committed.' },
    { tag: 'Outcome 6–10', title: 'Cancel + persist + reuse', body: 'Cancelación por requestId, JSON local, restore tras restart, y reutilización del modelo entre turnos.' },
    { tag: 'Outcome 11–15', title: 'Métricas + offline + defensa', body: 'TTFT/tok/s por turno, shutdown limpio, verificación modo avión, diagnóstico de consistencia y política de commit defendida.' },
  ],
  dodItems: [
    { id: 'multiturn', label: 'Multi-turn: follow-up usa historial de turnos previos (acceptance A)' },
    { id: 'streaming', label: 'Streaming: salida incremental vía contentDelta (acceptance B)' },
    { id: 'cancel', label: 'Cancelación: /cancel sin commitear turno parcial (acceptance C)' },
    { id: 'persist', label: 'Persistencia: transcript restaurado tras exit + restart (acceptance D)' },
    { id: 'offline', label: 'Modo avión: nueva completion tras restart sin red (acceptance E)' },
    { id: 'metrics', label: 'Métricas por turno: TTFT, duración, tok/s, stopReason (acceptance F)' },
    { id: 'breakit', label: 'Diagnóstico: cancel entre stream y commit (persistencia parcial)' },
  ],
}

export const CLASS05 = {
  id: 'class-05',
  kicker: 'Clase 05 · Módulo 2 — Private Knowledge',
  title: 'Embeddings: Meaning as Geometry',
  eq: '¿Cómo puede una máquina encontrar significado relacionado sin buscar las mismas palabras?',
  outcomes: [
    { tag: 'Outcome 1–2', title: 'Representación + límites', body: 'Texto → vector, embeddings ≠ generación y dimensiones observadas en runtime, no inventadas.' },
    { tag: 'Outcome 3–5', title: 'Similarity + ranking', body: 'Query/document embeddings, cosine similarity en aplicación y Top-K visible con scores.' },
    { tag: 'Outcome 6–8', title: 'Measure + diagnose', body: 'Latencia por etapa, hard negatives, query ambigua, corpus insuficiente y explicación basada en evidencia.' },
  ],
  dodItems: [
    { id: 'single', label: 'Generé single + batch embeddings y observé dimensions en runtime' },
    { id: 'predict', label: 'Escribí un ranking esperado antes de ejecutar semantic search' },
    { id: 'topk', label: 'Semantic Search v1 muestra Top-K + scores + texto' },
    { id: 'metrics', label: 'Separé corpus embedding, query embedding y ranking latency' },
    { id: 'breakit', label: 'Diagnostiqué una query ambigua con evidencia' },
    { id: 'stress', label: 'Evalué negación, fecha, cantidad, entidad y pregunta fuera del corpus' },
    { id: 'report', label: 'Entregué Semantic Search Report con límites de la conclusión' },
  ],
}

export const CLASS06 = {
  id: 'class-06',
  kicker: 'Clase 06 · Módulo 2 — Private Knowledge',
  title: 'Local RAG and Private Knowledge',
  eq: '¿Cómo puede un modelo responder desde conocimiento que no vive en sus pesos?',
  outcomes: [
    { tag: 'Outcome 1–3', title: 'External memory + pipeline', body: 'Parametric vs external knowledge; document → chunk → embed → workspace → retrieval.' },
    { tag: 'Outcome 4–6', title: 'Grounding + provenance', body: 'Top-K visible antes del LLM, evidence context y fuentes reales mantenidas por el pipeline.' },
    { tag: 'Outcome 7–9', title: 'Unknown + diagnose + measure', body: 'Abstención, evidencia obsoleta, retrieval vs generation failure y latencias por etapa.' },
  ],
  dodItems: [
    { id: 'ingest', label: 'Ingesté un corpus local en workspace y documenté lifecycle' },
    { id: 'predict', label: 'Predije Top-1 antes de ejecutar una query answerable' },
    { id: 'retrieval', label: 'Mostré Top-K + score + contenido antes de generation' },
    { id: 'grounding', label: 'Generé una respuesta usando un bloque de evidencia explícito' },
    { id: 'unknown', label: 'Unknown Knowledge Test no inventa provenance' },
    { id: 'breakit', label: 'Distinguí retrieval failure de generation failure' },
    { id: 'metrics', label: 'Separé retrieval latency de generation latency' },
    { id: 'lifecycle', label: 'Versioné evidencia y comprobé actualización o borrado con una query' },
  ],
}

export const CLASS07 = {
  id: 'class-07',
  kicker: 'Clase 07 · Módulo 3 — Beyond Text',
  title: 'Speech Systems: ASR and TTS',
  eq: '¿Cómo convertimos audio continuo en una conversación local medible, sin confundir bytes, texto y voz?',
  outcomes: [
    { tag: 'Outcome 1–3', title: 'Contratos de audio + ASR', body: 'PCM, sample rate, canales, ventanas, VAD y segmentos con timestamps.' },
    { tag: 'Outcome 4–6', title: 'TTS + experiencia', body: 'Síntesis local, formato de salida, primer audio y backpressure.' },
    { tag: 'Outcome 7–10', title: 'Relay + medición', body: 'Correlación por turno, cancelación, privacidad y diagnóstico reproducible.' },
  ],
  dodItems: [
    { id: 'pcm', label: 'Contrato PCM documentado y validado (sample rate, canales, formato)' },
    { id: 'asr', label: 'ASR local produce texto y segmentos/timestamps' },
    { id: 'tts', label: 'TTS local produce audio reproducible con formato declarado' },
    { id: 'relay', label: 'Relay ASR → texto → TTS correlacionado por turnId' },
    { id: 'metrics', label: 'Métricas separan first-text, first-audio y total' },
    { id: 'breakit', label: 'Sample rate/backpressure diagnosticado con evidencia' },
  ],
}

export const CLASS08 = {
  id: 'class-08',
  kicker: 'Clase 08 · Módulo 3 — Beyond Text',
  title: 'Translation and the Voice Relay',
  eq: '¿Cómo convertimos ASR y TTS en un intérprete local que no repite, no se atrasa y no filtra datos?',
  outcomes: [
    { tag: 'Outcome 1–2', title: 'Contratos + partial vs final', body: 'PCM, transcriptPartial/transcriptFinal, traducción y audio con segmentId monótono.' },
    { tag: 'Outcome 3–5', title: 'Ruta de traducción + relay', body: 'qvac-fabric-llm.cpp vs Bergamot, encadenamiento sin bloquear captura, backpressure y descarte de obsoletos.' },
    { tag: 'Outcome 6–7', title: 'Medición + privacidad', body: 'Primer audio, latencias por etapa, RTF y prueba offline sin red con política de fallo explícita.' },
  ],
  dodItems: [
    { id: 'contratos', label: 'Contratos PCM/transcript/traducción/audio documentados con segmentId' },
    { id: 'ruta', label: 'Ruta de traducción elegida y justificada (LLM generativo vs Bergamot)' },
    { id: 'relay', label: 'Relay ASR → traducción → TTS ordenado con 5 segmentos medidos' },
    { id: 'backpressure', label: 'Backpressure y descarte fuera de orden verificados (cola TTS acotada)' },
    { id: 'metricas', label: 'Tabla por etapa + RTF y primer audio por segmento' },
    { id: 'breakit', label: 'Break It offline: TTS lento, fallo de traducción y cierre durante TTS' },
  ],
}

export const CLASS09 = {
  id: 'class-09',
  kicker: 'Clase 09 · Módulo 4 — Drop-in Sovereignty',
  title: 'The OpenAI-Compatible Escape Hatch',
  eq: '¿Cómo cambiamos una aplicación de un proveedor remoto a inferencia local sin reescribir su cliente?',
  outcomes: [
    { tag: 'Outcome 1–4', title: 'Contrato + streaming', body: 'baseURL como frontera, /v1/models, /v1/chat/completions y SSE con deltas hasta [DONE].' },
    { tag: 'Outcome 5–7', title: 'Migración + límites', body: 'Adapter sin if(local) disperso, tools/JSON/visión reverificados y tres dependencias separadas.' },
    { tag: 'Outcome 8–10', title: 'Medición + fallback + ADR', body: 'TTFT/duración/tok/s comparables, fallback fail-closed y decisión documentada.' },
  ],
  dodItems: [
    { id: 'contrato', label: 'Contrato verificado: /v1/models + completion normal + stream SSE hasta [DONE]' },
    { id: 'migracion', label: 'Cliente migrado solo con QVAC_BASE_URL / QVAC_MODEL, sin clave real en código' },
    { id: 'errores', label: 'Cuatro fallos clasificados: URL, contrato, modelo y recurso (ECONNREFUSED, 404, 400…)' },
    { id: 'offline', label: 'Prueba offline: red cortada con servidor activo, luego servidor detenido' },
    { id: 'metricas', label: 'Métricas local vs remoto con contexto de hardware/modelo' },
    { id: 'fallback', label: 'Fallback seguro fail-closed para datos privados, sin cloud silencioso' },
    { id: 'adr', label: 'ADR-009 con capacidades verificadas y límites no verificados' },
  ],
}

export const CLASS10 = {
  id: 'class-10',
  kicker: 'Clase 10 · Módulo 4 — Drop-in Sovereignty',
  title: 'Designing Local-First Architectures',
  eq: '¿Debe todo correr local? No: ¿qué datos, capacidades y fallos pueden cruzar una frontera?',
  outcomes: [
    { tag: 'Outcome 1–3', title: 'Fronteras + clasificación', body: 'Datos, ejecución y confianza; matriz de sensibilidad vs capacidad antes de enrutar.' },
    { tag: 'Outcome 4–6', title: 'ADR + fallback seguro', body: 'Decisión auditable, consentimiento, allowlist, timeout y degradación explícita.' },
    { tag: 'Outcome 7–8', title: 'Medición + exfiltración', body: 'Latencia, éxito local, bloqueos y Exfiltration Test con red bloqueada.' },
  ],
  dodItems: [
    { id: 'fronteras', label: 'Diagrama con las tres fronteras: datos, ejecución y confianza' },
    { id: 'matriz', label: 'Matriz de rutas con invariantes y pruebas automatizadas' },
    { id: 'adr', label: 'ADR con decisión, alternativas, invariantes y consecuencias' },
    { id: 'fallback', label: 'Fallback con consentimiento, allowlist, timeout y trazabilidad sin PII' },
    { id: 'exfiltracion', label: 'Exfiltration Test: red bloqueada + endpoint malicioso rechazado' },
    { id: 'metricas', label: 'Tabla p50/p95, éxito local y decisiones bloqueadas con contexto' },
  ],
}
