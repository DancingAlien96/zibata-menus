import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, sesion } from '../api.js'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [enviando, setEnviando] = useState(false)

  async function entrar(e) {
    e.preventDefault()
    setEnviando(true)
    setError(null)
    try {
      sesion.guardar(await api('/auth/login', { method: 'POST', body: { usuario, password } }))
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="fondo">
      <main className="hoja login">
        <img className="logo" src="/assets/logo.png" alt="Zibatá" />
        <h1 className="titulo-script">Administración</h1>
        <form onSubmit={entrar} className="formulario">
          <label>
            Usuario
            <input value={usuario} onChange={(e) => setUsuario(e.target.value)} autoComplete="username" required autoFocus />
          </label>
          <label>
            Contraseña
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
          </label>
          {error && <p className="error">{error}</p>}
          <button className="boton principal" disabled={enviando}>{enviando ? 'Entrando…' : 'Entrar'}</button>
        </form>
        <Link className="enlace-admin" to="/">← Volver al menú</Link>
      </main>
    </div>
  )
}
