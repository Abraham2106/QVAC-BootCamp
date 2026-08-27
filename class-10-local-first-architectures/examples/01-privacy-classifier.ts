type Sensitivity = 'high' | 'medium' | 'low'
type Request = { id: string; purpose: string; contains: string[]; needs: string }

const requests: Request[] = [
  { id: 'r1', purpose: 'summarize clinical note', contains: ['health'], needs: 'summary' },
  { id: 'r2', purpose: 'rewrite public announcement', contains: [], needs: 'rewrite' },
  { id: 'r3', purpose: 'summarize private contract', contains: ['confidential'], needs: 'summary' },
  { id: 'r4', purpose: 'translate public menu', contains: [], needs: 'translation' },
]

function classify(request: Request): Sensitivity {
  if (request.contains.some((item) => ['health', 'credential', 'secret'].includes(item))) return 'high'
  if (request.contains.includes('confidential')) return 'medium'
  return 'low'
}

for (const request of requests) {
  const sensitivity = classify(request)
  const route = sensitivity === 'high' ? 'local-only' : 'local-first'
  console.log(`${request.id}: ${sensitivity} → ${route} (${request.needs})`)
}

export { classify }
