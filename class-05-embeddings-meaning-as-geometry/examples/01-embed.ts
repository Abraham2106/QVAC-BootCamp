import { close, embed, GTE_LARGE_FP16, loadModel, unloadModel } from '@qvac/sdk'

let modelId: string | undefined

try {
  modelId = await loadModel({
    modelSrc: GTE_LARGE_FP16,
    modelType: 'embeddings',
  })

  const started = performance.now()
  const result = await embed({
    modelId,
    text: [
      'Electric cars store energy in batteries.',
      'A battery-powered automobile can be recharged from the grid.',
      'Bread recipes usually contain flour and yeast.',
    ],
  })
  const elapsedMs = performance.now() - started

  console.log('vectors:', result.embedding.length)
  console.log('dimensions:', result.embedding[0]?.length)
  console.log('elapsedMs:', elapsedMs.toFixed(1))
  console.log('stats:', result.stats ?? 'not reported')
} finally {
  if (modelId) await unloadModel({ modelId })
  await close()
}
