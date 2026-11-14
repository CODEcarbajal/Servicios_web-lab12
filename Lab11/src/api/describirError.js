export default function describirError(error) {
  if (error.code === 'ECONNABORTED') return 'La API tardó demasiado en responder.'
  if (!error.response) return 'No se pudo conectar con la API de Django.'
  if (error.response.status === 400) {
    return Object.entries(error.response.data).map(([campo, mensajes]) =>
      `${campo}: ${Array.isArray(mensajes) ? mensajes.join(' ') : mensajes}`,
    ).join(' ')
  }
  return `La API devolvió un error HTTP ${error.response.status}.`
}

