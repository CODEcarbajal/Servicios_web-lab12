import { useEffect, useState } from 'react'
import { eliminarCategoria, listarCategorias } from '../api/categorias.js'
import describirError from '../api/describirError.js'
import Button from '../componentes/Button/Button.jsx'
import './categorias.css'

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

export default function Categorias({ mensajeInicial = '' }) {
  const [pagina, setPagina] = useState(1)
  const [intento, setIntento] = useState(0)
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [operacion, setOperacion] = useState(null)
  const [errorOperacion, setErrorOperacion] = useState(null)
  const [mensaje, setMensaje] = useState(mensajeInicial)
  const [confirmacion, setConfirmacion] = useState(null)

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

  async function borrarCategoria(categoria) {
    if (operacion) return
    setOperacion(categoria.slug)
    setErrorOperacion(null)
    setMensaje('')
    try {
      await eliminarCategoria(categoria.slug)
      setConfirmacion(null)
      setMensaje(`Categoría «${categoria.name}» eliminada correctamente.`)
      solicitarPagina(datos.results.length === 1 && pagina > 1 ? pagina - 1 : pagina)
    } catch (fallo) {
      setErrorOperacion(fallo)
    } finally {
      setOperacion(null)
    }
  }

  return (
    <main className="contenedor categorias">
      <header className="categorias-cabecera">
        <a href="/">← Volver a la cartelera</a>
        <h1 id="titulo-categorias">Categorías</h1>
      </header>
      <Button href="/categorias/nueva">Nueva categoría</Button>
      <div className="categorias-mensajes" aria-live="polite" role="status">{mensaje}</div>
      {errorOperacion && <p className="categorias-error" role="alert">{describirError(errorOperacion)}</p>}
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
                    <tr><th scope="col">Nombre</th><th scope="col">Slug</th><th scope="col">Descripción</th><th scope="col">Acciones</th></tr>
                  </thead>
                  <tbody>
                    {datos.results.map(({ id, name, slug, description }) => (
                      <tr key={id}>
                        <th scope="row">{name}</th>
                        <td><code>{slug}</code></td>
                        <td>{description || '—'}</td>
                        <td>
                          {confirmacion === slug ? (
                            <div className="categorias-acciones">
                              <span>¿Eliminar «{name}»?</span>
                              <Button disabled={Boolean(operacion)} onClick={() => borrarCategoria({ name, slug })}>
                                {operacion === slug ? 'Eliminando…' : 'Confirmar eliminación'}
                              </Button>
                              <Button variant="secondary" disabled={Boolean(operacion)} onClick={() => setConfirmacion(null)}>Cancelar</Button>
                            </div>
                          ) : <Button variant="secondary" disabled={Boolean(operacion)} aria-label={`Eliminar ${name}`} onClick={() => setConfirmacion(slug)}>Eliminar</Button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {(datos.previous || datos.next) && (
                <nav className="categorias-paginacion" aria-label="Páginas de categorías">
                  <Button variant="secondary" disabled={!datos.previous || Boolean(operacion)} onClick={() => solicitarPagina(pagina - 1)}>Anterior</Button>
                  <span>Página {pagina}</span>
                  <Button variant="secondary" disabled={!datos.next || Boolean(operacion)} onClick={() => solicitarPagina(pagina + 1)}>Siguiente</Button>
                </nav>
              )}
            </>
          )
        )}
      </section>
    </main>
  )
}
