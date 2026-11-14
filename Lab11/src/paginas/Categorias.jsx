import { useEffect, useState } from 'react'
import { listarCategorias } from '../api/categorias.js'
import Button from '../componentes/Button/Button.jsx'
import './categorias.css'

function describirError(error) {
  if (error.code === 'ECONNABORTED') return 'La API tardó demasiado en responder.'
  if (!error.response) return 'No se pudo conectar con la API de Django.'
  return `La API devolvió un error HTTP ${error.response.status}.`
}

function EsqueletoCategorias() {
  return (
    <div className="categorias-carga" role="status">
      <p>Cargando categorías…</p>
      <div aria-hidden="true">
        {[1, 2, 3].map((fila) => (
          <div className="categorias-fila-carga" key={fila}><span /><span /><span /></div>
        ))}
      </div>
    </div>
  )
}

export default function Categorias() {
  const [pagina, setPagina] = useState(1)
  const [intento, setIntento] = useState(0)
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controlador = new AbortController()
    const { signal } = controlador

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

  function solicitarPagina(nuevaPagina) {
    setCargando(true)
    setError(null)
    setPagina(nuevaPagina)
    setIntento((actual) => actual + 1)
  }

  return (
    <main className="contenedor categorias">
      <header className="categorias-cabecera">
        <a href="/">← Volver a la cartelera</a>
        <h1 id="titulo-categorias">Categorías</h1>
      </header>
      <section className="categorias-panel" aria-labelledby="titulo-categorias">
        {cargando && <EsqueletoCategorias />}
        {!cargando && error && (
          <div className="categorias-error">
            <div role="alert">
              <h2>No se pudieron cargar las categorías</h2>
              <p>{describirError(error)}</p>
            </div>
            <Button onClick={() => solicitarPagina(pagina)}>Reintentar</Button>
          </div>
        )}
        {!cargando && !error && datos && (
          datos.results.length === 0 ? <p className="categorias-vacio">Aún no hay categorías registradas.</p> : (
            <>
              <div className="categorias-tabla">
                <table aria-labelledby="titulo-categorias">
                  <thead>
                    <tr><th scope="col">Nombre</th><th scope="col">Slug</th><th scope="col">Descripción</th></tr>
                  </thead>
                  <tbody>
                    {datos.results.map(({ id, name, slug, description }) => (
                      <tr key={id}>
                        <th scope="row">{name}</th>
                        <td><code>{slug}</code></td>
                        <td>{description || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {(datos.previous || datos.next) && (
                <nav className="categorias-paginacion" aria-label="Páginas de categorías">
                  <Button variant="secondary" disabled={!datos.previous} onClick={() => solicitarPagina(pagina - 1)}>Anterior</Button>
                  <span>Página {pagina}</span>
                  <Button variant="secondary" disabled={!datos.next} onClick={() => solicitarPagina(pagina + 1)}>Siguiente</Button>
                </nav>
              )}
            </>
          )
        )}
      </section>
    </main>
  )
}
