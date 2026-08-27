/** Static asset path (e.g. `/class-01-…/lab/README.md`) → SPA markdown viewer route. */
export function markdownRoute(staticPath) {
  const normalized = staticPath.startsWith('/') ? staticPath.slice(1) : staticPath
  return `/markdown/${normalized}`
}

export function isMarkdownStaticPath(path) {
  return typeof path === 'string' && /\.md$/i.test(path)
}

/** Best-effort back link from a static markdown path to its class page. */
export function markdownBackLink(staticPath) {
  if (staticPath.includes('class-01-airplane-mode-intelligence')) return '/class/01'
  if (staticPath.includes('class-02-models-gguf-lifecycle')) return '/class/02'
  if (staticPath.includes('class-03-local-inference-fundamentals')) return '/class/03'
  if (staticPath.includes('class-04-build-offline-chat')) return '/class/04'
  if (staticPath.includes('class-05-embeddings-meaning-as-geometry')) return '/class/05'
  if (staticPath.includes('class-06-local-rag-private-knowledge')) return '/class/06'
  if (staticPath.includes('class-07-speech-systems')) return '/class/07'
  if (staticPath.includes('class-08-translation-voice-relay')) return '/class/08'
  return '/curriculum'
}

export function markdownTitleFromPath(staticPath) {
  const segment = staticPath.split('/').filter(Boolean).pop() || 'Documento'
  return decodeURIComponent(segment.replace(/\.md$/i, ''))
}
