// Crea las tablas, carga el menú inicial y el usuario administrador.
//   npm run db:setup   -> solo carga datos si la base está vacía
//   npm run db:reset   -> borra todo el menú y lo vuelve a cargar con los precios originales
import { mkdirSync, rmSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { db, uno, ejecutar, transaccion, RUTA_DB, RUTA_FOTOS } from './db.js'
import { menus } from '../db/seed-data.js'

const reset = process.argv.includes('--reset')

try {
  // Las tablas y migraciones ya se aplicaron al importar db.js
  console.log(`✓ Tablas listas en ${RUTA_DB}`)

  transaccion(() => {
    if (reset) {
      db.exec(`DELETE FROM platillos; DELETE FROM categorias; DELETE FROM menus;
               DELETE FROM sqlite_sequence WHERE name IN ('menus', 'categorias', 'platillos');`)
      console.log('✓ Menú anterior eliminado')
    }

    if (uno('SELECT count(*) AS n FROM menus').n === 0) {
      let total = 0
      for (const [mi, menu] of menus.entries()) {
        const m = uno('INSERT INTO menus (slug, nombre, orden) VALUES (?, ?, ?) RETURNING id', menu.slug, menu.nombre, mi)
        for (const [ci, cat] of menu.categorias.entries()) {
          const c = uno(
            'INSERT INTO categorias (menu_id, nombre, nota, orden) VALUES (?, ?, ?, ?) RETURNING id',
            m.id, cat.nombre, cat.nota ?? null, ci,
          )
          for (const [pi, p] of cat.platillos.entries()) {
            ejecutar(
              `INSERT INTO platillos (categoria_id, nombre, descripcion, precio, precio_doble, orden)
               VALUES (?, ?, ?, ?, ?, ?)`,
              c.id, p.nombre, p.descripcion ?? null, p.precio, p.precio_doble ?? null, pi,
            )
            total++
          }
        }
      }
      console.log(`✓ ${total} platillos y bebidas cargados`)
    } else {
      console.log('• El menú ya tiene datos; no se modificó (usa "npm run db:reset" para recargarlo)')
    }

    const usuario = process.env.ADMIN_USER ?? 'admin'
    if (!uno('SELECT 1 AS existe FROM admins WHERE usuario = ?', usuario)) {
      // Sin ADMIN_PASSWORD no usamos una contraseña fija: generamos una y la mostramos una sola vez.
      const generada = !process.env.ADMIN_PASSWORD
      const password = process.env.ADMIN_PASSWORD ?? randomBytes(12).toString('base64url')
      ejecutar('INSERT INTO admins (usuario, password_hash) VALUES (?, ?)', usuario, bcrypt.hashSync(password, 10))
      console.log(`✓ Usuario administrador "${usuario}" creado`)
      if (generada) console.log(`  Contraseña generada (guárdala, no se volverá a mostrar): ${password}`)
    }
  })

  if (reset) {
    // Los platillos ya no existen: sus fotos tampoco deben quedar en disco
    rmSync(RUTA_FOTOS, { recursive: true, force: true })
    mkdirSync(RUTA_FOTOS, { recursive: true })
    console.log('✓ Fotos anteriores eliminadas')
  }
} catch (err) {
  console.error('✗ Error preparando la base de datos:', err.message)
  process.exitCode = 1
} finally {
  db.close()
}
