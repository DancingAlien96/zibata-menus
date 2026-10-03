import { todos, uno, aPlatillo } from './db.js'

// Devuelve un menú con sus categorías y platillos anidados, o null si no existe.
export function obtenerMenu(slug, { soloDisponibles = true } = {}) {
  const menu = uno('SELECT id, slug, nombre FROM menus WHERE slug = ?', slug)
  if (!menu) return null

  const categorias = todos(
    'SELECT id, nombre, nota, orden FROM categorias WHERE menu_id = ? ORDER BY orden, id',
    menu.id,
  )
  const platillos = todos(
    `SELECT p.id, p.categoria_id, p.nombre, p.descripcion, p.precio, p.precio_doble,
            p.disponible, p.orden, p.actualizado
       FROM platillos p
       JOIN categorias c ON c.id = p.categoria_id
      WHERE c.menu_id = ? ${soloDisponibles ? 'AND p.disponible = 1' : ''}
      ORDER BY p.orden, p.id`,
    menu.id,
  ).map(aPlatillo)

  return {
    ...menu,
    categorias: categorias.map((c) => ({
      ...c,
      platillos: platillos.filter((p) => p.categoria_id === c.id),
    })),
  }
}
