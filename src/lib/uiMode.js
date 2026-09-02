import { applyTheme, getResolvedTheme } from './theme'

export const UI_MODE_KEY = 'bootcamp.uiMode'
export const THEME_BEFORE_NINJA_KEY = 'bootcamp.themeBeforeNinja'

/** Ninja is a supported visual mode in both development and production. */
export function isNinjaEnabled() {
  return true
}

/** @deprecated Prefer isNinjaEnabled() */
export const NINJA_MODE_ENABLED = isNinjaEnabled()

function sanitizeProdUiMode() {
  if (isNinjaEnabled()) return

  document.documentElement.dataset.ui = 'docs'
  document.documentElement.classList.remove('ninja')

  try {
    if (localStorage.getItem(UI_MODE_KEY) === 'ninja') {
      localStorage.setItem(UI_MODE_KEY, 'docs')
    }
    const prev = localStorage.getItem(THEME_BEFORE_NINJA_KEY)
    if (prev === 'light' || prev === 'dark') applyTheme(prev, false)
    localStorage.removeItem(THEME_BEFORE_NINJA_KEY)
  } catch {}
}

export function getStoredUiMode() {
  try {
    const m = localStorage.getItem(UI_MODE_KEY)
    if (m === 'docs') return m
    if (m === 'ninja' && isNinjaEnabled()) return m
  } catch {}
  return null
}

export function getResolvedUiMode() {
  if (!isNinjaEnabled()) return 'docs'
  return getStoredUiMode() ?? 'docs'
}

export function isNinjaMode() {
  return isNinjaEnabled() && getResolvedUiMode() === 'ninja'
}

export function applyUiMode(mode, persist = true) {
  const next = mode === 'ninja' && isNinjaEnabled() ? 'ninja' : 'docs'
  document.documentElement.dataset.ui = next
  document.documentElement.classList.toggle('ninja', next === 'ninja')

  if (next === 'ninja') {
    try {
      if (!localStorage.getItem(THEME_BEFORE_NINJA_KEY)) {
        localStorage.setItem(THEME_BEFORE_NINJA_KEY, getResolvedTheme())
      }
    } catch {}
    applyTheme('dark', false)
  } else {
    try {
      const prev = localStorage.getItem(THEME_BEFORE_NINJA_KEY)
      if (prev === 'light' || prev === 'dark') {
        applyTheme(prev, false)
      } else {
        applyTheme(getResolvedTheme(), false)
      }
      localStorage.removeItem(THEME_BEFORE_NINJA_KEY)
    } catch {}
  }

  if (persist) {
    try {
      localStorage.setItem(UI_MODE_KEY, next)
    } catch {}
  }

  document.dispatchEvent(new CustomEvent('bootcamp:uiMode', { detail: { uiMode: next }, bubbles: true }))
  return next
}

export function initUiMode() {
  if (!isNinjaEnabled()) {
    sanitizeProdUiMode()
    applyUiMode('docs', true)
    return
  }

  const stored = getStoredUiMode() ?? 'docs'
  applyUiMode(stored, false)
}

export function toggleUiMode() {
  if (!isNinjaEnabled()) return applyUiMode('docs')

  const next = getResolvedUiMode() === 'ninja' ? 'docs' : 'ninja'
  applyUiMode(next)
  return next
}
