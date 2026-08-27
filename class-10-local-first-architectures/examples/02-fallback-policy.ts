type DecisionInput = { sensitivity: 'high' | 'medium' | 'low'; localReady: boolean; consent: boolean; endpointAllowed: boolean; timedOut?: boolean }
type Decision = { route: 'local' | 'remote' | 'refuse'; reason: string }

export function decide(input: DecisionInput): Decision {
  if (input.localReady) return { route: 'local', reason: 'preferred local route' }
  if (input.sensitivity === 'high') return { route: 'refuse', reason: 'high-sensitivity data is local-only' }
  if (!input.consent) return { route: 'refuse', reason: 'remote fallback requires consent' }
  if (!input.endpointAllowed) return { route: 'refuse', reason: 'endpoint is not allowlisted' }
  if (input.timedOut) return { route: 'refuse', reason: 'fallback timeout exceeded' }
  return { route: 'remote', reason: 'consented and allowlisted fallback' }
}

const cases: DecisionInput[] = [
  { sensitivity: 'high', localReady: false, consent: true, endpointAllowed: true },
  { sensitivity: 'medium', localReady: false, consent: false, endpointAllowed: true },
  { sensitivity: 'low', localReady: false, consent: true, endpointAllowed: true },
  { sensitivity: 'low', localReady: false, consent: true, endpointAllowed: true, timedOut: true },
]
for (const input of cases) console.log(decide(input))
