import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { initTheme } from './lib/theme'
import { initUiMode } from './lib/uiMode'
import '@fontsource-variable/geist'
import './index.css'

initTheme()
initUiMode()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
