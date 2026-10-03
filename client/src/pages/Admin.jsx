import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, sesion, quetzales } from '../api.js'

const MENUS = [
  { slug: 'alimentos', nombre: 'Alimentos' },
  { slug: 'bebidas', nombre: 'Bebidas' },
]

const aTexto = (n) => (n == null ? '' : Number(n).toFixed(2))
const aBorrador = (p) => ({
  nombre: p.nombre,
  descripcion: p.descripcion ?? '',
  precio: aTexto(p.precio),
  precio_doble: aTexto(p.precio_doble),
})

export default function Admin() {
  const navigate = useNavigate()
  const usuario = sesion.obtener()?.usuario
  const [slug, setSlug] = useState('alimentos')
  const [menu, setMenu] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [aviso, setAviso] = useState(null)

  const salir = useCallback(() => {
    sesion.cerrar()
    navigate('/admin/login', { replace: true })
  }, [navigate])

  // Ejecuta una llamada a la API mostrando el resultado en el aviso flotante.
  const ejecutar = useCallback(async (fn, exito) => {
    try {
      const r = await fn()
      if (exito) setAviso({ tipo: 'ok', texto: exito })
      return r
    } catch (err) {
      if (err.status === 401) return salir()
      setAviso({ tipo: 'error', texto: err.message })
      throw err
    }
  }, [salir])

  const cargar = useCallback(() => {
    ejecutar(() => api(`/admin/menus/${slug}`)).then(setMenu, () => {})
  }, [slug, ejecutar])

  useEffect(() => {
    if (!sesion.obtener()) navigate('/admin/login', { replace: true })
    else cargar()
  }, [cargar, navigate])

  useEffect(() => {
    if (!aviso) return
    const t = setTimeout(() => setAviso(null), 3000)
    return () => clearTimeout(t)
  }, [aviso])

  const reemplazarPlatillo = (p) =>
    setMenu((m) => ({
      ...m,
      categorias: m.categorias.map((c) => ({
        ...c,
        platillos: c.platillos.map((x) => (x.id === p.id ? p : x)),
      })),
    }))

  async function agregarCategoria() {
    const nombre = prompt('Nombre de la nueva categoría')
    if (!nombre?.trim()) return
    await ejecutar(() => api('/admin/categorias', { method: 'POST', body: { menu: slug, nombre } }), 'Categoría creada').catch(() => {})
    cargar()
  }

  const filtro = busqueda.trim().toLowerCase()
  const categorias = (menu?.categorias ?? []).map((c) => ({
    ...c,
    visibles: filtro ? c.platillos.filter((p) => p.nombre.toLowerCase().includes(filtro)) : c.platillos,
  })).filter((c) => !filtro || c.visibles.length)

  const total = menu?.categorias.reduce((n, c) => n + c.platillos.length, 0) ?? 0
  const agotados = menu?.categorias.reduce((n, c) => n + c.platillos.filter((p) => !p.disponible).length, 0) ?? 0

  return (
    <div className="admin">
      <header className="admin-barra">
        <img src="/assets/logo.png" alt="Zibatá" />
        <div className="admin-barra-titulo">
          <strong>Panel de administración</strong>
          <span>Hola, {usuario}</span>
        </div>
        <Link to="/" className="boton secundario chico ver-menu" target="_blank">Ver menú</Link>
        <button className="boton secundario chico" onClick={salir}>Salir</button>
      </header>

      <div className="admin-contenido">
        <div className="admin-controles">
          <nav className="pestanas">
            {MENUS.map((m) => (
              <button key={m.slug} className={m.slug === slug ? 'active' : ''} onClick={() => { setMenu(null); setSlug(m.slug) }}>
                {m.nombre}
              </button>
            ))}
          </nav>
          <input
            className="buscador"
            type="search"
            placeholder="Buscar platillo o bebida…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {menu && (
          <p className="resumen">
            {total} productos · {agotados ? `${agotados} marcados como no disponibles` : 'todos disponibles'}
          </p>
        )}
        {!menu && <p className="aviso">Cargando…</p>}

        {categorias.map((c) => (
          <Categoria
            key={c.id}
            categoria={c}
            platillos={c.visibles}
            ejecutar={ejecutar}
            onCambio={reemplazarPlatillo}
            onRecargar={cargar}
          />
        ))}

        {menu && !filtro && (
          <button className="boton secundario agregar-categoria" onClick={agregarCategoria}>+ Nueva categoría</button>
        )}

        <CambiarPassword ejecutar={ejecutar} />
      </div>

      {aviso && <div className={`toast ${aviso.tipo}`} role="status">{aviso.texto}</div>}
    </div>
  )
}

function Categoria({ categoria, platillos, ejecutar, onCambio, onRecargar }) {
  const [editando, setEditando] = useState(false)
  const [nombre, setNombre] = useState(categoria.nombre)
  const [nota, setNota] = useState(categoria.nota ?? '')
  const [agregando, setAgregando] = useState(false)

  async function guardar() {
    await ejecutar(
      () => api(`/admin/categorias/${categoria.id}`, { method: 'PATCH', body: { nombre, nota } }),
      'Categoría actualizada',
    ).catch(() => {})
    setEditando(false)
    onRecargar()
  }

  async function eliminar() {
    const n = categoria.platillos.length
    if (!confirm(`¿Eliminar la categoría "${categoria.nombre}"${n ? ` y sus ${n} productos` : ''}? Esta acción no se puede deshacer.`)) return
    await ejecutar(() => api(`/admin/categorias/${categoria.id}`, { method: 'DELETE' }), 'Categoría eliminada').catch(() => {})
    onRecargar()
  }

  return (
    <section className="admin-categoria">
      {editando ? (
        <div className="categoria-edicion">
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} aria-label="Nombre de la categoría" />
          <input value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Nota (opcional), p. ej. «Todos los típicos llevan 3 unidades»" aria-label="Nota" />
          <div className="acciones-fila">
            <button className="boton principal chico" onClick={guardar}>Guardar</button>
            <button className="boton secundario chico" onClick={() => setEditando(false)}>Cancelar</button>
          </div>
        </div>
      ) : (
        <div className="categoria-cabecera">
          <div>
            <h2>{categoria.nombre}</h2>
            {categoria.nota && <p className="nota">{categoria.nota}</p>}
          </div>
          <div className="acciones-fila">
            <button className="boton-texto" onClick={() => { setNombre(categoria.nombre); setNota(categoria.nota ?? ''); setEditando(true) }}>Editar</button>
            <button className="boton-texto peligro" onClick={eliminar}>Eliminar</button>
          </div>
        </div>
      )}

      <div className="tabla">
        <div className="tabla-cabecera" aria-hidden="true">
          <span>Nombre</span>
          <span>Descripción</span>
          <span>Precio (Q)</span>
          <span>Precio 2x (Q)</span>
          <span>Disponible</span>
          <span />
        </div>
        {platillos.map((p) => (
          <FilaPlatillo key={p.id} platillo={p} ejecutar={ejecutar} onCambio={onCambio} onRecargar={onRecargar} />
        ))}
        {agregando ? (
          <NuevoPlatillo categoriaId={categoria.id} ejecutar={ejecutar} onListo={() => { setAgregando(false); onRecargar() }} onCancelar={() => setAgregando(false)} />
        ) : (
          <button className="boton-texto agregar" onClick={() => setAgregando(true)}>+ Agregar producto</button>
        )}
      </div>
    </section>
  )
}

function CamposPlatillo({ borrador, setBorrador }) {
  const campo = (k) => ({ value: borrador[k], onChange: (e) => setBorrador({ ...borrador, [k]: e.target.value }) })
  return (
    <>
      <input className="c-nombre" aria-label="Nombre" placeholder="Nombre" {...campo('nombre')} />
      <input className="c-desc" aria-label="Descripción" placeholder="Descripción (opcional)" {...campo('descripcion')} />
      <label className="c-precio"><span>Q</span><input type="number" min="0" step="0.01" inputMode="decimal" aria-label="Precio" {...campo('precio')} /></label>
      <label className="c-doble"><span>2x Q</span><input type="number" min="0" step="0.01" inputMode="decimal" aria-label="Precio 2x" placeholder="—" {...campo('precio_doble')} /></label>
    </>
  )
}

function FilaPlatillo({ platillo, ejecutar, onCambio, onRecargar }) {
  const [borrador, setBorrador] = useState(() => aBorrador(platillo))
  const [guardando, setGuardando] = useState(false)
  const original = aBorrador(platillo)
  const cambiado = Object.keys(original).some((k) => original[k] !== borrador[k])

  async function guardar(extra = {}) {
    setGuardando(true)
    try {
      const body = extra.disponible === undefined ? borrador : extra
      const p = await ejecutar(
        () => api(`/admin/platillos/${platillo.id}`, { method: 'PATCH', body }),
        extra.disponible === undefined
          ? `«${borrador.nombre}» guardado`
          : `«${platillo.nombre}» ${extra.disponible ? 'disponible' : 'marcado como no disponible'}`,
      )
      onCambio(p)
      if (extra.disponible === undefined) setBorrador(aBorrador(p))
    } catch {
      /* el aviso ya muestra el error */
    } finally {
      setGuardando(false)
    }
  }

  async function eliminar() {
    if (!confirm(`¿Eliminar «${platillo.nombre}» del menú?`)) return
    await ejecutar(() => api(`/admin/platillos/${platillo.id}`, { method: 'DELETE' }), 'Producto eliminado').catch(() => {})
    onRecargar()
  }

  return (
    <form
      className={`fila ${platillo.disponible ? '' : 'agotado'} ${cambiado ? 'cambiado' : ''}`}
      onSubmit={(e) => { e.preventDefault(); if (cambiado) guardar() }}
    >
      <CamposPlatillo borrador={borrador} setBorrador={setBorrador} />
      <label className="interruptor" title={platillo.disponible ? 'Disponible' : 'No disponible'}>
        <input type="checkbox" checked={platillo.disponible} onChange={(e) => guardar({ disponible: e.target.checked })} disabled={guardando} />
        <span className="riel" />
        <span className="texto-movil">{platillo.disponible ? 'Disponible' : 'No disponible'}</span>
      </label>
      <div className="acciones-fila">
        {cambiado ? (
          <>
            <button className="boton principal chico" disabled={guardando}>{guardando ? '…' : 'Guardar'}</button>
            <button type="button" className="boton-texto" onClick={() => setBorrador(original)}>Deshacer</button>
          </>
        ) : (
          <button type="button" className="boton-texto peligro" onClick={eliminar} aria-label={`Eliminar ${platillo.nombre}`}>Eliminar</button>
        )}
      </div>
      {cambiado && original.precio !== borrador.precio && borrador.precio !== '' && (
        <p className="cambio-precio">{quetzales(platillo.precio)} → {quetzales(Number(borrador.precio))}</p>
      )}
    </form>
  )
}

function NuevoPlatillo({ categoriaId, ejecutar, onListo, onCancelar }) {
  const [borrador, setBorrador] = useState({ nombre: '', descripcion: '', precio: '', precio_doble: '' })

  async function crear(e) {
    e.preventDefault()
    try {
      await ejecutar(
        () => api('/admin/platillos', { method: 'POST', body: { ...borrador, categoria_id: categoriaId } }),
        `«${borrador.nombre}» agregado`,
      )
      onListo()
    } catch {
      /* el aviso ya muestra el error */
    }
  }

  return (
    <form className="fila nueva" onSubmit={crear}>
      <CamposPlatillo borrador={borrador} setBorrador={setBorrador} />
      <span />
      <div className="acciones-fila">
        <button className="boton principal chico">Agregar</button>
        <button type="button" className="boton-texto" onClick={onCancelar}>Cancelar</button>
      </div>
    </form>
  )
}

function CambiarPassword({ ejecutar }) {
  const [abierto, setAbierto] = useState(false)
  const [actual, setActual] = useState('')
  const [nueva, setNueva] = useState('')

  async function cambiar(e) {
    e.preventDefault()
    try {
      await ejecutar(() => api('/admin/password', { method: 'PUT', body: { actual, nueva } }), 'Contraseña actualizada')
      setAbierto(false)
      setActual('')
      setNueva('')
    } catch {
      /* el aviso ya muestra el error */
    }
  }

  if (!abierto) {
    return <button className="boton-texto cambiar-password" onClick={() => setAbierto(true)}>Cambiar contraseña</button>
  }
  return (
    <form className="admin-categoria formulario" onSubmit={cambiar}>
      <h2>Cambiar contraseña</h2>
      <label>Contraseña actual<input type="password" value={actual} onChange={(e) => setActual(e.target.value)} autoComplete="current-password" required /></label>
      <label>Nueva contraseña (mínimo 8 caracteres)<input type="password" value={nueva} onChange={(e) => setNueva(e.target.value)} autoComplete="new-password" minLength={8} required /></label>
      <div className="acciones-fila">
        <button className="boton principal chico">Guardar</button>
        <button type="button" className="boton-texto" onClick={() => setAbierto(false)}>Cancelar</button>
      </div>
    </form>
  )
}
