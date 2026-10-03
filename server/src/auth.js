import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET ?? 'zibata-dev-secret'

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('Define JWT_SECRET en producción')
}

export const firmarToken = (admin) =>
  jwt.sign({ sub: admin.id, usuario: admin.usuario }, SECRET, { expiresIn: '12h' })

export function requiereAdmin(req, res, next) {
  const [tipo, token] = (req.headers.authorization ?? '').split(' ')
  if (tipo !== 'Bearer' || !token) return res.status(401).json({ error: 'No autorizado' })
  try {
    req.admin = jwt.verify(token, SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Sesión expirada, vuelve a iniciar sesión' })
  }
}
