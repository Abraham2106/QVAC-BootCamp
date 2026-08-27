type AudioFormat = { sampleRate: number; channels: number; sampleFormat: 's16le' }
const format: AudioFormat = { sampleRate: 16_000, channels: 1, sampleFormat: 's16le' }
const pcm = new Uint8Array(format.sampleRate * 2) // 1 s, 16-bit mono
console.log({ format, durationMs: pcm.byteLength / (format.sampleRate * format.channels * 2) * 1000 })

