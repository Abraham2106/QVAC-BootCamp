import { Link, useParams } from 'react-router-dom'
import MarkdownViewer from '@/components/MarkdownViewer'
import LinkButton from '@/components/LinkButton'
import Reveal from '@/components/Reveal'
import { markdownBackLink, markdownTitleFromPath } from '@/lib/markdown'

export default function MarkdownPage() {
  const { '*': splat } = useParams()
  const staticPath = '/' + (splat || '')
  const title = markdownTitleFromPath(staticPath)
  const backTo = markdownBackLink(staticPath)

  return (
    <>
      <section className="markdown-page-hero container">
        <Reveal>
          <span className="kicker">Documento</span>
          <h1>{title}</h1>
          <p className="eq markdown-page-hero__path">{staticPath}</p>
          <div className="cta-row">
            <LinkButton to={backTo} variant="ghost">
              ← Volver a la clase
            </LinkButton>
            <LinkButton href={staticPath} target="_blank" rel="noopener noreferrer" variant="ghost">
              Ver Markdown fuente ↗
            </LinkButton>
          </div>
        </Reveal>
      </section>

      <section className="section container markdown-reading-section">
        <Reveal>
          <div className="markdown-page card markdown-reading-card">
            <MarkdownViewer src={staticPath} />
          </div>
        </Reveal>
      </section>

      <div className="container class-back">
        <Link to={backTo}>← Volver a la clase</Link>
      </div>
    </>
  )
}
