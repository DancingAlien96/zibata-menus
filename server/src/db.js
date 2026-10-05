import { mkdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DatabaseSync } from 'node:sqlite'

// Toda la base de datos vive en este archivo (por defecto server/data/zibata.db).
export const RUTA_DB = process.env.DB_PATH ?? fileURLToPath(new URL('../data/zibata.db', import.meta.url))
// Las fotos de los platillos se guardan junto a la base de datos.
export const RUTA_FOTOS = join(dirname(RUTA_DB), 'fotos')

mkdirSync(RUTA_FOTOS, { recursive: true })

export const db = new DatabaseSync(RUTA_DB)
db.exec('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;')

// Crea las tablas que falten y aplica migraciones sobre bases ya existentes.
db.exec(readFileSync(new URL('../db/schema.sql', import.meta.url), 'utf8'))
const columnas = db.prepare('PRAGMA table_info(platillos)').all().map((c) => c.name)
if (!columnas.includes('foto')) db.exec('ALTER TABLE platillos ADD COLUMN foto TEXT')

export const todos = (sql, ...params) => db.prepare(sql).all(...params)
export const uno = (sql, ...params) => db.prepare(sql).get(...params)
export const ejecutar = (sql, ...params) => db.prepare(sql).run(...params)

export function transaccion(fn) {
  db.exec('BEGIN')
  try {
    const resultado = fn()
    db.exec('COMMIT')
    return resultado
  } catch (err) {
    db.exec('ROLLBACK')
    throw err
  }
}

// SQLite guarda los booleanos como 0/1; el frontend espera true/false.
// "foto" se guarda como nombre base; aquí se convierte en las URLs de sus dos tamaños.
export const aPlatillo = (fila) => {
  if (!fila) return fila
  const { foto, ...resto } = fila
  return {
    ...resto,
    disponible: Boolean(fila.disponible),
    foto: foto ? `/fotos/${foto}.webp` : null,
    foto_mini: foto ? `/fotos/${foto}-mini.webp` : null,
  }
}
