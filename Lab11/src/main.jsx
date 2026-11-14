import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './estilos/index.css'
import App from './App.jsx'
import Categorias from './paginas/Categorias.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {window.location.pathname.replace(/\/$/, '') === '/categorias' ? <Categorias /> : <App />}
  </StrictMode>,
)
