export const THEME_KEY = 'bootcamp.theme'

export function getStoredTheme() {
  try {
    const t = localStorage.getItem(THEME_KEY)
    if (t === 'light' || t === 'dark') return t
  } catch {}
  return null
}

export function getResolvedTheme() {
  const stored = getStoredTheme()
  if (stored) return stored
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

export function applyTheme(theme, persist = true) {
  document.documentElement.dataset.theme = theme
  document.documentElement.classList.toggle('dark', theme === 'dark')
  // Docs light mode must never inherit ninja/dark color-scheme
  if (theme === 'light' && document.documentElement.dataset.ui !== 'ninja') {
    document.documentElement.style.colorScheme = 'light'
  } else if (theme === 'dark') {
    document.documentElement.style.colorScheme = 'dark'
  } else {
    document.documentElement.style.removeProperty('color-scheme')
  }
  if (persist) {
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {}
  }
  document.dispatchEvent(new CustomEvent('bootcamp:theme', { detail: { theme } }))
}

/** Apply stored preference only (before paint). System default when unset. */
export function initTheme() {
  const stored = getStoredTheme()
  if (stored) {
    applyTheme(stored, false)
    return
  }
  const dark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
  document.documentElement.classList.toggle('dark', dark)
  document.documentElement.style.removeProperty('color-scheme')
  document.documentElement.removeAttribute('data-theme')
}

export function toggleTheme() {
  const next = getResolvedTheme() === 'dark' ? 'light' : 'dark'
  applyTheme(next)
  return next
}
