import { Link } from 'react-router-dom'
import DodLiveRegion from '../components/DodLiveRegion'
import ClassArtifactsSection from '../components/ClassArtifactsSection'
import FeatureCard from '../components/FeatureCard'
import ClassLessonLinks from '../components/ClassLessonLinks'
import MarkdownLink from '../components/MarkdownLink'
import ProgressDisplay from '../components/ProgressDisplay'
import Reveal from '../components/Reveal'
import SlidesEmbed from '../components/SlidesEmbed'
import { CLASS02 } from '../data/curriculum'
import { useRememberVisit } from '../hooks/useProgress'
import { useProgressWithFeedback } from '../hooks/useProgressWithFeedback'

const BASE = '/class-02-models-gguf-lifecycle'

const ANCHORS = [
  { id: 'slides', label: 'Slides' },
  { id: 'leccion', label: 'Lección' },
  { id: 'lab', label: 'Lab' },
  { id: 'artefactos', label: 'Artefactos' },
  { id: 'dod', label: 'Definition of Done' },
]

export default function Class02() {
  const { state, toggle, pct, feedback } = useProgressWithFeedback(
    CLASS02.id,
    CLASS02.dodItems.length,
  )

  useRememberVisit()

  return (
    <>
      <section className="class-hero container">
        <Reveal>
          <span className="kicker">{CLASS02.kicker}</span>
          <h1>{CLASS02.title}</h1>
          <p className="eq">&ldquo;{CLASS02.eq}&rdquo;</p>
          <div className="class-hero__progress">
            <ProgressDisplay pct={pct} size={58} label="Progreso Clase 2" />
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
            26 diapositivas · anatomía → GGUF → cuantización → nombres → catálogo y ciclo de vida → Predict/Demo
            → Break It/Measure It. Expande la card para navegar con ← → o ábrela a pantalla completa.
          </p>
          <SlidesEmbed
            src="/class-02-models-gguf-lifecycle/slides.html"
            title="Slides de la Clase 2: Models, GGUF and the QVAC Lifecycle"
            previewLabel="Models, GGUF and the QVAC Lifecycle"
            hint={26}
          />
        </Reveal>
      </section>

      <section className="section container" id="leccion" aria-labelledby="leccion-title">
        <Reveal>
          <h2 className="stitle" id="leccion-title">
            Lección canónica
          </h2>
          <p className="lede section-intro">
            Anatomía del modelo, GGUF vs checkpoint, cuantización, lectura de nombres, matriz de decisión y el
            ciclo de vida completo — legible sin las diapositivas.
          </p>
          <ClassLessonLinks base={BASE} classIndex={2} />
          <div className="grid grid--3">
            {CLASS02.outcomes.map((o) => (
              <FeatureCard key={o.tag} tag={o.tag} title={o.title} body={o.body} />
            ))}
          </div>
        </Reveal>
      </section>

      <section className="section container" id="lab" aria-labelledby="lab-title">
        <Reveal>
          <h2 className="stitle" id="lab-title">
            Lab guiado — Model Explorer
          </h2>
          <p className="lede section-intro">
            ~60–75 min. CLI TypeScript: lista el catálogo, reporta metadata/caché, mide carga, genera determinista
            (temp 0 · seed 42), descarga y compara dos variantes.
          </p>
          <div className="artifact card card--lift">
            <span className="tag">LAB</span>
            <div>
              <h3>Ocho partes + regla de seguridad: unloadModel ENTRE intentos de Break It</h3>
              <ul>
                <li>
                  <MarkdownLink staticPath={`${BASE}/lab/README.md`}>lab/README.md</MarkdownLink> — guía con tabla
                  frío/tibio + memoria
                </li>
                <li>
                  <a href={`${BASE}/lab/starter/model-explorer-starter.ts`}>
                    lab/starter/model-explorer-starter.ts
                  </a>{' '}
                  — 6 TODO + auto-verificación ✔
                </li>
                <li>Predicciones escritas ANTES de ejecutar (Parte 3)</li>
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
                <h3>Ejemplos ejecutables mínimos</h3>
                <ul>
                  <li>
                    <a href={`${BASE}/examples/01-registry-explorer.ts`}>01-registry-explorer.ts</a> — catálogo
                    + caché + recursos
                  </li>
                  <li>
                    <a href={`${BASE}/examples/02-compare-models.ts`}>02-compare-models.ts</a> — comparación
                    determinista de 2 modelos
                  </li>
                  <li>
                    <a href={`${BASE}/examples/03-memory-report.ts`}>03-memory-report.ts</a> — ¿qué cabe en tu
                    máquina?
                  </li>
                </ul>
              </div>
            </div>
            <div className="card artifact card--lift">
              <span className="tag">CHALLENGE</span>
              <div>
                <h3>Model Selection Report</h3>
                <p className="artifact-desc">
                  Tres contextos (kiosco 4 GB · consultor 16 GB · tu máquina), matriz de decisión y defensa. Sin
                  starter.
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
                  8 preguntas (12.5% recall) y rúbrica 6 criterios ligada a evidencia observable.
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
                  Timing 180 min, guion de demo, regla de seguridad del Break It, y 4 prompts de repaso con fuentes
                  enfocadas.
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
            {CLASS02.dodItems.map((item) => (
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
              <Link to="/class/03">
                Clase 3 — Local Inference Fundamentals: qué ocurre DENTRO de la generación, token a token. Hoy
                elegiste la máquina; mañana abrimos el motor. →
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
