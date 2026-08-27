import { ragChunk } from '@qvac/sdk'

const document = `
Local-first systems keep their primary execution path on user-controlled devices.
They may still use optional network services, but essential local capabilities should not depend on a remote API.

Retrieval-augmented generation keeps documents outside model weights. The system chunks, embeds, stores and retrieves evidence at query time.

Chunk size changes the unit that retrieval can return. Very small chunks can lose surrounding meaning; very large chunks can include unrelated material.
`.trim()

const configs = [
  { label: 'small', chunkSize: 120, chunkOverlap: 20 },
  { label: 'large', chunkSize: 280, chunkOverlap: 40 },
]

for (const config of configs) {
  const chunks = await ragChunk({
    documents: [document],
    chunkOpts: {
      chunkSize: config.chunkSize,
      chunkOverlap: config.chunkOverlap,
      chunkStrategy: 'paragraph',
    },
  })

  console.log(`\n=== ${config.label} ===`)
  chunks.forEach((chunk, index) => {
    console.log(`#${index + 1} id=${chunk.id}`)
    console.log(chunk.content)
  })
}

console.log('\nDo not declare one config universally better. Use the retrieval task to evaluate it.')
