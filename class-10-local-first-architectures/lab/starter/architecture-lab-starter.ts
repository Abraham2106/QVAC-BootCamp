type Sensitivity = 'high' | 'medium' | 'low'
type Request = { id: string; sensitivity: Sensitivity; localReady: boolean; consent: boolean; endpointAllowed: boolean }

// TODO: conserva el orden de las invariantes: local → sensibilidad → consentimiento → allowlist.
export function route(request: Request): 'local' | 'remote' | 'refuse' {
  if (request.localReady) return 'local'
  if (request.sensitivity === 'high') return 'refuse'
  if (!request.consent || !request.endpointAllowed) return 'refuse'
  return 'remote'
}

const sample: Request[] = [
  { id: 'high-offline', sensitivity: 'high', localReady: false, consent: true, endpointAllowed: true },
  { id: 'medium-consented', sensitivity: 'medium', localReady: false, consent: true, endpointAllowed: true },
  { id: 'low-local', sensitivity: 'low', localReady: true, consent: false, endpointAllowed: false },
]
for (const request of sample) console.log(request.id, route(request))
