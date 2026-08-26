import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { renderMermaid } from '../lib/mermaid'

/** Render any `.mermaid` blocks after navigation or theme change. */
export default function useMermaid() {
  const { pathname } = useLocation()

  useEffect(() => {
    const run = () => renderMermaid(document).catch((err) => console.error('[mermaid]', err))
    run()
    document.addEventListener('bootcamp:theme', run)
    return () => document.removeEventListener('bootcamp:theme', run)
  }, [pathname])
}
