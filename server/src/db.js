import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DatabaseSync } from 'node:sqlite'

// Toda la base de datos vive en este archivo (por defecto server/data/zibata.db).
export const RUTA_DB = process.env.DB_PATH ?? fileURLToPath(new URL('../data/zibata.db', import.meta.url))

mkdirSync(dirname(RUTA_DB), { recursive: true })

export const db = new DatabaseSync(RUTA_DB)
db.exec('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;')

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
export const aPlatillo = (fila) => fila && { ...fila, disponible: Boolean(fila.disponible) }
