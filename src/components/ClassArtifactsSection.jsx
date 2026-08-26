import { useEffect, useRef } from 'react'
import Reveal from './Reveal'

export default function ClassArtifactsSection({ children }) {
  const detailsRef = useRef(null)

  useEffect(() => {
    const openIfHash = () => {
      if (window.location.hash === '#artefactos' && detailsRef.current) {
        detailsRef.current.open = true
      }
    }
    openIfHash()
    window.addEventListener('hashchange', openIfHash)
    return () => window.removeEventListener('hashchange', openIfHash)
  }, [])

  return (
    <section className="section container" id="artefactos" aria-labelledby="artefactos-summary">
      <Reveal>
        <details ref={detailsRef} className="artifacts-disclosure">
          <summary className="artifacts-disclosure__summary" id="artefactos-summary">
            Artefactos avanzados (opcional)
          </summary>
          <div className="artifacts-disclosure__body">
            <h2 className="stitle" id="art-title">
              Artefactos de la clase
            </h2>
            {children}
          </div>
        </details>
      </Reveal>
    </section>
  )
}
