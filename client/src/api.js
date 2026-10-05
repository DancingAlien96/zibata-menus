const CLAVE_SESION = 'zibata-admin'

export const sesion = {
  obtener() {
    try {
      return JSON.parse(localStorage.getItem(CLAVE_SESION))
    } catch {
      return null
    }
  },
  guardar(datos) {
    localStorage.setItem(CLAVE_SESION, JSON.stringify(datos))
  },
  cerrar() {
    localStorage.removeItem(CLAVE_SESION)
  },
}

export class ErrorApi extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

// "body" se envía como JSON; "archivo" (Blob) se envía tal cual, con su tipo de contenido.
export async function api(ruta, { method = 'GET', body, archivo } = {}) {
  const headers = {}
  const token = sesion.obtener()?.token
  if (token) headers.Authorization = `Bearer ${token}`
  let cuerpo
  if (archivo) {
    headers['Content-Type'] = archivo.type || 'application/octet-stream'
    cuerpo = archivo
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    cuerpo = JSON.stringify(body)
  }

  let res
  try {
    res = await fetch(`/api${ruta}`, { method, headers, body: cuerpo })
  } catch {
    throw new ErrorApi(0, 'No se pudo conectar con el servidor')
  }

  if (res.status === 204) return null
  const datos = await res.json().catch(() => ({}))
  if (!res.ok) {
    // Sin cuerpo JSON = el proxy de Vite no encontró la API (servidor apagado)
    const mensaje = datos.error
      ?? (res.status === 413 ? 'La foto es demasiado grande'
        : res.status >= 500 ? 'El servidor no responde, intenta de nuevo en un momento'
          : 'Ocurrió un error')
    throw new ErrorApi(res.status, mensaje)
  }
  return datos
}

// Achica la foto en el navegador antes de subirla (más rápido con datos móviles).
// El servidor después la convierte a WebP; si el navegador no puede leerla, se envía la original.
export async function prepararFoto(archivo, ladoMaximo = 1600) {
  try {
    const bitmap = await createImageBitmap(archivo, { imageOrientation: 'from-image' })
    const escala = Math.min(1, ladoMaximo / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * escala)
    canvas.height = Math.round(bitmap.height * escala)
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    const blob = await new Promise((ok) => canvas.toBlob(ok, 'image/jpeg', 0.88))
    return blob && blob.size < archivo.size ? blob : archivo
  } catch {
    return archivo
  }
}

const formato = new Intl.NumberFormat('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
export const quetzales = (n) => `Q${formato.format(n)}`
