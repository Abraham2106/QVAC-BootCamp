import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import LinkButton from './LinkButton'
import useUiMode from '@/hooks/useUiMode'
import { getResolvedTheme } from '@/lib/theme'
import '../styles/slides-embed.css'

/** Añade el modo UI (y tema) como query params para que el deck
    pinte el estilo nativo de la plataforma desde el primer frame. */
function withSlidesParams(src, ui, theme) {
  const sep = src.includes('?') ? '&' : '?'
  return `${src}${sep}ui=${ui}&theme=${theme}`
}

export default function SlidesEmbed({ src, title, hint, previewLabel }) {
  const previewId = useId()
  const deckId = useId()
  const wrapRef = useRef(null)
  const frameRef = useRef(null)
  const [expanded, setExpanded] = useState(false)
  const [slide, setSlide] = useState({ current: 0, total: hint || 0 })
  const [ready, setReady] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [activeSrc, setActiveSrc] = useState(null)
  const [theme, setTheme] = useState(getResolvedTheme)
  const { uiMode } = useUiMode()

  // Sincroniza el tema docs (claro/oscuro); ninja siempre es dark.
  useEffect(() => {
    const syncTheme = () => setTheme(getResolvedTheme())
    window.addEventListener('bootcamp:theme', syncTheme)
    window.addEventListener('storage', syncTheme)
    return () => {
      window.removeEventListener('bootcamp:theme', syncTheme)
      window.removeEventListener('storage', syncTheme)
    }
  }, [])

  useEffect(() => {
    const onMessage = (event) => {
      if (event.origin !== window.location.origin) return
      const data = event.data
      if (!data || data.type !== 'qvac-slides') return
      if (typeof data.current === 'number' && typeof data.total === 'number') {
        setSlide({ current: data.current, total: data.total })
        setReady(true)
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  useEffect(() => {
    if (!expanded) return
    setLoaded(false)
    setReady(false)
  }, [expanded, src])

  // Propaga cambios de modo al deck ya montado sin recargarlo.
  useEffect(() => {
    frameRef.current?.contentWindow?.postMessage(
      { type: 'qvac-ui', ui: uiMode, theme },
      window.location.origin,
    )
  }, [uiMode, theme, expanded])

  const post = useCallback((action) => {
    frameRef.current?.contentWindow?.postMessage(
      { type: 'qvac-slides', action },
      window.location.origin,
    )
  }, [])

  // El src del iframe se congela al expandir para no resetear el deck.
  const expand = useCallback(() => {
    setActiveSrc(withSlidesParams(src, uiMode, theme))
    setExpanded(true)
  }, [src, uiMode, theme])

  const goFullscreen = () => {
    const el = wrapRef.current
    if (!el) return
    if (document.fullscreenElement) document.exitFullscreen()
    else el.requestFullscreen?.()
  }

  const counter =
    slide.total > 0 ? `${slide.current} / ${slide.total}` : hint ? `— / ${hint}` : '— / —'

  const meta =
    hint && hint > 0 ? `${hint} diapositivas · 16:9` : 'Presentación interactiva · 16:9'

  return (
    <article className={`slides-card${expanded ? ' slides-card--expanded' : ''}`} aria-label={title}>
      <div className="slides-card__frame">
        {!expanded ? (
          <div className="slides-card__preview" id={previewId}>
            <div className="slides-card__preview-grid" aria-hidden="true" />
            <div className="slides-card__preview-body">
              <p className="slides-card__preview-kicker">Presentación</p>
              <p className="slides-card__preview-title">{previewLabel || title}</p>
              <p className="slides-card__preview-meta">{meta}</p>
              <Button
                className="slides-card__expand"
                type="button"
                aria-expanded="false"
                aria-controls={deckId}
                onClick={expand}
              >
                Expandir presentación
              </Button>
            </div>
          </div>
        ) : (
          <div className="embed-wrap slides-card__deck" id={deckId} ref={wrapRef}>
            <iframe
              ref={frameRef}
              src={activeSrc ?? withSlidesParams(src, uiMode, theme)}
              title={title}
              scrolling="no"
              onLoad={() => setLoaded(true)}
            />
            {!loaded && (
              <div className="embed-loading">
                <span>Cargando diapositivas…</span>
              </div>
            )}
          </div>
        )}
      </div>

      {expanded && (
        <div className="slides-card__toolbar embed-tools">
          <div className="embed-nav" role="group" aria-label="Navegación de diapositivas">
            <Button
              variant="outline"
              size="sm"
              className="embed-nav__btn"
              type="button"
              onClick={() => post('prev')}
              disabled={ready && slide.current <= 1}
              aria-label="Diapositiva anterior"
            >
              ← Anterior
            </Button>
            <span className="embed-nav__count" aria-live="polite">
              {counter}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="embed-nav__btn"
              type="button"
              onClick={() => post('next')}
              disabled={ready && slide.current >= slide.total}
              aria-label="Diapositiva siguiente"
            >
              Siguiente →
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            type="button"
            aria-expanded="true"
            aria-controls={previewId}
            onClick={() => setExpanded(false)}
          >
            Contraer
          </Button>
          <Button variant="outline" size="sm" type="button" onClick={goFullscreen}>
            ⛶ Pantalla completa
          </Button>
          <LinkButton href={activeSrc ?? withSlidesParams(src, uiMode, theme)} target="_blank" rel="noopener noreferrer">
            Abrir en pestaña nueva ↗
          </LinkButton>
        </div>
      )}
    </article>
  )
}
