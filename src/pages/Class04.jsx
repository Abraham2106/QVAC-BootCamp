import { Link } from 'react-router-dom'
import DodLiveRegion from '../components/DodLiveRegion'
import ClassArtifactsSection from '../components/ClassArtifactsSection'
import ClassLessonLinks from '../components/ClassLessonLinks'
import FeatureCard from '../components/FeatureCard'
import MarkdownLink from '../components/MarkdownLink'
import ProgressDisplay from '../components/ProgressDisplay'
import Reveal from '../components/Reveal'
import SlidesEmbed from '../components/SlidesEmbed'
import { CLASS04 } from '../data/curriculum'
import { useRememberVisit } from '../hooks/useProgress'
import { useProgressWithFeedback } from '../hooks/useProgressWithFeedback'

const BASE = '/class-04-build-offline-chat'

const ANCHORS = [
  { id: 'slides', label: 'Slides' },
  { id: 'leccion', label: 'Lección' },
  { id: 'lab', label: 'Lab' },
  { id: 'artefactos', label: 'Artefactos' },
  { id: 'dod', label: 'Definition of Done' },
]

export default function Class04() {
  const { state, toggle, pct, feedback } = useProgressWithFeedback(
    CLASS04.id,
    CLASS04.dodItems.length,
  )

  useRememberVisit()

  return (
    <>
      <section className="class-hero container">
        <Reveal>
          <span className="kicker">{CLASS04.kicker}</span>
          <h1>{CLASS04.title}</h1>
          <p className="eq">&ldquo;{CLASS04.eq}&rdquo;</p>
          <div className="class-hero__progress">
            <ProgressDisplay pct={pct} size={58} label="Progreso Clase 4" />
            <p>
              Tu progreso se guarda en este navegador (localStorage). Marca tu avance en la checklist Definition
              of Done al final.
            </p>
          </div>
          <nav className="anchor-tabs" aria-label="Secciones de la clase">
            {ANCHORS.map((a) => (
              <a key={a.id} href={'#' + a.id}>
                {a.label}
              </a>
            ))}
          </nav>
        </Reveal>
      </section>

      <section className="section container" id="slides" aria-labelledby="slides-title">
        <Reveal>
          <h2 className="stitle" id="slides-title">
            Presentación de la clase
          </h2>
          <p className="lede section-intro">
            25 diapositivas · tres ciclos de vida · commit boundary · cancel · persist · restart offline.
            Complementarias a la lección — expande para navegar con ← → o pantalla completa.
          </p>
          <SlidesEmbed
            src={`${BASE}/slides.html`}
            title="Slides de la Clase 4: Build the Offline Chat"
            previewLabel="De script a conversación"
            hint={25}
          />
        </Reveal>
      </section>

      <section className="section container" id="leccion" aria-labelledby="leccion-title">
        <Reveal>
          <h2 className="stitle" id="leccion-title">
            Lección canónica
          </h2>
          <p className="lede section-intro">
            Tres ciclos de vida, ownership de estado, frontera de commit, cancelación, persistencia JSON y
            verificación offline — legible sin las diapositivas.
          </p>
          <ClassLessonLinks base={BASE} classIndex={4} />
          <div className="grid grid--3">
            {CLASS04.outcomes.map((o) => (
              <FeatureCard key={o.tag} tag={o.tag} title={o.title} body={o.body} />
            ))}
          </div>
        </Reveal>
      </section>

      <section className="section container" id="lab" aria-labelledby="lab-title">
        <Reveal>
          <h2 className="stitle" id="lab-title">
            Lab guiado — Offline Chat Application Lab
          </h2>
          <p className="lede section-intro">
            ~75–90 min. CLI TypeScript modular: historial multi-turno, streaming con commit boundary,
            cancelación, persistencia local, restart y prueba modo avión.
          </p>
          <div className="artifact card card--lift">
            <span className="tag">LAB</span>
            <div>
              <h3>Siete partes · app modular en app/src/</h3>
              <ul>
                <li>
                  <MarkdownLink staticPath={`${BASE}/lab/README.md`}>lab/README.md</MarkdownLink> — guía con
                  acceptance tests A–G
                </li>
                <li>
                  <a href={`${BASE}/app/src/index.ts`}>app/src/index.ts</a> — entry + chat loop con TODO en
                  módulos
                </li>
                <li>
                  Corre <a href={`${BASE}/examples/01-single-turn.ts`}>examples/01–06</a> antes de completar la
                  app
                </li>
              </ul>
            </div>
          </div>
        </Reveal>
      </section>

      <ClassArtifactsSection>
          <div className="grid grid--2">
            <div className="card artifact card--lift">
              <span className="tag">EXAMPLES</span>
              <div>
                <h3>Seis ejemplos incrementales</h3>
                <ul>
                  <li>
                    <a href={`${BASE}/examples/01-single-turn.ts`}>01-single-turn.ts</a> — completion aislada
                  </li>
                  <li>
                    <a href={`${BASE}/examples/02-multi-turn.ts`}>02-multi-turn.ts</a> — history explícita
                  </li>
                  <li>
                    <a href={`${BASE}/examples/03-streaming.ts`}>03-streaming.ts</a> — buffer provisional
                  </li>
                  <li>
                    <a href={`${BASE}/examples/04-cancellation.ts`}>04-cancellation.ts</a> — requestId + cancel
                  </li>
                  <li>
                    <a href={`${BASE}/examples/05-persistence.ts`}>05-persistence.ts</a> — JSON local
                  </li>
                  <li>
                    <a href={`${BASE}/examples/06-restart-offline.ts`}>06-restart-offline.ts</a> — restart sin red
                  </li>
                </ul>
              </div>
            </div>
            <div className="card artifact card--lift">
              <span className="tag">CHALLENGE</span>
              <div>
                <h3>Offline Chat v1</h3>
                <p className="artifact-desc">
                  CLI local desde requisitos: multi-turn, streaming, cancel, persist, metrics, shutdown y
                  airplane-mode restart. Sin starter paso a paso.
                </p>
                <p>
                  <MarkdownLink staticPath={`${BASE}/challenge/challenge.md`}>challenge/challenge.md</MarkdownLink>
                  {' · '}
                  <MarkdownLink staticPath={`${BASE}/solution/solution.md`}>solution/solution.md</MarkdownLink>{' '}
                  (instructor)
                </p>
              </div>
            </div>
            <div className="card artifact card--lift">
              <span className="tag">ASSESSMENT</span>
              <div>
                <h3>Checkpoint + rubric</h3>
                <p className="artifact-desc">
                  7 preguntas (lifecycles, commit boundary, cancel vs error) y rúbrica 8 criterios ligada a
                  acceptance tests.
                </p>
                <p>
                  <MarkdownLink staticPath={`${BASE}/assessment/checkpoint.md`}>assessment/checkpoint.md</MarkdownLink>
                  {' · '}
                  <MarkdownLink staticPath={`${BASE}/assessment/rubric.md`}>assessment/rubric.md</MarkdownLink>
                </p>
              </div>
            </div>
            <div className="card artifact card--lift">
              <span className="tag">INSTRUCTOR</span>
              <div>
                <h3>Guía + NotebookLM</h3>
                <p className="artifact-desc">
                  Timing 180 min, demos incrementales, Break It de persistencia parcial, y prompts de repaso con
                  escenario de cancelación.
                </p>
                <p>
                  <MarkdownLink staticPath={`${BASE}/instructor/instructor-guide.md`}>
                    instructor/instructor-guide.md
                  </MarkdownLink>
                  {' · '}
                  <MarkdownLink staticPath={`${BASE}/notebooklm/podcast-prompt.md`}>notebooklm/</MarkdownLink>
                </p>
              </div>
            </div>
          </div>
      </ClassArtifactsSection>

      <section className="section container" id="dod" aria-labelledby="dod-title">
        <Reveal>
          <h2 className="stitle" id="dod-title">
            Definition of Done
          </h2>
          <p className="lede section-intro">Marca cada evidencia cuando la tengas. Se guarda en este navegador.</p>
          <DodLiveRegion message={feedback} />
          <ul className="dod">
            {CLASS04.dodItems.map((item) => (
              <li key={item.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={!!state[item.id]}
                    onChange={(e) => toggle(item.id, e.target.checked)}
                  />
                  <span>{item.label}</span>
                </label>
              </li>
            ))}
          </ul>
          <div className="block example dod-next">
            <div className="block-title">Siguiente parada</div>
            <div className="block-body">
              <Link to="/curriculum">
                Clase 5 — Embeddings: Meaning as Geometry: significado como geometría fuera de los pesos del
                modelo. →
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <div className="container class-back">
        <Link to="/curriculum">← Currículo completo</Link>
      </div>
    </>
  )
}
