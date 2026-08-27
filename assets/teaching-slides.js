(() => {
  const deck = document.querySelector('.deck')
  if (!deck) return

  const extras = {
    Embeddings: [
      ['Representación', 'Un vector conserva relaciones; no una etiqueta humana por dimensión.'],
      ['Corpus', 'La calidad del ranking depende de cobertura, idioma, dominio y duplicados.'],
      ['Batch', 'Embebe documentos en preparación y la query al llegar; son costos distintos.'],
      ['Dimensiones', 'Comprueba longitud, modelo y configuración antes de comparar.'],
      ['Top-K', 'K pequeño puede ocultar evidencia; K grande añade ruido a la inspección.'],
      ['Evaluación', 'Crea queries esperadas y mide recall@K antes de cambiar el modelo.'],
      ['Reproducibilidad', 'Guarda modelo, métrica, corpus, query y fecha junto al ranking.'],
      ['Fallo típico', 'Un resultado plausible puede ser semánticamente cercano y operacionalmente inútil.'],
      ['Puente a RAG', 'El vector encuentra contexto; todavía falta persistirlo y citarlo.'],
      ['Cierre', 'Meaning → representation → comparison → evidence.'],
    ],
    'Local RAG': [
      ['Dos memorias', 'Los pesos aportan conocimiento paramétrico; el índice aporta evidencia externa.'],
      ['Chunking', 'La unidad recuperable decide cuánto contexto conserva cada resultado.'],
      ['Metadata', 'Fuente, título, sección y versión deben viajar con cada chunk.'],
      ['Ingestión', 'Procesar documentos no es responder; mide la preparación por separado.'],
      ['Retrieval', 'Inspecciona rank, score y contenido antes de llamar al LLM.'],
      ['Grounding', 'El modelo debe responder desde evidencia o declarar insuficiencia.'],
      ['Citas', 'Una cita válida viene de metadata real, no de una URL inventada.'],
      ['Unknown test', 'Pregunta algo fuera del corpus y exige una negativa explicable.'],
      ['Break it', 'Omitir una fuente, cambiar K y degradar chunks revela fallos distintos.'],
      ['Cierre', 'RAG es una cadena: chunk → embed → store → retrieve → cite.'],
    ],
    'Speech Systems': [
      ['PCM', 'Muestras y contenedor no son lo mismo; declara el formato antes de inferir.'],
      ['Ventanas', 'Solapamiento protege fronteras y consume más cómputo: es una política.'],
      ['VAD', 'Reducir silencio mejora costo, pero un umbral agresivo corta palabras.'],
      ['Segmentos', 'startMs, endMs y segmentId permiten ordenar y depurar.'],
      ['ASR', 'Primer texto, texto final y razón terminal responden preguntas diferentes.'],
      ['TTS', 'Sample rate y canales de salida deben verificarse antes de reproducir.'],
      ['Cancelación', 'Detener un turno también libera buffers y evita audio obsoleto.'],
      ['Privacidad', 'Offline se prueba con red bloqueada, artefactos locales y logs sanitizados.'],
      ['Métricas', 'Separa first-text, first-audio, duración total y real-time factor.'],
    ],
    'Translation': [
      ['Segmentos finales', 'Solo el final puede convertirse en audio durable sin política de reemplazo.'],
      ['Orden', 'segmentId impide que una respuesta tardía sobrescriba una más nueva.'],
      ['Colas', 'La cola necesita límite, política de descarte y señal de saturación.'],
      ['Modelos', 'LLM local y traductor especializado cambian cobertura, control y costo.'],
      ['Backpressure', 'Captura sigue; el consumidor lento no puede congelar la entrada.'],
      ['Errores', 'Clasifica captura, ASR, traducción, TTS y reproducción por separado.'],
      ['Fallback', 'Degradar a texto puede ser mejor que reproducir una frase obsoleta.'],
      ['Medición', 'RTF y firstAudioMs explican la experiencia mejor que tok/s aislado.'],
      ['Offline proof', 'Bloquea red y conserva evidencia de que cada modelo estaba provisionado.'],
    ],
    'OpenAI-Compatible': [
      ['/v1/models', 'La primera prueba descubre IDs reales; nunca supongas que el nombre cloud existe local.'],
      ['Normal vs SSE', 'Son dos contratos de transporte y deben tener pruebas separadas.'],
      ['Parser', 'Acumula delta.content, maneja [DONE] y conserva buffer provisional.'],
      ['Capabilities', 'Tools, JSON, visión, embeddings y contexto requieren verificación propia.'],
      ['Adapter', 'Centraliza baseURL, model, errores, timeout y capacidades observadas.'],
      ['Errores', '404, 400, ECONNREFUSED y timeout apuntan a causas diferentes.'],
      ['Localhost', 'No requiere Internet, pero sí un servidor y assets locales disponibles.'],
      ['Fail closed', 'Datos privados no deben saltar a cloud por un catch genérico.'],
      ['ADR', 'Registra decisión, evidencia, fecha, modelo y trade-offs comparables.'],
    ],
    'Local-First': [
      ['Datos', 'Pregunta qué bytes salen antes de preguntar qué modelo responde.'],
      ['Ejecución', 'El lugar donde calculan tokens es una decisión distinta de la ruta de datos.'],
      ['Confianza', 'Allowlist, TLS y logs minimizados controlan quién observa o cambia resultados.'],
      ['Clasificación', 'Sensibilidad y capability determinan la ruta antes del transporte.'],
      ['Consentimiento', 'Remote-consented exige permiso vigente y endpoint permitido.'],
      ['Refuse', 'Rechazar de forma explicable es una salida correcta cuando no hay ruta segura.'],
      ['Invariantes', 'Escríbelos antes del código para poder probarlos bajo presión.'],
      ['Auditoría', 'Registra la decisión sin guardar contenido sensible.'],
      ['SLO', 'Latencia, costo, disponibilidad y calidad deben medirse por clase de solicitud.'],
    ],
  }

  const key = Object.keys(extras).find((candidate) => document.title.includes(candidate))
  const current = [...deck.querySelectorAll('.slide')]
  if (key) {
    extras[key].forEach(([eyebrow, title]) => {
      if (deck.querySelectorAll('.slide').length >= 25) return
      const slide = document.createElement('section')
      slide.className = 'slide'
      slide.innerHTML = `<div class="eyebrow">${eyebrow}</div><h2>${title}</h2><p class="lede">Conecta esta observación con el experimento y la evidencia de la clase.</p>`
      deck.appendChild(slide)
    })
  }

  const slides = [...deck.querySelectorAll('.slide')]
  // La interfaz habla de diagnóstico y evidencia; los nombres internos no
  // aparecen en el deck presentado al estudiante.
  deck.querySelectorAll('.eyebrow, h1, h2, p, li, footer').forEach((node) => {
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        child.textContent = child.textContent
          .replace(/Break It/gi, 'Diagnóstico')
          .replace(/Measure It/gi, 'Medición')
      }
    })
  })
  let currentSlide = 0
  const progress = document.createElement('div')
  progress.className = 'progress'
  document.body.append(progress)
  const hint = document.createElement('div')
  hint.className = 'hint'
  hint.textContent = '← → · espacio · Home / End'
  document.body.append(hint)
  slides.forEach((slide, index) => {
    const foot = document.createElement('div')
    foot.className = 'footline'
    foot.innerHTML = `<span class="section">QVAC · ${document.title}</span><span class="num">${index + 1} / ${slides.length}</span>`
    slide.append(foot)
  })

  function fit() {
    const scale = Math.min(innerWidth / 1920, innerHeight / 1080)
    deck.style.transform = `scale(${scale})`
    deck.style.left = `${(innerWidth - 1920 * scale) / 2}px`
    deck.style.top = `${(innerHeight - 1080 * scale) / 2}px`
  }
  function show(next) {
    currentSlide = Math.max(0, Math.min(slides.length - 1, next))
    slides.forEach((slide, index) => slide.classList.toggle('active', index === currentSlide))
    progress.style.width = `${((currentSlide + 1) / slides.length) * 100}%`
    window.parent?.postMessage({ type: 'qvac-slides', current: currentSlide + 1, total: slides.length }, '*')
  }
  addEventListener('resize', fit)
  addEventListener('keydown', (event) => {
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(event.key)) { event.preventDefault(); show(currentSlide + 1) }
    if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(event.key)) { event.preventDefault(); show(currentSlide - 1) }
    if (event.key === 'Home') show(0)
    if (event.key === 'End') show(slides.length - 1)
  })
  addEventListener('touchstart', (event) => { document.body.dataset.touchStart = event.changedTouches[0].clientX }, { passive: true })
  addEventListener('touchend', (event) => {
    const delta = event.changedTouches[0].clientX - Number(document.body.dataset.touchStart || 0)
    if (Math.abs(delta) > 45) show(currentSlide + (delta < 0 ? 1 : -1))
  }, { passive: true })

  function applyMode(ui, theme) {
    const root = document.documentElement
    const ninja = ui === 'ninja'
    root.classList.toggle('ninja-slides', ninja)
    root.classList.toggle('slides-dark', !ninja && theme === 'dark')
  }
  const params = new URLSearchParams(location.search)
  applyMode(params.get('ui') || 'docs', params.get('theme') || 'light')
  addEventListener('message', (event) => {
    if (event.source === window.parent && event.data?.type === 'qvac-ui') applyMode(event.data.ui, event.data.theme)
  })
  fit()
  show(0)
})()
