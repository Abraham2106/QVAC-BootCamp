import {
  GTE_LARGE_FP16,
  loadModel,
  ragCloseWorkspace,
  ragIngest,
  ragSearch,
  unloadModel,
} from '@qvac/sdk'

const workspace = 'class06-managed-demo'
const documents = [
  'The QVAC OpenAI-compatible server uses http://localhost:11434/v1/ by default.',
  'GGUF is the model format used by llama.cpp-compatible local inference workflows.',
  'A basic bread recipe can use flour, water, yeast, and salt.',
  'Delegated inference connects to a known providerPublicKey over the Hyperswarm DHT.',
]

const query = process.argv.slice(2).join(' ') || 'Where should an OpenAI-compatible client connect locally?'
let modelId: string | undefined

try {
  modelId = await loadModel({ modelSrc: GTE_LARGE_FP16, modelType: 'embeddings' })

  const ingestStart = performance.now()
  const ingest = await ragIngest({ modelId, workspace, documents, chunk: false })
  const ingestMs = performance.now() - ingestStart

  const retrievalStart = performance.now()
  const hits = await ragSearch({ modelId, workspace, query, topK: 3 })
  const retrievalMs = performance.now() - retrievalStart

  console.log('processed:', ingest.processed.length)
  console.log('retrievalMs:', retrievalMs.toFixed(1))
  hits.forEach((hit, index) => {
    console.log(`\n#${index + 1} score=${hit.score}`)
    console.log(hit.content)
  })
  console.log('\ningestMs:', ingestMs.toFixed(1))
} finally {
  await ragCloseWorkspace({ workspace, deleteOnClose: true }).catch(() => {})
  if (modelId) await unloadModel({ modelId })
}
