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

export async function api(ruta, { method = 'GET', body } = {}) {
  const headers = {}
  const token = sesion.obtener()?.token
  if (token) headers.Authorization = `Bearer ${token}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  let res
  try {
    res = await fetch(`/api${ruta}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) })
  } catch {
    throw new ErrorApi(0, 'No se pudo conectar con el servidor')
  }

  if (res.status === 204) return null
  const datos = await res.json().catch(() => ({}))
  if (!res.ok) {
    // Sin cuerpo JSON = el proxy de Vite no encontró la API (servidor apagado)
    const mensaje = datos.error ?? (res.status >= 500 ? 'El servidor no responde, intenta de nuevo en un momento' : 'Ocurrió un error')
    throw new ErrorApi(res.status, mensaje)
  }
  return datos
}

const formato = new Intl.NumberFormat('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
export const quetzales = (n) => `Q${formato.format(n)}`
