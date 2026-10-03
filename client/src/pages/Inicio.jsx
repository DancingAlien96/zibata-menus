import { Link } from 'react-router-dom'

const MENUS = [
  {
    slug: 'alimentos',
    titulo: 'Alimentos',
    texto: 'Para compartir, desayunos, típicos y platos fuertes',
    portada: '/assets/portada-comida.jpg',
  },
  {
    slug: 'bebidas',
    titulo: 'Bebidas',
    texto: 'Bebidas preparadas, cervezas, vinos y licores',
    portada: '/assets/portada-bebidas.jpg',
  },
]

export default function Inicio() {
  return (
    <div className="fondo-madera">
      <main className="hoja inicio">
        <img className="decoracion uno" src="/assets/platillo-1.png" alt="" />
        <img className="decoracion dos" src="/assets/platillo-2.png" alt="" />

        <img className="logo" src="/assets/logo.png" alt="Hotel y Restaurante Zibatá — Lugar en la cima del valle" />
        <h1 className="titulo-script">Menú 2026</h1>
        <p className="subtitulo">Bienvenidos</p>

        <section className="tarjetas-menu">
          {MENUS.map((m) => (
            <div key={m.slug} className={`tarjeta-menu ${m.slug}`}>
              <Link className="portada" to={`/menu/${m.slug}`} aria-label={`Ver menú de ${m.titulo.toLowerCase()}`}>
                <img src={m.portada} alt={`Portada del menú de ${m.titulo.toLowerCase()} Zibatá 2026`} />
              </Link>
              <h2>{m.titulo}</h2>
              <p>{m.texto}</p>
              <div className="acciones">
                <Link className="boton principal" to={`/menu/${m.slug}`}>Ver menú</Link>
              </div>
            </div>
          ))}
        </section>

        <p className="divisor">Buen provecho</p>
        <footer className="pie">
          Hotel y Restaurante Zibatá · Lugar en la cima del valle
          <Link className="enlace-admin" to="/admin">Administración</Link>
        </footer>
      </main>
    </div>
  )
}
