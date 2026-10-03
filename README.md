# Menú Zibatá 2026

Menú digital del Hotel y Restaurante Zibatá con panel de administración.

- **client/** — React + Vite (inicio, carta digital y panel `/admin`)
- **server/** — Node + Express + SQLite (API)

La base de datos es un solo archivo SQLite (`server/data/zibata.db`) que se crea
automáticamente. No hace falta instalar ni levantar ningún servidor de base de datos.

Requiere Node.js 22.13 o superior (trae SQLite incluido).

## Primera vez

```bash
npm install
cp server/.env.example server/.env   # y cambia JWT_SECRET y ADMIN_PASSWORD
```

## Desarrollo

```bash
npm run dev
```

- Menú: http://localhost:5173
- Administración: http://localhost:5173/admin

La primera vez crea la base de datos con los 103 productos y el usuario administrador.

## Producción

```bash
npm run build
npm start          # sirve API y frontend en http://localhost:4000
```

## Respaldo

Para respaldar la base de datos basta con copiar `server/data/zibata.db`
(con el sistema apagado, o junto con los archivos `-wal` y `-shm` si está encendido).

## Otros comandos

- `npm run db:reset` — borra el menú y lo vuelve a cargar con los precios originales.
