import { useEffect, useState } from 'react'
import { Link, NavLink, useParams } from 'react-router-dom'
import { api, quetzales } from '../api.js'

export default function Menu() {
  const { slug } = useParams()
  const [menu, setMenu] = useState(null)
  const [error, setError] = useState(null)
  const [ampliada, setAmpliada] = useState(null)

  useEffect(() => {
    let vigente = true
    setMenu(null)
    setError(null)
    api(`/menus/${slug}`)
      .then((m) => vigente && setMenu(m))
      .catch((e) => vigente && setError(e.message))
    window.scrollTo(0, 0)
    return () => {
      vigente = false
    }
  }, [slug])

  const categorias = menu?.categorias.filter((c) => c.platillos.length) ?? []

  return (
    <div className="fondo">
      <main className="hoja carta">
        <header className="carta-encabezado">
          <Link to="/" aria-label="Volver al inicio">
            <img className="logo-chico" src="/assets/logo.png" alt="Zibatá" />
          </Link>
          <h1 className="titulo-script">{slug === 'bebidas' ? 'Menú de Bebidas' : 'Menú 2026'}</h1>
        </header>

        <nav className="pestanas" aria-label="Menús">
          <NavLink to="/menu/alimentos">Alimentos</NavLink>
          <NavLink to="/menu/bebidas">Bebidas</NavLink>
        </nav>

        {categorias.length > 0 && (
          <nav className="indice" aria-label="Categorías">
            {categorias.map((c) => (
              <a key={c.id} href={`#cat-${c.id}`}>{c.nombre}</a>
            ))}
          </nav>
        )}

        {error && <p className="aviso">{error}</p>}
        {!menu && !error && <p className="aviso">Cargando menú…</p>}

        {categorias.map((c) => (
          <section key={c.id} id={`cat-${c.id}`} className="categoria">
            <h2>{c.nombre}</h2>
            <ul>
              {c.platillos.map((p) => (
                <li key={p.id} className={`platillo ${p.foto ? 'con-foto' : ''}`}>
                  {p.foto && (
                    <button className="foto-mini" onClick={() => setAmpliada(p)} aria-label={`Ver foto de ${p.nombre}`}>
                      <img src={p.foto_mini} alt="" loading="lazy" decoding="async" width="240" height="240" />
                    </button>
                  )}
                  <div className="texto">
                    <div className="linea">
                      <span className="nombre">{p.nombre}</span>
                      <span className="puntos" aria-hidden="true" />
                      <span className="precio">{quetzales(p.precio)}</span>
                      {p.precio_doble != null && (
                        <span className="precio doble" title="Promoción 2 por">2x {quetzales(p.precio_doble)}</span>
                      )}
                    </div>
                    {p.descripcion && <p className="descripcion">{p.descripcion}</p>}
                  </div>
                </li>
              ))}
            </ul>
            {c.nota && <p className="nota">{c.nota}</p>}
          </section>
        ))}

        {menu && (
          <footer className="pie">
            <p className="divisor">Buen provecho</p>
          </footer>
        )}
      </main>

      {ampliada && <FotoAmpliada platillo={ampliada} onCerrar={() => setAmpliada(null)} />}
    </div>
  )
}

function FotoAmpliada({ platillo, onCerrar }) {
  useEffect(() => {
    const cerrarConEsc = (e) => e.key === 'Escape' && onCerrar()
    document.addEventListener('keydown', cerrarConEsc)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', cerrarConEsc)
      document.body.style.overflow = ''
    }
  }, [onCerrar])

  return (
    <div className="visor" role="dialog" aria-modal="true" aria-label={platillo.nombre} onClick={onCerrar}>
      <figure className="visor-marco" onClick={(e) => e.stopPropagation()}>
        <img src={platillo.foto} alt={platillo.nombre} />
        <figcaption>
          <strong>{platillo.nombre}</strong>
          <span>{quetzales(platillo.precio)}</span>
          {platillo.descripcion && <em>{platillo.descripcion}</em>}
        </figcaption>
        <button className="visor-cerrar" onClick={onCerrar} aria-label="Cerrar">×</button>
      </figure>
    </div>
  )
}
