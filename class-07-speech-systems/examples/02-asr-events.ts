// Adapt the TODO to the ASR client/version installed in your QVAC runtime.
const events = [
  { type: 'audioFrame', turnId: 'demo', bytes: 32000 },
  { type: 'transcriptFinal', turnId: 'demo', text: '<local ASR transcript>', segments: [] },
]
for (const event of events) console.log(JSON.stringify(event))

