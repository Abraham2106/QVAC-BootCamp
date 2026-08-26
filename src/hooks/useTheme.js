import { useCallback, useEffect, useState } from 'react'
import { getResolvedTheme, initTheme, toggleTheme } from '../lib/theme'

export function useTheme() {
  const [theme, setTheme] = useState(getResolvedTheme)

  useEffect(() => {
    initTheme()
    setTheme(getResolvedTheme())

    const sync = () => setTheme(getResolvedTheme())
    window.addEventListener('bootcamp:theme', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('bootcamp:theme', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const toggle = useCallback(() => {
    setTheme(toggleTheme())
  }, [])

  return { theme, toggle, isDark: theme === 'dark' }
}
