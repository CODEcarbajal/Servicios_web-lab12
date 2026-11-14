import { useState } from 'react'
import { crearCategoria } from '../api/categorias.js'
import describirError from '../api/describirError.js'
import Button from '../componentes/Button/Button.jsx'
import './categorias.css'

export default function NuevaCategoria({ onCreada }) {
  const [formulario, setFormulario] = useState({ name: '', slug: '', description: '' })
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  function cambiarCampo(evento) {
    const { name, value } = evento.target
    setFormulario((actual) => ({ ...actual, [name]: value }))
  }

  async function guardar(evento) {
    evento.preventDefault()
    if (guardando) return
    setGuardando(true)
    setError(null)
    try {
      const categoria = await crearCategoria({
        name: formulario.name.trim(),
        slug: formulario.slug.trim(),
        description: formulario.description.trim(),
      })
      onCreada(categoria)
    } catch (fallo) {
      setError(fallo)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <main className="contenedor categorias">
      <header className="categorias-cabecera">
        <a href="/categorias">← Volver al listado</a>
        <h1>Nueva categoría</h1>
      </header>
      <section className="categorias-formulario" aria-label="Alta de categoría">
        <form onSubmit={guardar} noValidate>
          <fieldset disabled={guardando}>
            <legend>Datos de la categoría</legend>
            <label htmlFor="categoria-nombre">Nombre (obligatorio)</label>
            <input id="categoria-nombre" name="name" value={formulario.name} onChange={cambiarCampo} required maxLength={100} />
            <label htmlFor="categoria-slug">Slug (obligatorio)</label>
            <input id="categoria-slug" name="slug" value={formulario.slug} onChange={cambiarCampo} required maxLength={50} aria-describedby="ayuda-slug" />
            <small id="ayuda-slug">Identificador único: letras sin tildes, números, guiones o guiones bajos.</small>
            <label htmlFor="categoria-descripcion">Descripción (opcional)</label>
            <textarea id="categoria-descripcion" name="description" value={formulario.description} onChange={cambiarCampo} rows={3} />
            <Button type="submit">{guardando ? 'Guardando…' : 'Crear categoría'}</Button>
          </fieldset>
        </form>
        {error && <p className="categorias-error" role="alert">{describirError(error)}</p>}
      </section>
    </main>
  )
}
