import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

function veilColor(mode) {
  if (mode === 'ninja') return '#09090b'
  return document.documentElement.dataset.theme === 'light' ? '#ffffff' : '#0a0a0a'
}

/**
 * Crossfade breve al alternar docs ↔ ninja: un velo del color del modo
 * destino aparece tapando el flash de tokens y se desvanece.
 */
export default function UiModeCrossfade() {
  const reduceMotion = useReducedMotion()
  const [veil, setVeil] = useState(null)

  useEffect(() => {
    if (reduceMotion) return undefined
    const onMode = (event) => {
      const next = event.detail?.uiMode === 'ninja' ? 'ninja' : 'docs'
      setVeil({ id: Date.now(), mode: next })
    }
    document.addEventListener('bootcamp:uiMode', onMode)
    return () => document.removeEventListener('bootcamp:uiMode', onMode)
  }, [reduceMotion])

  return (
    <AnimatePresence>
      {veil && (
        <motion.div
          key={veil.id}
          className="ui-crossfade"
          style={{ background: veilColor(veil.mode) }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          onAnimationComplete={() => setVeil(null)}
        />
      )}
    </AnimatePresence>
  )
}
