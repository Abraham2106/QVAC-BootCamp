import mermaid from 'mermaid'
import { getMermaidConfig, prepareMermaidNodes } from './lib/mermaid-core.js'

async function renderWithBundledMermaid(root = document) {
  const nodes = prepareMermaidNodes(root)
  if (!nodes.length) return
  mermaid.initialize(getMermaidConfig())
  await mermaid.run({ nodes: Array.from(nodes) })
}

function initStaticMermaid() {
  const run = () => {
    renderWithBundledMermaid(document).catch((err) => console.error('[mermaid]', err))
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run)
  } else {
    run()
  }

  document.addEventListener('bootcamp:theme', run)
}

initStaticMermaid()

window.BootcampMermaid = { render: renderWithBundledMermaid }
