import { useEffect, useState } from 'react'
import App from './App.jsx'
import Categorias from './paginas/Categorias.jsx'
import NuevaCategoria from './paginas/NuevaCategoria.jsx'

export default function Paginas() {
  const [ruta, setRuta] = useState(window.location.pathname.replace(/\/$/, ''))
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    const volver = () => {
      setRuta(window.location.pathname.replace(/\/$/, ''))
      setMensaje('')
    }
    window.addEventListener('popstate', volver)
    return () => window.removeEventListener('popstate', volver)
  }, [])

  function categoriaCreada(categoria) {
    window.history.pushState({}, '', '/categorias')
    setMensaje(`Categoría «${categoria.name}» creada correctamente.`)
    setRuta('/categorias')
  }

  if (ruta === '/categorias/nueva') return <NuevaCategoria onCreada={categoriaCreada} />
  if (ruta === '/categorias') return <Categorias mensajeInicial={mensaje} />
  return <App />
}

