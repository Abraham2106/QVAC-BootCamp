import { Link } from 'react-router-dom'
import DodLiveRegion from '../components/DodLiveRegion'
import ClassArtifactsSection from '../components/ClassArtifactsSection'
import ClassLessonLinks from '../components/ClassLessonLinks'
import FeatureCard from '../components/FeatureCard'
import MarkdownLink from '../components/MarkdownLink'
import ProgressDisplay from '../components/ProgressDisplay'
import Reveal from '../components/Reveal'
import SlidesEmbed from '../components/SlidesEmbed'
import { CLASS06 } from '../data/curriculum'
import { useRememberVisit } from '../hooks/useProgress'
import { useProgressWithFeedback } from '../hooks/useProgressWithFeedback'

const BASE = '/class-06-local-rag-private-knowledge'

const ANCHORS = [
  { id: 'slides', label: 'Slides' },
  { id: 'leccion', label: 'Lección' },
  { id: 'lab', label: 'Lab' },
  { id: 'artefactos', label: 'Artefactos' },
  { id: 'dod', label: 'Definition of Done' },
]

export default function Class06() {
  const { state, toggle, pct, feedback } = useProgressWithFeedback(CLASS06.id, CLASS06.dodItems.length)
  useRememberVisit()

  return (
    <>
      <section className="class-hero container">
        <Reveal>
          <span className="kicker">{CLASS06.kicker}</span>
          <h1>{CLASS06.title}</h1>
          <p className="eq">&ldquo;{CLASS06.eq}&rdquo;</p>
          <div className="class-hero__progress">
            <ProgressDisplay pct={pct} size={58} label="Progreso Clase 6" />
            <p>La checklist exige evidencia visible de retrieval, grounding, provenance y diagnóstico por etapas.</p>
          </div>
          <nav className="anchor-tabs" aria-label="Secciones de la clase">
            {ANCHORS.map((a) => <a key={a.id} href={'#' + a.id}>{a.label}</a>)}
          </nav>
        </Reveal>
      </section>

      <section className="section container" id="slides" aria-labelledby="slides-title">
        <Reveal>
          <h2 className="stitle" id="slides-title">Presentación de la clase</h2>
          <p className="lede section-intro">Document → chunk → embed → store → retrieve → evidence → grounded completion. Retrieval y generation quedan separados para poder depurar.</p>
          <SlidesEmbed src={`${BASE}/slides.html`} title="Slides de la Clase 6: Local RAG" previewLabel="Private Knowledge" hint={17} />
        </Reveal>
      </section>

      <section className="section container" id="leccion" aria-labelledby="leccion-title">
        <Reveal>
          <h2 className="stitle" id="leccion-title">Lección canónica</h2>
          <p className="lede section-intro">Managed RAG, chunking, Top-K, grounding, provenance, unknown knowledge y diagnosis retrieval vs generation.</p>
          <ClassLessonLinks base={BASE} classIndex={6} />
          <div className="grid grid--3">
            {CLASS06.outcomes.map((o) => <FeatureCard key={o.tag} tag={o.tag} title={o.title} body={o.body} />)}
          </div>
        </Reveal>
      </section>

      <section className="section container" id="lab" aria-labelledby="lab-title">
        <Reveal>
          <h2 className="stitle" id="lab-title">Lab guiado — Transparent Local RAG Debugger</h2>
          <p className="lede section-intro">90 min. Ingesta un corpus, inspecciona Top-K antes del LLM, genera con evidencia, prueba unknown knowledge y rompe retrieval de forma controlada.</p>
          <div className="artifact card card--lift">
            <span className="tag">LAB</span>
            <div>
              <h3>Retrieval first, generation second</h3>
              <ul>
                <li><MarkdownLink staticPath={`${BASE}/lab/README.md`}>lab/README.md</MarkdownLink> — debugger por etapas</li>
                <li><a href={`${BASE}/examples/01-managed-retrieval.ts`}>01-managed-retrieval.ts</a> — workspace + Top-K</li>
                <li><a href={`${BASE}/examples/02-grounded-rag.ts`}>02-grounded-rag.ts</a> — evidence → completion</li>
                <li><a href={`${BASE}/examples/03-chunking.ts`}>03-chunking.ts</a> — compara unidades recuperables</li>
              </ul>
            </div>
          </div>
        </Reveal>
      </section>

      <ClassArtifactsSection>
        <div className="grid grid--2">
          <div className="card artifact card--lift"><span className="tag">CHALLENGE</span><div><h3>Private Notebook Assistant v1</h3><p className="artifact-desc">Corpus privado, evidence visible, provenance real, unknown knowledge, failure controlado y timings separados.</p><MarkdownLink staticPath={`${BASE}/challenge/challenge.md`}>challenge/challenge.md</MarkdownLink>{' · '}<MarkdownLink staticPath={`${BASE}/solution/solution.md`}>solution/solution.md</MarkdownLink></div></div>
          <div className="card artifact card--lift"><span className="tag">ASSESSMENT</span><div><h3>Checkpoint + rubric</h3><p className="artifact-desc">Evalúa pipeline, chunking, grounding, provenance y atribución correcta del fallo.</p><MarkdownLink staticPath={`${BASE}/assessment/checkpoint.md`}>checkpoint.md</MarkdownLink>{' · '}<MarkdownLink staticPath={`${BASE}/assessment/rubric.md`}>rubric.md</MarkdownLink></div></div>
          <div className="card artifact card--lift"><span className="tag">INSTRUCTOR</span><div><h3>Guía docente</h3><p className="artifact-desc">Regla central: nunca mostrar la respuesta antes de mostrar retrieval.</p><MarkdownLink staticPath={`${BASE}/instructor/instructor-guide.md`}>instructor-guide.md</MarkdownLink></div></div>
          <div className="card artifact card--lift"><span className="tag">NOTEBOOKLM</span><div><h3>Companion de repaso</h3><p className="artifact-desc">Podcast, presentación, flashcards y quiz centrados en diagnosis del pipeline.</p><MarkdownLink staticPath={`${BASE}/notebooklm/podcast-prompt.md`}>podcast</MarkdownLink>{' · '}<MarkdownLink staticPath={`${BASE}/notebooklm/presentation-prompt.md`}>slides</MarkdownLink>{' · '}<MarkdownLink staticPath={`${BASE}/notebooklm/flashcards-prompt.md`}>flashcards</MarkdownLink>{' · '}<MarkdownLink staticPath={`${BASE}/notebooklm/quiz-prompt.md`}>quiz</MarkdownLink></div></div>
        </div>
      </ClassArtifactsSection>

      <section className="section container" id="dod" aria-labelledby="dod-title">
        <Reveal>
          <h2 className="stitle" id="dod-title">Definition of Done</h2>
          <p className="lede section-intro">Completa la evidencia y defiende qué etapa produjo cada resultado.</p>
          <DodLiveRegion message={feedback} />
          <ul className="dod">
            {CLASS06.dodItems.map((item) => <li key={item.id}><label><input type="checkbox" checked={!!state[item.id]} onChange={(e) => toggle(item.id, e.target.checked)} /><span>{item.label}</span></label></li>)}
          </ul>
          <div className="block example dod-next"><div className="block-title">Siguiente parada</div><div className="block-body"><Link to="/curriculum">Clase 7 — Speech Systems: ASR and TTS. El pipeline deja de recibir solamente texto. →</Link></div></div>
        </Reveal>
      </section>

      <div className="container class-back"><Link to="/curriculum">← Currículo completo</Link></div>
    </>
  )
}
