import { useCallback, useEffect, useState } from 'react'
import { getResolvedUiMode, initUiMode, isNinjaEnabled, toggleUiMode } from '../lib/uiMode'

export default function useUiMode() {
  const [uiMode, setUiMode] = useState(getResolvedUiMode)

  useEffect(() => {
    initUiMode()
    setUiMode(getResolvedUiMode())

    const sync = () => setUiMode(getResolvedUiMode())
    window.addEventListener('bootcamp:uiMode', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('bootcamp:uiMode', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const toggle = useCallback(() => {
    setUiMode(toggleUiMode())
  }, [])

  return {
    uiMode,
    isNinja: isNinjaEnabled() && uiMode === 'ninja',
    isDocs: uiMode === 'docs' || !isNinjaEnabled(),
    toggle,
  }
}
