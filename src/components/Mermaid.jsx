import { useEffect, useRef } from 'react'
import { renderMermaid } from '../lib/mermaid'

/**
 * Inline Mermaid diagram for React pages.
 * Usage:
 *   <Mermaid chart={`flowchart LR\n  A --> B`} />
 */
export default function Mermaid({ chart, children }) {
  const wrapRef = useRef(null)
  const source = (chart || children || '').trim()

  useEffect(() => {
    if (!wrapRef.current || !source) return
    const pre = wrapRef.current.querySelector('pre.mermaid')
    if (!pre) return
    pre.textContent = source
    delete pre.dataset.mermaidSource
    renderMermaid(wrapRef.current).catch((err) => console.error('[mermaid]', err))
  }, [source])

  return (
    <div className="mermaid-wrap" ref={wrapRef}>
      <pre className="mermaid" aria-label="Diagrama">
        {source}
      </pre>
    </div>
  )
}
