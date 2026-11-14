import { useEffect, useState } from 'react'
import { listarCategorias } from '../api/categorias.js'

export default function Categorias() {
  const [pagina, setPagina] = useState(1)
  const [intento, setIntento] = useState(0)
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controlador = new AbortController()
    const { signal } = controlador

    setCargando(true)
    setError(null)

    listarCategorias({ pagina, signal })
      .then((resultado) => {
        if (!signal.aborted) setDatos(resultado)
      })
      .catch((fallo) => {
        if (!signal.aborted) setError(fallo)
      })
      .finally(() => {
        if (!signal.aborted) setCargando(false)
      })

    return () => controlador.abort()
  }, [pagina, intento])

  return (
    <main className="contenedor">
      <a href="/">Volver a la cartelera</a>
      <h1>Categorías</h1>
      {!cargando && !error && (
        <ul>
          {datos.results.map((categoria) => <li key={categoria.id}>{categoria.name}</li>)}
        </ul>
      )}
    </main>
  )
}
