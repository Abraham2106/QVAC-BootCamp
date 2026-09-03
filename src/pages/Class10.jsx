import { Link } from 'react-router-dom'
import DodLiveRegion from '../components/DodLiveRegion'
import ClassArtifactsSection from '../components/ClassArtifactsSection'
import ClassLessonLinks from '../components/ClassLessonLinks'
import FeatureCard from '../components/FeatureCard'
import MarkdownLink from '../components/MarkdownLink'
import ProgressDisplay from '../components/ProgressDisplay'
import Reveal from '../components/Reveal'
import { CLASS10 } from '../data/curriculum'
import { useRememberVisit } from '../hooks/useProgress'
import { useProgressWithFeedback } from '../hooks/useProgressWithFeedback'

const BASE = '/class-10-local-first-architectures'

const ANCHORS = [
  { id: 'leccion', label: 'Lección' },
  { id: 'lab', label: 'Lab' },
  { id: 'artefactos', label: 'Artefactos' },
  { id: 'dod', label: 'Definition of Done' },
]

export default function Class10() {
  const { state, toggle, pct, feedback } = useProgressWithFeedback(CLASS10.id, CLASS10.dodItems.length)
  useRememberVisit()

  return (
    <>
      <section className="class-hero container">
        <Reveal>
          <span className="kicker">{CLASS10.kicker}</span>
          <h1>{CLASS10.title}</h1>
          <p className="eq">&ldquo;{CLASS10.eq}&rdquo;</p>
          <div className="class-hero__progress">
            <ProgressDisplay pct={pct} size={58} label="Progreso Clase 10" />
            <p>Local-first como política verificable: clasifica, decide, registra y bloquea exfiltración.</p>
          </div>
          <nav className="anchor-tabs" aria-label="Secciones de la clase">
            {ANCHORS.map((a) => <a key={a.id} href={'#' + a.id}>{a.label}</a>)}
          </nav>
        </Reveal>
      </section>

      <section className="section container" id="leccion" aria-labelledby="leccion-title">
        <Reveal>
          <h2 className="stitle" id="leccion-title">Lección canónica</h2>
          <p className="lede section-intro">Tres fronteras, método ADR, matriz de enrutamiento, invariantes I1–I5 y medición por clase de solicitud.</p>
          <ClassLessonLinks base={BASE} classIndex={10} />
          <div className="grid grid--3">
            {CLASS10.outcomes.map((o) => <FeatureCard key={o.tag} tag={o.tag} title={o.title} body={o.body} />)}
          </div>
        </Reveal>
      </section>

      <section className="section container" id="lab" aria-labelledby="lab-title">
        <Reveal>
          <h2 className="stitle" id="lab-title">Lab guiado — ADR + Safe Fallback</h2>
          <p className="lede section-intro">75–90 min. Predice, clasifica 6 solicitudes, escribe ADR-001, implementa fallback y fuerza cada rama.</p>
          <div className="artifact card card--lift">
            <span className="tag">LAB</span>
            <div>
              <h3>Decisión pura separada del transporte</h3>
              <ul>
                <li><MarkdownLink staticPath={`${BASE}/lab/README.md`}>lab/README.md</MarkdownLink> — 6 partes hasta defensa de 3 min</li>
                <li><a href={`${BASE}/lab/starter/architecture-lab-starter.ts`}>lab/starter/architecture-lab-starter.ts</a> — starter de política</li>
                <li><a href={`${BASE}/examples/01-privacy-classifier.ts`}>01-privacy-classifier.ts</a> · <a href={`${BASE}/examples/02-fallback-policy.ts`}>02-fallback-policy.ts</a> — clasificador y fallback</li>
              </ul>
            </div>
          </div>
        </Reveal>
      </section>

      <ClassArtifactsSection>
        <div className="grid grid--2">
          <div className="card artifact card--lift"><span className="tag">CHALLENGE</span><div><h3>ADR para un asistente de campo</h3><p className="artifact-desc">Notas offline + traducción + remoto opcional; fallback nunca silencioso.</p><MarkdownLink staticPath={`${BASE}/challenge/challenge.md`}>challenge/challenge.md</MarkdownLink>{' · '}<MarkdownLink staticPath={`${BASE}/solution/solution.md`}>solution/solution.md</MarkdownLink></div></div>
          <div className="card artifact card--lift"><span className="tag">ASSESSMENT</span><div><h3>Checkpoint + rubric</h3><p className="artifact-desc">ADR, invariantes, 5 casos de fallback y sacrificio de producto defendido.</p><MarkdownLink staticPath={`${BASE}/assessment/checkpoint.md`}>checkpoint.md</MarkdownLink>{' · '}<MarkdownLink staticPath={`${BASE}/assessment/rubric.md`}>rubric.md</MarkdownLink></div></div>
          <div className="card artifact card--lift"><span className="tag">INSTRUCTOR</span><div><h3>Guía docente</h3><p className="artifact-desc">Facilitación y fallos deliberados de frontera.</p><MarkdownLink staticPath={`${BASE}/instructor/instructor-guide.md`}>instructor-guide.md</MarkdownLink></div></div>
          <div className="card artifact card--lift"><span className="tag">NOTEBOOKLM</span><div><h3>Companion de repaso</h3><p className="artifact-desc">Podcast, slides, flashcards y quiz de arquitectura.</p><MarkdownLink staticPath={`${BASE}/notebooklm/podcast-prompt.md`}>podcast</MarkdownLink>{' · '}<MarkdownLink staticPath={`${BASE}/notebooklm/presentation-prompt.md`}>slides</MarkdownLink>{' · '}<MarkdownLink staticPath={`${BASE}/notebooklm/flashcards-prompt.md`}>flashcards</MarkdownLink>{' · '}<MarkdownLink staticPath={`${BASE}/notebooklm/quiz-prompt.md`}>quiz</MarkdownLink></div></div>
        </div>
      </ClassArtifactsSection>

      <section className="section container" id="dod" aria-labelledby="dod-title">
        <Reveal>
          <h2 className="stitle" id="dod-title">Definition of Done</h2>
          <p className="lede section-intro">Si no puedes decir qué dato jamás sale y qué permiso activa el fallback, la arquitectura no está lista.</p>
          <DodLiveRegion message={feedback} />
          <ul className="dod">
            {CLASS10.dodItems.map((item) => <li key={item.id}><label><input type="checkbox" checked={!!state[item.id]} onChange={(e) => toggle(item.id, e.target.checked)} /><span>{item.label}</span></label></li>)}
          </ul>
          <div className="block example dod-next"><div className="block-title">Siguiente parada</div><div className="block-body"><Link to="/curriculum">Vuelve al currículo y prepara el Capstone: combina inferencia, RAG, voz y delegación. →</Link></div></div>
        </Reveal>
      </section>

      <div className="container class-back"><Link to="/curriculum">← Currículo completo</Link></div>
    </>
  )
}
