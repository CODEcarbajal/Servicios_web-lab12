import axios from 'axios'

const cliente = axios.create({
  baseURL: import.meta.env?.VITE_API_URL || 'http://localhost:8000/api/',
  timeout: 10000,
})

export async function listarCategorias({ pagina = 1, signal } = {}) {
  const { data } = await cliente.get('categories/', { params: { page: pagina }, signal })
  return data
}

export async function crearCategoria(categoria) {
  const { data } = await cliente.post('categories/', categoria)
  return data
}

export async function eliminarCategoria(slug) {
  await cliente.delete(`categories/${encodeURIComponent(slug)}/`)
}
