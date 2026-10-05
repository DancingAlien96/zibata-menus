import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import express from 'express'
import bcrypt from 'bcryptjs'
import { todos, uno, ejecutar, aPlatillo, RUTA_FOTOS } from './db.js'
import { firmarToken, requiereAdmin } from './auth.js'
import { obtenerMenu } from './menu.js'
import { guardarFoto, borrarFoto } from './fotos.js'

const app = express()
app.use(express.json())

// Cada foto tiene un nombre único, así que el navegador puede guardarla en caché para siempre.
app.use('/fotos', express.static(RUTA_FOTOS, { maxAge: '365d', immutable: true }))
app.use('/fotos', (_req, res) => res.status(404).json({ error: 'Foto no encontrada' }))

// Permite usar funciones async en las rutas y mandar los errores al manejador central.
const ruta = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

class ErrorHttp extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

/* ---------- Público ---------- */

app.get('/api/menus', (_req, res) => {
  res.json(todos('SELECT id, slug, nombre FROM menus ORDER BY orden, id'))
})

app.get('/api/menus/:slug', (req, res) => {
  const menu = obtenerMenu(req.params.slug)
  if (!menu) throw new ErrorHttp(404, 'Menú no encontrado')
  res.json(menu)
})

app.post('/api/auth/login', ruta(async (req, res) => {
  const { usuario, password } = req.body ?? {}
  const admin = uno('SELECT id, usuario, password_hash FROM admins WHERE usuario = ?', String(usuario ?? ''))
  if (!admin || !(await bcrypt.compare(String(password ?? ''), admin.password_hash))) {
    throw new ErrorHttp(401, 'Usuario o contraseña incorrectos')
  }
  res.json({ token: firmarToken(admin), usuario: admin.usuario })
}))

/* ---------- Administración ---------- */

const admin = express.Router()
admin.use(requiereAdmin)

const texto = (v, campo, { requerido = false } = {}) => {
  if (v === undefined) return undefined
  const s = v === null ? '' : String(v).trim()
  if (requerido && !s) throw new ErrorHttp(400, `El campo "${campo}" es obligatorio`)
  return s || null
}

const precio = (v, campo, { requerido = false } = {}) => {
  if (v === undefined) return undefined
  if (v === null || v === '') {
    if (requerido) throw new ErrorHttp(400, `El campo "${campo}" es obligatorio`)
    return null
  }
  const n = Number(v)
  if (!Number.isFinite(n) || n < 0) throw new ErrorHttp(400, `"${campo}" debe ser un número mayor o igual a 0`)
  return Math.round(n * 100) / 100
}

const id = (v) => {
  const n = Number(v)
  if (!Number.isInteger(n) || n <= 0) throw new ErrorHttp(400, 'Identificador inválido')
  return n
}

// Construye "SET a = ?, b = ?" solo con los campos que vienen definidos.
function actualizar(tabla, registroId, campos, extra = '') {
  const pares = Object.entries(campos).filter(([, v]) => v !== undefined)
  if (!pares.length) throw new ErrorHttp(400, 'No hay cambios que guardar')
  const set = pares.map(([k]) => `${k} = ?`).join(', ')
  const fila = uno(
    `UPDATE ${tabla} SET ${set}${extra} WHERE id = ? RETURNING *`,
    ...pares.map(([, v]) => v), id(registroId),
  )
  if (!fila) throw new ErrorHttp(404, 'Registro no encontrado')
  return fila
}

admin.get('/menus/:slug', (req, res) => {
  const menu = obtenerMenu(req.params.slug, { soloDisponibles: false })
  if (!menu) throw new ErrorHttp(404, 'Menú no encontrado')
  res.json(menu)
})

admin.post('/platillos', (req, res) => {
  const b = req.body ?? {}
  const categoriaId = id(b.categoria_id)
  const platillo = uno(
    `INSERT INTO platillos (categoria_id, nombre, descripcion, precio, precio_doble, disponible, orden)
     VALUES (?, ?, ?, ?, ?, ?,
             (SELECT COALESCE(MAX(orden) + 1, 0) FROM platillos WHERE categoria_id = ?))
     RETURNING *`,
    categoriaId,
    texto(b.nombre, 'nombre', { requerido: true }),
    texto(b.descripcion, 'descripción') ?? null,
    precio(b.precio, 'precio', { requerido: true }),
    precio(b.precio_doble, 'precio 2x') ?? null,
    b.disponible === false ? 0 : 1,
    categoriaId,
  )
  res.status(201).json(aPlatillo(platillo))
})

admin.patch('/platillos/:id', (req, res) => {
  const b = req.body ?? {}
  const platillo = actualizar('platillos', req.params.id, {
    nombre: texto(b.nombre, 'nombre', { requerido: true }),
    descripcion: texto(b.descripcion, 'descripción'),
    precio: precio(b.precio, 'precio', { requerido: true }),
    precio_doble: precio(b.precio_doble, 'precio 2x'),
    disponible: b.disponible === undefined ? undefined : b.disponible ? 1 : 0,
    categoria_id: b.categoria_id === undefined ? undefined : id(b.categoria_id),
  }, ", actualizado = datetime('now')")
  res.json(aPlatillo(platillo))
})

admin.delete('/platillos/:id', ruta(async (req, res) => {
  const fila = uno('DELETE FROM platillos WHERE id = ? RETURNING foto', id(req.params.id))
  if (!fila) throw new ErrorHttp(404, 'Platillo no encontrado')
  await borrarFoto(fila.foto)
  res.status(204).end()
}))

// La foto llega como el cuerpo crudo de la petición (Content-Type: image/...).
admin.put('/platillos/:id/foto', express.raw({ type: 'image/*', limit: '15mb' }), ruta(async (req, res) => {
  const platilloId = id(req.params.id)
  const anterior = uno('SELECT foto FROM platillos WHERE id = ?', platilloId)
  if (!anterior) throw new ErrorHttp(404, 'Platillo no encontrado')
  if (!Buffer.isBuffer(req.body) || !req.body.length) throw new ErrorHttp(400, 'No se recibió ninguna imagen')

  let nombre
  try {
    nombre = await guardarFoto(req.body, platilloId)
  } catch {
    throw new ErrorHttp(400, 'El archivo no es una imagen válida')
  }
  const platillo = uno(
    "UPDATE platillos SET foto = ?, actualizado = datetime('now') WHERE id = ? RETURNING *",
    nombre, platilloId,
  )
  await borrarFoto(anterior.foto)
  res.json(aPlatillo(platillo))
}))

admin.delete('/platillos/:id/foto', ruta(async (req, res) => {
  const platilloId = id(req.params.id)
  const anterior = uno('SELECT foto FROM platillos WHERE id = ?', platilloId)
  if (!anterior) throw new ErrorHttp(404, 'Platillo no encontrado')
  const platillo = uno(
    "UPDATE platillos SET foto = NULL, actualizado = datetime('now') WHERE id = ? RETURNING *",
    platilloId,
  )
  await borrarFoto(anterior.foto)
  res.json(aPlatillo(platillo))
}))

admin.post('/categorias', (req, res) => {
  const b = req.body ?? {}
  const categoria = uno(
    `INSERT INTO categorias (menu_id, nombre, nota, orden)
     SELECT m.id, ?, ?, (SELECT COALESCE(MAX(orden) + 1, 0) FROM categorias WHERE menu_id = m.id)
       FROM menus m WHERE m.slug = ?
     RETURNING *`,
    texto(b.nombre, 'nombre', { requerido: true }), texto(b.nota, 'nota') ?? null, String(b.menu ?? ''),
  )
  if (!categoria) throw new ErrorHttp(404, 'Menú no encontrado')
  res.status(201).json({ ...categoria, platillos: [] })
})

admin.patch('/categorias/:id', (req, res) => {
  const b = req.body ?? {}
  res.json(actualizar('categorias', req.params.id, {
    nombre: texto(b.nombre, 'nombre', { requerido: true }),
    nota: texto(b.nota, 'nota'),
  }))
})

admin.delete('/categorias/:id', ruta(async (req, res) => {
  const categoriaId = id(req.params.id)
  // Los platillos se borran en cascada; antes guardamos sus fotos para quitarlas del disco
  const fotos = todos('SELECT foto FROM platillos WHERE categoria_id = ? AND foto IS NOT NULL', categoriaId)
  if (!ejecutar('DELETE FROM categorias WHERE id = ?', categoriaId).changes) {
    throw new ErrorHttp(404, 'Categoría no encontrada')
  }
  await Promise.all(fotos.map((f) => borrarFoto(f.foto)))
  res.status(204).end()
}))

admin.put('/password', ruta(async (req, res) => {
  const { actual, nueva } = req.body ?? {}
  if (!nueva || String(nueva).length < 8) throw new ErrorHttp(400, 'La nueva contraseña debe tener al menos 8 caracteres')
  const fila = uno('SELECT password_hash FROM admins WHERE id = ?', req.admin.sub)
  if (!fila || !(await bcrypt.compare(String(actual ?? ''), fila.password_hash))) {
    throw new ErrorHttp(400, 'La contraseña actual no es correcta')
  }
  ejecutar('UPDATE admins SET password_hash = ? WHERE id = ?', await bcrypt.hash(String(nueva), 10), req.admin.sub)
  res.status(204).end()
}))

app.use('/api/admin', admin)

app.use('/api', (_req, res) => res.status(404).json({ error: 'Ruta no encontrada' }))

/* ---------- Frontend compilado (producción) ---------- */

const dist = fileURLToPath(new URL('../../client/dist', import.meta.url))
if (existsSync(dist)) {
  app.use(express.static(dist))
  app.get('*', (_req, res) => res.sendFile('index.html', { root: dist }))
}

app.use((err, _req, res, _next) => {
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'La foto es demasiado grande (máximo 15 MB)' })
  if (err.status) return res.status(err.status).json({ error: err.message })
  if (/FOREIGN KEY constraint failed/.test(err.message)) {
    return res.status(400).json({ error: 'La categoría indicada no existe' })
  }
  console.error(err)
  res.status(500).json({ error: 'Error interno del servidor' })
})

const port = Number(process.env.PORT ?? 4000)
app.listen(port, () => console.log(`API de Zibatá en http://localhost:${port}`))
