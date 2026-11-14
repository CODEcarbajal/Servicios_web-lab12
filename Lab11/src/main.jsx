import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './estilos/index.css'
import Paginas from './Paginas.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Paginas />
  </StrictMode>,
)
