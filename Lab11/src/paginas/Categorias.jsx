import { useEffect, useState } from 'react'
import { crearCategoria, eliminarCategoria, listarCategorias } from '../api/categorias.js'
import Button from '../componentes/Button/Button.jsx'
import './categorias.css'

function describirError(error) {
  if (error.code === 'ECONNABORTED') return 'La API tardó demasiado en responder.'
  if (!error.response) return 'No se pudo conectar con la API de Django.'
  if (error.response.status === 400) {
    return Object.entries(error.response.data).map(([campo, mensajes]) =>
      `${campo}: ${Array.isArray(mensajes) ? mensajes.join(' ') : mensajes}`,
    ).join(' ')
  }
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
  const [formulario, setFormulario] = useState({ name: '', slug: '', description: '' })
  const [operacion, setOperacion] = useState(null)
  const [errorOperacion, setErrorOperacion] = useState(null)
  const [mensaje, setMensaje] = useState('')
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

  function cambiarCampo(evento) {
    const { name, value } = evento.target
    setFormulario((actual) => ({ ...actual, [name]: value }))
  }

  async function guardarCategoria(evento) {
    evento.preventDefault()
    if (operacion) return
    setOperacion('crear')
    setErrorOperacion(null)
    setMensaje('')
    try {
      const categoria = await crearCategoria({
        name: formulario.name.trim(),
        slug: formulario.slug.trim(),
        description: formulario.description.trim(),
      })
      setFormulario({ name: '', slug: '', description: '' })
      setMensaje(`Categoría «${categoria.name}» creada correctamente.`)
      solicitarPagina(1)
    } catch (fallo) {
      setErrorOperacion(fallo)
    } finally {
      setOperacion(null)
    }
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
      <section className="categorias-formulario" aria-labelledby="titulo-nueva-categoria">
        <h2 id="titulo-nueva-categoria">Nueva categoría</h2>
        <form onSubmit={guardarCategoria}>
          <fieldset disabled={Boolean(operacion)}>
            <legend>Datos de la categoría</legend>
            <label htmlFor="categoria-nombre">Nombre</label>
            <input id="categoria-nombre" name="name" value={formulario.name} onChange={cambiarCampo} required maxLength={100} pattern={'.*\\S.*'} />
            <label htmlFor="categoria-slug">Slug</label>
            <input id="categoria-slug" name="slug" value={formulario.slug} onChange={cambiarCampo} required maxLength={50} pattern={'[a-zA-Z0-9_\\-]+'} aria-describedby="ayuda-slug" />
            <small id="ayuda-slug">Identificador único: letras sin tildes, números, guiones o guiones bajos.</small>
            <label htmlFor="categoria-descripcion">Descripción (opcional)</label>
            <textarea id="categoria-descripcion" name="description" value={formulario.description} onChange={cambiarCampo} rows={3} />
            <Button type="submit">{operacion === 'crear' ? 'Guardando…' : 'Crear categoría'}</Button>
          </fieldset>
        </form>
      </section>
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
