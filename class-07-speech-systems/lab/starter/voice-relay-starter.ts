type AudioFormat = { sampleRate: number; channels: 1 | 2; sampleFormat: 's16le' }
type Segment = { id: number; startMs: number; endMs: number; text: string }
type Event =
  | { type: 'audioFrame'; turnId: string; bytes: number }
  | { type: 'transcriptFinal'; turnId: string; text: string; segments: Segment[] }
  | { type: 'speechChunk'; turnId: string; bytes: number }
  | { type: 'turnDone'; turnId: string; metrics: Record<string, number> }
  | { type: 'turnError'; turnId: string; reason: string }

const INPUT: AudioFormat = { sampleRate: 16_000, channels: 1, sampleFormat: 's16le' }

function assertAudioFormat(format: AudioFormat) {
  if (![8_000, 16_000, 22_050, 44_100, 48_000].includes(format.sampleRate)) {
    throw new Error(`Unsupported sample rate: ${format.sampleRate}`)
  }
  if (format.sampleFormat !== 's16le') throw new Error('Expected signed 16-bit little-endian PCM')
}

export async function* relay(turnId: string, pcm: Uint8Array, format = INPUT): AsyncGenerator<Event> {
  assertAudioFormat(format)
  const started = performance.now()
  yield { type: 'audioFrame', turnId, bytes: pcm.byteLength }

  // TODO 1: call the installed QVAC ASR backend and retain segment timestamps.
  const transcript = { text: '<ASR transcript>', segments: [] as Segment[] }
  yield { type: 'transcriptFinal', turnId, ...transcript }

  // TODO 2: call local TTS; yield each audio chunk and apply backpressure.
  const speechBytes = new Uint8Array()
  if (speechBytes.byteLength) yield { type: 'speechChunk', turnId, bytes: speechBytes.byteLength }
  yield { type: 'turnDone', turnId, metrics: { totalMs: performance.now() - started, inputBytes: pcm.byteLength } }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const pcm = new Uint8Array(INPUT.sampleRate / 2 * 2)
  for await (const event of relay('demo-001', pcm)) console.log(JSON.stringify(event))
}

