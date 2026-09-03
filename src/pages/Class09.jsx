import { Link } from 'react-router-dom'
import DodLiveRegion from '../components/DodLiveRegion'
import ClassArtifactsSection from '../components/ClassArtifactsSection'
import ClassLessonLinks from '../components/ClassLessonLinks'
import FeatureCard from '../components/FeatureCard'
import MarkdownLink from '../components/MarkdownLink'
import ProgressDisplay from '../components/ProgressDisplay'
import Reveal from '../components/Reveal'
import { CLASS09 } from '../data/curriculum'
import { useRememberVisit } from '../hooks/useProgress'
import { useProgressWithFeedback } from '../hooks/useProgressWithFeedback'

const BASE = '/class-09-openai-compatible-escape-hatch'

const ANCHORS = [
  { id: 'leccion', label: 'Lección' },
  { id: 'lab', label: 'Lab' },
  { id: 'artefactos', label: 'Artefactos' },
  { id: 'dod', label: 'Definition of Done' },
]

export default function Class09() {
  const { state, toggle, pct, feedback } = useProgressWithFeedback(CLASS09.id, CLASS09.dodItems.length)
  useRememberVisit()

  return (
    <>
      <section className="class-hero container">
        <Reveal>
          <span className="kicker">{CLASS09.kicker}</span>
          <h1>{CLASS09.title}</h1>
          <p className="eq">&ldquo;{CLASS09.eq}&rdquo;</p>
          <div className="class-hero__progress">
            <ProgressDisplay pct={pct} size={58} label="Progreso Clase 9" />
            <p>Compatibilidad es contrato HTTP, no equivalencia de modelo: verifícalo con evidencia.</p>
          </div>
          <nav className="anchor-tabs" aria-label="Secciones de la clase">
            {ANCHORS.map((a) => <a key={a.id} href={'#' + a.id}>{a.label}</a>)}
          </nav>
        </Reveal>
      </section>

      <section className="section container" id="leccion" aria-labelledby="leccion-title">
        <Reveal>
          <h2 className="stitle" id="leccion-title">Lección canónica</h2>
          <p className="lede section-intro">baseURL como frontera, contrato mínimo, SSE, secretos y las tres dependencias: red, servidor y modelo.</p>
          <ClassLessonLinks base={BASE} classIndex={9} />
          <div className="grid grid--3">
            {CLASS09.outcomes.map((o) => <FeatureCard key={o.tag} tag={o.tag} title={o.title} body={o.body} />)}
          </div>
        </Reveal>
      </section>

      <section className="section container" id="lab" aria-labelledby="lab-title">
        <Reveal>
          <h2 className="stitle" id="lab-title">Lab guiado — Drop-in Local Client</h2>
          <p className="lede section-intro">75–90 min. Cliente conmutable por entorno, streaming, métricas y fallback seguro.</p>
          <div className="artifact card card--lift">
            <span className="tag">LAB</span>
            <div>
              <h3>Predice, modifica, rompe, mide y prueba offline</h3>
              <ul>
                <li><MarkdownLink staticPath={`${BASE}/lab/README.md`}>lab/README.md</MarkdownLink> — 7 partes hasta ADR-009</li>
                <li><a href={`${BASE}/lab/starter/client-starter.ts`}>lab/starter/client-starter.ts</a> — starter con fetch, sin secretos</li>
                <li><a href={`${BASE}/examples/01-smoke-test.ts`}>01-smoke-test.ts</a> · <a href={`${BASE}/examples/02-stream-sse.ts`}>02-stream-sse.ts</a> — contrato normal y SSE</li>
              </ul>
            </div>
          </div>
        </Reveal>
      </section>

      <ClassArtifactsSection>
        <div className="grid grid--2">
          <div className="card artifact card--lift"><span className="tag">CHALLENGE</span><div><h3>The Great Swap</h3><p className="artifact-desc">Migra una app cloud-fija a QVAC sin tocar la UI; 7 acceptance tests + demo de 5 min.</p><MarkdownLink staticPath={`${BASE}/challenge/challenge.md`}>challenge/challenge.md</MarkdownLink></div></div>
          <div className="card artifact card--lift"><span className="tag">ASSESSMENT</span><div><h3>Checkpoint + rubric</h3><p className="artifact-desc">Contrato, SSE, errores, offline proof y política fail-closed.</p><MarkdownLink staticPath={`${BASE}/assessment/checkpoint.md`}>checkpoint.md</MarkdownLink>{' · '}<MarkdownLink staticPath={`${BASE}/assessment/rubric.md`}>rubric.md</MarkdownLink></div></div>
          <div className="card artifact card--lift"><span className="tag">INSTRUCTOR</span><div><h3>Guía docente</h3><p className="artifact-desc">Facilitación y problemas frecuentes de migración.</p><MarkdownLink staticPath={`${BASE}/instructor/instructor-guide.md`}>instructor-guide.md</MarkdownLink></div></div>
          <div className="card artifact card--lift"><span className="tag">NOTEBOOKLM</span><div><h3>Companion de repaso</h3><p className="artifact-desc">Podcast, slides, flashcards y quiz del escape hatch.</p><MarkdownLink staticPath={`${BASE}/notebooklm/podcast-prompt.md`}>podcast</MarkdownLink>{' · '}<MarkdownLink staticPath={`${BASE}/notebooklm/presentation-prompt.md`}>slides</MarkdownLink>{' · '}<MarkdownLink staticPath={`${BASE}/notebooklm/flashcards-prompt.md`}>flashcards</MarkdownLink>{' · '}<MarkdownLink staticPath={`${BASE}/notebooklm/quiz-prompt.md`}>quiz</MarkdownLink></div></div>
        </div>
      </ClassArtifactsSection>

      <section className="section container" id="dod" aria-labelledby="dod-title">
        <Reveal>
          <h2 className="stitle" id="dod-title">Definition of Done</h2>
          <p className="lede section-intro">Entregable: predictions.md, script final, mediciones, evidencia offline y ADR-009.</p>
          <DodLiveRegion message={feedback} />
          <ul className="dod">
            {CLASS09.dodItems.map((item) => <li key={item.id}><label><input type="checkbox" checked={!!state[item.id]} onChange={(e) => toggle(item.id, e.target.checked)} /><span>{item.label}</span></label></li>)}
          </ul>
          <div className="block example dod-next"><div className="block-title">Siguiente parada</div><div className="block-body"><Link to="/class/10">Clase 10 — Designing Local-First Architectures: del swap a la política. →</Link></div></div>
        </Reveal>
      </section>

      <div className="container class-back"><Link to="/curriculum">← Currículo completo</Link></div>
    </>
  )
}
