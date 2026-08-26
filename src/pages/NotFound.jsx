import LinkButton from '../components/LinkButton'

export default function NotFound() {
  return (
    <div className="container">
      <section className="hero">
        <span className="kicker">Error 404</span>
        <h1 className="display">Esta ruta no existe</h1>
        <div className="rule" />
        <p className="lede">
          La página que buscas no forma parte del bootcamp: puede que el enlace haya cambiado o que esa
          clase aún no se haya publicado.
        </p>
        <div className="cta-row">
          <LinkButton to="/">Volver al inicio</LinkButton>
          <LinkButton to="/curriculum" variant="ghost">
            Ver currículo
          </LinkButton>
        </div>
      </section>
    </div>
  )
}
