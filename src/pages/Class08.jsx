import { Link } from 'react-router-dom'
import DodLiveRegion from '../components/DodLiveRegion'
import ClassArtifactsSection from '../components/ClassArtifactsSection'
import ClassLessonLinks from '../components/ClassLessonLinks'
import FeatureCard from '../components/FeatureCard'
import MarkdownLink from '../components/MarkdownLink'
import ProgressDisplay from '../components/ProgressDisplay'
import Reveal from '../components/Reveal'
import { CLASS08 } from '../data/curriculum'
import { useRememberVisit } from '../hooks/useProgress'
import { useProgressWithFeedback } from '../hooks/useProgressWithFeedback'

const BASE = '/class-08-translation-voice-relay'

const ANCHORS = [
  { id: 'leccion', label: 'Lección' },
  { id: 'lab', label: 'Lab' },
  { id: 'artefactos', label: 'Artefactos' },
  { id: 'dod', label: 'Definition of Done' },
]

export default function Class08() {
  const { state, toggle, pct, feedback } = useProgressWithFeedback(CLASS08.id, CLASS08.dodItems.length)
  useRememberVisit()

  return (
    <>
      <section className="class-hero container">
        <Reveal>
          <span className="kicker">{CLASS08.kicker}</span>
          <h1>{CLASS08.title}</h1>
          <p className="eq">&ldquo;{CLASS08.eq}&rdquo;</p>
          <div className="class-hero__progress">
            <ProgressDisplay pct={pct} size={58} label="Progreso Clase 8" />
            <p>Un intérprete local: parciales visibles, solo finales traducibles, cola TTS acotada y modo avión demostrable.</p>
          </div>
          <nav className="anchor-tabs" aria-label="Secciones de la clase">
            {ANCHORS.map((a) => <a key={a.id} href={'#' + a.id}>{a.label}</a>)}
          </nav>
        </Reveal>
      </section>

      <section className="section container" id="leccion" aria-labelledby="leccion-title">
        <Reveal>
          <h2 className="stitle" id="leccion-title">Lección canónica</h2>
          <p className="lede section-intro">Four clocks, segmentId, Bergamot vs LLM generativo, backpressure y RTF sobre el relay de la Clase 07.</p>
          <ClassLessonLinks base={BASE} classIndex={8} />
          <div className="grid grid--3">
            {CLASS08.outcomes.map((o) => <FeatureCard key={o.tag} tag={o.tag} title={o.title} body={o.body} />)}
          </div>
        </Reveal>
      </section>

      <section className="section container" id="lab" aria-labelledby="lab-title">
        <Reveal>
          <h2 className="stitle" id="lab-title">Lab guiado — Intérprete local</h2>
          <p className="lede section-intro">7 pasos. Provisiona ASR/TTS, elige ruta de traducción, define contratos, traduce solo finales y rompe el relay de forma controlada.</p>
          <div className="artifact card card--lift">
            <span className="tag">LAB</span>
            <div>
              <h3>Parciales en UI, finales al traductor</h3>
              <ul>
                <li><MarkdownLink staticPath={`${BASE}/lab/README.md`}>lab/README.md</MarkdownLink> — tabla de 5 segmentos con latencias y resultado</li>
                <li><a href={`${BASE}/examples/relay-pipeline.js`}>examples/relay-pipeline.js</a> — pipeline ASR → traducción → TTS</li>
                <li>Fuerza TTS lento, falla traducción en un segmento y cierra durante TTS</li>
              </ul>
            </div>
          </div>
        </Reveal>
      </section>

      <ClassArtifactsSection>
        <div className="grid grid--2">
          <div className="card artifact card--lift"><span className="tag">CHALLENGE</span><div><h3>Relay bilingüe resistente</h3><p className="artifact-desc">ES ↔ EN con IDs monótonos, fuera de orden, cola TTS máxima de dos y demo de 90 s en modo avión.</p><MarkdownLink staticPath={`${BASE}/challenge/challenge.md`}>challenge/challenge.md</MarkdownLink>{' · '}<MarkdownLink staticPath={`${BASE}/solution/README.md`}>solution/README.md</MarkdownLink></div></div>
          <div className="card artifact card--lift"><span className="tag">ASSESSMENT</span><div><h3>Checkpoint</h3><p className="artifact-desc">7 preguntas con evidencia de lab; rúbrica 25/25/25/25 incluida en el checkpoint.</p><MarkdownLink staticPath={`${BASE}/assessment/checkpoint.md`}>checkpoint.md</MarkdownLink></div></div>
          <div className="card artifact card--lift"><span className="tag">INSTRUCTOR</span><div><h3>Guía docente</h3><p className="artifact-desc">Facilitación del relay y fallos deliberados.</p><MarkdownLink staticPath={`${BASE}/instructor/guide.md`}>instructor/guide.md</MarkdownLink></div></div>
          <div className="card artifact card--lift"><span className="tag">NOTEBOOKLM</span><div><h3>Companion de repaso</h3><p className="artifact-desc">Fuentes enfocadas para repaso del intérprete.</p><MarkdownLink staticPath={`${BASE}/notebooklm/source-guide.md`}>source-guide.md</MarkdownLink></div></div>
        </div>
      </ClassArtifactsSection>

      <section className="section container" id="dod" aria-labelledby="dod-title">
        <Reveal>
          <h2 className="stitle" id="dod-title">Definition of Done</h2>
          <p className="lede section-intro">Sin oír una frase no basta: demuestra orden, parciales, recuperación y ausencia de red.</p>
          <DodLiveRegion message={feedback} />
          <ul className="dod">
            {CLASS08.dodItems.map((item) => <li key={item.id}><label><input type="checkbox" checked={!!state[item.id]} onChange={(e) => toggle(item.id, e.target.checked)} /><span>{item.label}</span></label></li>)}
          </ul>
          <div className="block example dod-next"><div className="block-title">Siguiente parada</div><div className="block-body"><Link to="/class/09">Clase 9 — The OpenAI-Compatible Escape Hatch: la misma forma HTTP, otra colocación. →</Link></div></div>
        </Reveal>
      </section>

      <div className="container class-back"><Link to="/curriculum">← Currículo completo</Link></div>
    </>
  )
}
