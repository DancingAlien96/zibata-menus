import { randomBytes } from 'node:crypto'
import { rm } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'
import { RUTA_FOTOS } from './db.js'

// Tamaños generados para cada foto (lado mayor en píxeles).
// "grande" se ve al tocar el platillo; "mini" es la miniatura de la lista.
const GRANDE = { lado: 1000, calidad: 78 }
const MINI = { lado: 240, calidad: 72 }

// Convierte la imagen subida a WebP en dos tamaños y devuelve el nombre base.
// Lanza un error si el archivo no es una imagen válida.
export async function guardarFoto(buffer, platilloId) {
  const imagen = sharp(buffer, { failOn: 'error' }).rotate() // respeta la orientación EXIF de los celulares
  await imagen.metadata()

  const nombre = `${platilloId}-${randomBytes(4).toString('hex')}`
  await Promise.all([
    imagen
      .clone()
      .resize(GRANDE.lado, GRANDE.lado, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: GRANDE.calidad })
      .toFile(join(RUTA_FOTOS, `${nombre}.webp`)),
    imagen
      .clone()
      .resize(MINI.lado, MINI.lado, { fit: 'cover' })
      .webp({ quality: MINI.calidad })
      .toFile(join(RUTA_FOTOS, `${nombre}-mini.webp`)),
  ])
  return nombre
}

export async function borrarFoto(nombre) {
  if (!nombre) return
  await Promise.all([
    rm(join(RUTA_FOTOS, `${nombre}.webp`), { force: true }),
    rm(join(RUTA_FOTOS, `${nombre}-mini.webp`), { force: true }),
  ])
}
