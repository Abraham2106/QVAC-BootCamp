import { Link } from 'react-router-dom'
import DodLiveRegion from '../components/DodLiveRegion'
import ClassArtifactsSection from '../components/ClassArtifactsSection'
import ClassLessonLinks from '../components/ClassLessonLinks'
import FeatureCard from '../components/FeatureCard'
import MarkdownLink from '../components/MarkdownLink'
import ProgressDisplay from '../components/ProgressDisplay'
import Reveal from '../components/Reveal'
import { CLASS05 } from '../data/curriculum'
import { useRememberVisit } from '../hooks/useProgress'
import { useProgressWithFeedback } from '../hooks/useProgressWithFeedback'

const BASE = '/class-05-embeddings-meaning-as-geometry'

const ANCHORS = [
  { id: 'leccion', label: 'Lección' },
  { id: 'lab', label: 'Lab' },
  { id: 'artefactos', label: 'Artefactos' },
  { id: 'dod', label: 'Definition of Done' },
]

export default function Class05() {
  const { state, toggle, pct, feedback } = useProgressWithFeedback(CLASS05.id, CLASS05.dodItems.length)
  useRememberVisit()

  return (
    <>
      <section className="class-hero container">
        <Reveal>
          <span className="kicker">{CLASS05.kicker}</span>
          <h1>{CLASS05.title}</h1>
          <p className="eq">&ldquo;{CLASS05.eq}&rdquo;</p>
          <div className="class-hero__progress">
            <ProgressDisplay pct={pct} size={58} label="Progreso Clase 5" />
            <p>Tu progreso se guarda en este navegador. La checklist exige evidencia de ranking, medición y diagnóstico.</p>
          </div>
          <nav className="anchor-tabs" aria-label="Secciones de la clase">
            {ANCHORS.map((a) => <a key={a.id} href={'#' + a.id}>{a.label}</a>)}
          </nav>
        </Reveal>
      </section>

      <section className="section container" id="leccion" aria-labelledby="leccion-title">
        <Reveal>
          <h2 className="stitle" id="leccion-title">Lección canónica</h2>
          <p className="lede section-intro">Embeddings vs generación, similarity en aplicación, Top-K, medición y límites del score.</p>
          <ClassLessonLinks base={BASE} classIndex={5} />
          <div className="grid grid--3">
            {CLASS05.outcomes.map((o) => <FeatureCard key={o.tag} tag={o.tag} title={o.title} body={o.body} />)}
          </div>
        </Reveal>
      </section>

      <section className="section container" id="lab" aria-labelledby="lab-title">
        <Reveal>
          <h2 className="stitle" id="lab-title">Lab guiado — Semantic Search Explorer</h2>
          <p className="lede section-intro">75–90 min. Corpus pequeño, embeddings batch, query embedding, cosine similarity, ranking Top-K y un caso ambiguo.</p>
          <div className="artifact card card--lift">
            <span className="tag">LAB</span>
            <div>
              <h3>Prediction → Ranking → Diagnosis</h3>
              <ul>
                <li><MarkdownLink staticPath={`${BASE}/lab/README.md`}>lab/README.md</MarkdownLink> — guía del experimento</li>
                <li><a href={`${BASE}/examples/01-embed.ts`}>01-embed.ts</a> — single/batch embeddings</li>
                <li><a href={`${BASE}/examples/02-semantic-search.ts`}>02-semantic-search.ts</a> — ranking visible</li>
              </ul>
            </div>
          </div>
        </Reveal>
      </section>

      <ClassArtifactsSection>
        <div className="grid grid--2">
          <div className="card artifact card--lift"><span className="tag">CHALLENGE</span><div><h3>Semantic Search v1</h3><p className="artifact-desc">15–30 textos, query CLI, Top-K, scores, latencia y explicación de ambigüedad.</p><MarkdownLink staticPath={`${BASE}/challenge/challenge.md`}>challenge/challenge.md</MarkdownLink>{' · '}<MarkdownLink staticPath={`${BASE}/solution/solution.md`}>solution/solution.md</MarkdownLink></div></div>
          <div className="card artifact card--lift"><span className="tag">ASSESSMENT</span><div><h3>Checkpoint + rubric</h3><p className="artifact-desc">Evalúa representación, ranking, medición, diagnosis y límites del score.</p><MarkdownLink staticPath={`${BASE}/assessment/checkpoint.md`}>checkpoint.md</MarkdownLink>{' · '}<MarkdownLink staticPath={`${BASE}/assessment/rubric.md`}>rubric.md</MarkdownLink></div></div>
          <div className="card artifact card--lift"><span className="tag">INSTRUCTOR</span><div><h3>Guía docente</h3><p className="artifact-desc">Timing, predicciones, misconceptions y bridge limpio hacia RAG.</p><MarkdownLink staticPath={`${BASE}/instructor/instructor-guide.md`}>instructor-guide.md</MarkdownLink></div></div>
          <div className="card artifact card--lift"><span className="tag">NOTEBOOKLM</span><div><h3>Companion de repaso</h3><p className="artifact-desc">Deep Dive, slide deck, flashcards y quiz orientados a causalidad y debugging.</p><MarkdownLink staticPath={`${BASE}/notebooklm/podcast-prompt.md`}>podcast</MarkdownLink>{' · '}<MarkdownLink staticPath={`${BASE}/notebooklm/presentation-prompt.md`}>slides</MarkdownLink>{' · '}<MarkdownLink staticPath={`${BASE}/notebooklm/flashcards-prompt.md`}>flashcards</MarkdownLink>{' · '}<MarkdownLink staticPath={`${BASE}/notebooklm/quiz-prompt.md`}>quiz</MarkdownLink></div></div>
        </div>
      </ClassArtifactsSection>

      <section className="section container" id="dod" aria-labelledby="dod-title">
        <Reveal>
          <h2 className="stitle" id="dod-title">Definition of Done</h2>
          <p className="lede section-intro">Marca cada evidencia cuando puedas defenderla.</p>
          <DodLiveRegion message={feedback} />
          <ul className="dod">
            {CLASS05.dodItems.map((item) => <li key={item.id}><label><input type="checkbox" checked={!!state[item.id]} onChange={(e) => toggle(item.id, e.target.checked)} /><span>{item.label}</span></label></li>)}
          </ul>
          <div className="block example dod-next"><div className="block-title">Siguiente parada</div><div className="block-body"><Link to="/curriculum">Clase 6 — Local RAG and Private Knowledge: de ranking semántico a conocimiento persistente y grounded. →</Link></div></div>
        </Reveal>
      </section>

      <div className="container class-back"><Link to="/curriculum">← Currículo completo</Link></div>
    </>
  )
}
