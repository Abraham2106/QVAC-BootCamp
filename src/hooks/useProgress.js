import { useCallback, useEffect, useState } from 'react'

const KEY = (id) => 'bootcamp.progress.' + id
const LAST_KEY = 'bootcamp.lastVisited'

/** @returns {string|null} pathname + search + hash, or null if the visit should be ignored */
function normalizeVisitPath(path) {
  let target = path
  if (target == null) {
    if (typeof window === 'undefined') return null
    target = window.location.pathname + window.location.search + window.location.hash
  }
  if (/^https?:\/\//i.test(target)) {
    const url = new URL(target)
    if (typeof window !== 'undefined' && url.origin !== window.location.origin) return null
    target = url.pathname + url.search + url.hash
  }
  if (!target || target === '/' || target.endsWith('/')) return null
  return target
}

function currentLocationPath() {
  if (typeof window === 'undefined') return ''
  return window.location.pathname + window.location.search + window.location.hash
}

export function useProgress(classId, { itemCount } = {}) {
  const [state, setState] = useState(() => read(classId))
  const [feedback, setFeedback] = useState('')

  const toggle = useCallback(
    (item, on) => {
      setState((prev) => {
        const next = { ...prev, [item]: on }
        write(classId, next)
        if (itemCount) {
          const done = Object.values(next).filter((v) => v === true).length
          setFeedback(
            on
              ? `Guardado · ${done} de ${itemCount} completados`
              : `Desmarcado · ${done} de ${itemCount} completados`,
          )
        }
        return next
      })
    },
    [classId, itemCount],
  )

  const pct = useCallback(() => {
    const vals = Object.values(state).filter((v) => typeof v === 'boolean')
    if (!vals.length) return 0
    return Math.round((vals.filter(Boolean).length / vals.length) * 100)
  }, [state])

  return { state, toggle, pct: pct(), feedback }
}

export function useContinueLink(defaultHref, defaultLabel) {
  const [href, setHref] = useState(defaultHref)
  const [label, setLabel] = useState(defaultLabel)

  useEffect(() => {
    try {
      const last = localStorage.getItem(LAST_KEY)
      const target = normalizeVisitPath(last)
      if (target && target !== currentLocationPath()) {
        setHref(target)
        setLabel('Continuar donde quedaste →')
      }
    } catch {}
  }, [])

  return { href, label }
}

export function rememberVisit(path) {
  try {
    const target = normalizeVisitPath(path)
    if (!target) return
    localStorage.setItem(LAST_KEY, target)
  } catch {}
}

/*
 * Manual verification (UX fix #3 — hash-aware "Continuar donde quedaste"):
 * 1. Open /class/01, click a section anchor (e.g. #lab).
 * 2. Navigate home (/).
 * 3. Confirm the hero CTA reads "Continuar donde quedaste →" and links to /class/01#lab.
 * 4. localStorage bootcamp.lastVisited should be "/class/01#lab" (not pathname-only).
 */

/** Persiste pathname + search + hash de la ubicación actual. */
export function rememberCurrentVisit() {
  rememberVisit()
}

export function useRememberVisit() {
  useEffect(() => {
    rememberVisit()
    const onHash = () => rememberVisit()
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
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
