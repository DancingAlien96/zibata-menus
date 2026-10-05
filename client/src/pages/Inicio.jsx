import { Link } from 'react-router-dom'

const IconoCubiertos = () => (
  <svg className="icono" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M14 6v12a4 4 0 0 0 8 0V6M18 6v36" />
    <path d="M34 42V6c-4 2-6 8-6 14 0 3 2 5 6 5" />
  </svg>
)

const IconoCopa = () => (
  <svg className="icono" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 6h20l-1 10a9 9 0 0 1-18 0L14 6ZM15 14h18M24 25v15M16 42h16" />
  </svg>
)

const MENUS = [
  {
    slug: 'alimentos',
    titulo: 'Alimentos',
    texto: 'Para compartir, desayunos, típicos y platos fuertes',
    Icono: IconoCubiertos,
  },
  {
    slug: 'bebidas',
    titulo: 'Bebidas',
    texto: 'Bebidas preparadas, cervezas, vinos y licores',
    Icono: IconoCopa,
  },
]

export default function Inicio() {
  return (
    <div className="fondo">
      <main className="hoja inicio">
        <img className="logo" src="/assets/logo.png" alt="Hotel y Restaurante Zibatá — Lugar en la cima del valle" />
        <h1 className="titulo-script">Menú 2026</h1>
        <p className="subtitulo">Bienvenidos</p>

        <section className="tarjetas-menu">
          {MENUS.map(({ slug, titulo, texto, Icono }) => (
            <Link key={slug} className="marco tarjeta-menu" to={`/menu/${slug}`}>
              <div className="marco-interior">
                <Icono />
                <h2>{titulo}</h2>
                <p>{texto}</p>
                <span className="boton principal">Ver menú</span>
              </div>
            </Link>
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
