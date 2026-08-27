import {
  close,
  completion,
  GTE_LARGE_FP16,
  loadModel,
  QWEN3_600M_INST_Q4,
  ragCloseWorkspace,
  ragIngest,
  ragSearch,
  unloadModel,
} from '@qvac/sdk'

const workspace = 'class06-grounded-demo'
const notes = [
  { source: 'qvac-http.md', text: 'The QVAC OpenAI-compatible HTTP server defaults to http://localhost:11434/v1/.' },
  { source: 'delegation.md', text: 'Delegated inference connects directly to a known providerPublicKey over the Hyperswarm DHT.' },
  { source: 'models.md', text: 'QVAC supports llama.cpp-compatible GGUF models for local text generation.' },
]

const query = process.argv.slice(2).join(' ') || 'What local base URL should an OpenAI-compatible client use?'
let embeddingModelId: string | undefined
let llmModelId: string | undefined

try {
  embeddingModelId = await loadModel({ modelSrc: GTE_LARGE_FP16, modelType: 'embeddings' })
  llmModelId = await loadModel({ modelSrc: QWEN3_600M_INST_Q4, modelConfig: { ctx_size: 4096 } })

  await ragIngest({
    modelId: embeddingModelId,
    workspace,
    documents: notes.map((n) => n.text),
    chunk: false,
  })

  const retrievalStarted = performance.now()
  const hits = await ragSearch({ modelId: embeddingModelId, workspace, query, topK: 3 })
  const retrievalMs = performance.now() - retrievalStarted

  console.log('\nRETRIEVED EVIDENCE')
  hits.forEach((hit, i) => {
    const note = notes.find((n) => n.text === hit.content)
    console.log(`[${i + 1}] score=${hit.score} source=${note?.source ?? 'unknown'}`)
    console.log(hit.content)
  })

  const evidence = hits.map((hit, i) => `[${i + 1}] ${hit.content}`).join('\n')
  const prompt = `You answer only from EVIDENCE. If the evidence is insufficient, say "Insufficient evidence".\n\nEVIDENCE:\n${evidence}\n\nQUESTION:\n${query}`

  const generationStarted = performance.now()
  const run = completion({ modelId: llmModelId, history: [{ role: 'user', content: prompt }], stream: true })
  for await (const event of run.events) {
    if (event.type === 'contentDelta') process.stdout.write(event.delta)
  }
  const final = await run.final
  const generationMs = performance.now() - generationStarted

  console.log('\n\nMETRICS')
  console.log({ retrievalMs, generationMs, stopReason: final.stopReason, stats: final.stats })
} finally {
  await ragCloseWorkspace({ workspace, deleteOnClose: true }).catch(() => {})
  if (llmModelId) await unloadModel({ modelId: llmModelId })
  if (embeddingModelId) await unloadModel({ modelId: embeddingModelId })
  await close()
}
