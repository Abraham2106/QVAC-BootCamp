import { getMermaidConfig, prepareMermaidNodes } from './mermaid-core.js'

let mermaidModule = null

async function getMermaid() {
  if (!mermaidModule) {
    const mod = await import('mermaid')
    mermaidModule = mod.default
  }
  return mermaidModule
}

export async function renderMermaid(root = document) {
  const nodes = prepareMermaidNodes(root)
  if (!nodes.length) return

  const mermaid = await getMermaid()
  mermaid.initialize(getMermaidConfig())
  await mermaid.run({ nodes: Array.from(nodes) })
}

export { getMermaidConfig, prepareMermaidNodes } from './mermaid-core.js'
