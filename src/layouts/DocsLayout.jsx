import { Outlet } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import NinjaGlowOrb from '../components/ninja/NinjaGlowOrb'
import UiModeCrossfade from '../components/ninja/UiModeCrossfade'
import useMermaid from '../hooks/useMermaid'
import useUiMode from '../hooks/useUiMode'

export default function DocsLayout() {
  useMermaid()
  const { isNinja } = useUiMode()

  return (
    <>
      <a className="skip-link" href="#main">
        Saltar al contenido
      </a>
      <UiModeCrossfade />
      {isNinja && <NinjaGlowOrb />}
      <Header />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
