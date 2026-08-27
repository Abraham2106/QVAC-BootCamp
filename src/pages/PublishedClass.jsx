import { Link } from 'react-router-dom'
import MarkdownLink from '../components/MarkdownLink'
import ClassLessonLinks from '../components/ClassLessonLinks'
import Reveal from '../components/Reveal'
import SlidesEmbed from '../components/SlidesEmbed'

export default function PublishedClass({ number, title, description, folder }) {
  const base = `/${folder}`
  const slideCount = { 8: 25, 9: 25, 10: 25 }[number] ?? 0
  return <>
    <section className="class-hero container"><Reveal>
      <span className="kicker">Clase {String(number).padStart(2, '0')}</span>
      <h1>{title}</h1><p className="eq">{description}</p>
    </Reveal></section>
    <section className="section container"><Reveal>
      <h2 className="stitle">PresentaciÃ³n de la clase</h2>
      <p className="lede section-intro">{slideCount} diapositivas Â· modelo mental, demo, diagnóstico y Definition of Done.</p>
      <SlidesEmbed src={`${base}/slides.html`} title={`Slides de la Clase ${number}: ${title}`} previewLabel={title} hint={slideCount} />
    </Reveal></section>
    <section className="section container"><Reveal>
      <h2 className="stitle">Lección y laboratorio</h2>
      <ClassLessonLinks base={base} classIndex={number} />
      <div className="grid grid--2">
        <div className="card artifact"><span className="tag">LAB</span><h3>Práctica guiada</h3><MarkdownLink staticPath={`${base}/lab/README.md`}>Abrir el laboratorio</MarkdownLink></div>
        <div className="card artifact"><span className="tag">ASSESSMENT</span><h3>Checkpoint</h3><MarkdownLink staticPath={`${base}/assessment/checkpoint.md`}>Ver checkpoint</MarkdownLink></div>
      </div>
    </Reveal></section>
    <div className="container class-back"><Link to="/curriculum">← Currículo completo</Link></div>
  </>
}
