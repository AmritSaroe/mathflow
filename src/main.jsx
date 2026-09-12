import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { initTheme } from './theme/material'

// MathFlow uses a single light appearance; keep the palette initialization
// before the first render so CSS variables are available immediately.
initTheme()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
