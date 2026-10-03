CREATE TABLE IF NOT EXISTS menus (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  slug       TEXT    NOT NULL UNIQUE,
  nombre     TEXT    NOT NULL,
  orden      INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS categorias (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  menu_id    INTEGER NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  nombre     TEXT    NOT NULL,
  nota       TEXT,
  orden      INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS platillos (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  categoria_id INTEGER NOT NULL REFERENCES categorias(id) ON DELETE CASCADE,
  nombre       TEXT    NOT NULL,
  descripcion  TEXT,
  precio       REAL    NOT NULL CHECK (precio >= 0),
  -- Precio de la promoción 2x (bebidas preparadas)
  precio_doble REAL    CHECK (precio_doble >= 0),
  disponible   INTEGER NOT NULL DEFAULT 1,
  orden        INTEGER NOT NULL DEFAULT 0,
  actualizado  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS platillos_categoria_idx ON platillos(categoria_id);
CREATE INDEX IF NOT EXISTS categorias_menu_idx ON categorias(menu_id);

CREATE TABLE IF NOT EXISTS admins (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario       TEXT    NOT NULL UNIQUE,
  password_hash TEXT    NOT NULL
);
