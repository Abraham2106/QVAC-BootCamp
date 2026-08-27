import { Link } from 'react-router-dom'
import MarkdownLink from '../components/MarkdownLink'
import Reveal from '../components/Reveal'
import LinkButton from '../components/LinkButton'
import { markdownRoute } from '../lib/markdown'

export default function PublishedClass({ number, title, description, folder }) {
  const base = `/${folder}`
  return <>
    <section className="class-hero container"><Reveal>
      <span className="kicker">Clase {String(number).padStart(2, '0')}</span>
      <h1>{title}</h1><p className="eq">{description}</p>
    </Reveal></section>
    <section className="section container"><Reveal>
      <h2 className="stitle">Lección y laboratorio</h2>
      <div className="cta-row"><LinkButton to={markdownRoute(`${base}/lesson.md`)}>Leer la lección →</LinkButton></div>
      <div className="grid grid--2">
        <div className="card artifact"><span className="tag">LAB</span><h3>Práctica guiada</h3><MarkdownLink staticPath={`${base}/lab/README.md`}>Abrir el laboratorio</MarkdownLink></div>
        <div className="card artifact"><span className="tag">ASSESSMENT</span><h3>Checkpoint</h3><MarkdownLink staticPath={`${base}/assessment/checkpoint.md`}>Ver checkpoint</MarkdownLink></div>
      </div>
    </Reveal></section>
    <div className="container class-back"><Link to="/curriculum">← Currículo completo</Link></div>
  </>
}
