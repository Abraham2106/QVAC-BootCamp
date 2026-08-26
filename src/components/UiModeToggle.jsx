import useUiMode from '../hooks/useUiMode'
import { isNinjaEnabled } from '../lib/uiMode'

export default function UiModeToggle() {
  const { uiMode, toggle } = useUiMode()

  if (!isNinjaEnabled()) return null

  return (
    <div className="ui-mode-toggle" role="group" aria-label="Modo de interfaz">
      <button
        type="button"
        className={`ui-mode-toggle__btn${uiMode === 'docs' ? ' is-active' : ''}`}
        aria-pressed={uiMode === 'docs'}
        onClick={() => uiMode !== 'docs' && toggle()}
      >
        Docs
      </button>
      <button
        type="button"
        className={`ui-mode-toggle__btn${uiMode === 'ninja' ? ' is-active' : ''}`}
        aria-pressed={uiMode === 'ninja'}
        title="Modo visual en pruebas — no disponible en producción"
        onClick={() => uiMode !== 'ninja' && toggle()}
      >
        Ninja
        <span className="ui-mode-toggle__pill" aria-hidden="true">
          prueba
        </span>
      </button>
    </div>
  )
}
