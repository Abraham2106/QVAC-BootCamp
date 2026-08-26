import { useCallback, useEffect, useState } from 'react'

const KEY = (id) => 'bootcamp.progress.' + id
const LAST_KEY = 'bootcamp.lastVisited'

export function useProgress(classId) {
  const [state, setState] = useState(() => read(classId))

  const toggle = useCallback(
    (item, on) => {
      setState((prev) => {
        const next = { ...prev, [item]: on }
        write(classId, next)
        return next
      })
    },
    [classId],
  )

  const pct = useCallback(() => {
    const vals = Object.values(state).filter((v) => typeof v === 'boolean')
    if (!vals.length) return 0
    return Math.round((vals.filter(Boolean).length / vals.length) * 100)
  }, [state])

  return { state, toggle, pct: pct() }
}

export function useContinueLink(defaultHref, defaultLabel) {
  const [href, setHref] = useState(defaultHref)
  const [label, setLabel] = useState(defaultLabel)

  useEffect(() => {
    try {
      const last = localStorage.getItem(LAST_KEY)
      // Ignora raíces de directorio: no son rutas de la SPA
      if (!last || last.endsWith('/')) return
      let target = last
      if (/^https?:\/\//i.test(last)) {
        const url = new URL(last)
        if (url.origin !== window.location.origin) return
        target = url.pathname + url.search + url.hash
      }
      if (target && target !== '/' && target !== window.location.pathname + window.location.search) {
        setHref(target)
        setLabel('Continuar donde quedaste →')
      }
    } catch {}
  }, [])

  return { href, label }
}

export function rememberVisit(path) {
  try {
    localStorage.setItem(LAST_KEY, path)
  } catch {}
}

function read(classId) {
  try {
    return JSON.parse(localStorage.getItem(KEY(classId))) || {}
  } catch {
    return {}
  }
}

function write(classId, data) {
  try {
    localStorage.setItem(KEY(classId), JSON.stringify(data))
  } catch {}
}

export function getProgressPct(classId) {
  const d = read(classId)
  const vals = Object.values(d).filter((v) => typeof v === 'boolean')
  if (!vals.length) return 0
  return Math.round((vals.filter(Boolean).length / vals.length) * 100)
}
