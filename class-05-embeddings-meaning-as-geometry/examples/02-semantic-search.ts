import { close, embed, GTE_LARGE_FP16, loadModel, unloadModel } from '@qvac/sdk'

const corpus = [
  'Electric cars store energy in batteries.',
  'A battery-powered automobile can be recharged from the grid.',
  'Gasoline engines burn fuel inside cylinders.',
  'Bread recipes usually contain flour and yeast.',
  'Solar panels convert sunlight into electrical energy.',
]

function cosineSimilarity(a: number[], b: number[]) {
  if (a.length !== b.length) throw new Error('Vector dimension mismatch')
  let dot = 0
  let aa = 0
  let bb = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    aa += a[i] * a[i]
    bb += b[i] * b[i]
  }
  const denom = Math.sqrt(aa) * Math.sqrt(bb)
  return denom === 0 ? 0 : dot / denom
}

const query = process.argv.slice(2).join(' ') || 'a car that runs on electricity'
let modelId: string | undefined

try {
  modelId = await loadModel({ modelSrc: GTE_LARGE_FP16, modelType: 'embeddings' })

  const corpusStart = performance.now()
  const { embedding: documentVectors } = await embed({ modelId, text: corpus })
  const corpusMs = performance.now() - corpusStart

  const queryStart = performance.now()
  const { embedding: queryVector } = await embed({ modelId, text: query })
  const queryMs = performance.now() - queryStart

  const rankStart = performance.now()
  const ranked = corpus
    .map((text, i) => ({ text, score: cosineSimilarity(queryVector, documentVectors[i]) }))
    .sort((a, b) => b.score - a.score)
  const rankMs = performance.now() - rankStart

  console.log(JSON.stringify({ query, corpusMs, queryMs, rankMs, topK: ranked.slice(0, 3) }, null, 2))
} finally {
  if (modelId) await unloadModel({ modelId })
  await close()
}
