import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import FeatureCard from '../components/FeatureCard'
import LinkButton from '../components/LinkButton'
import MarkdownLink from '../components/MarkdownLink'
import ProgressDisplay from '../components/ProgressDisplay'
import Reveal from '../components/Reveal'
import SlidesEmbed from '../components/SlidesEmbed'
import { markdownRoute } from '../lib/markdown'
import { CLASS03 } from '../data/curriculum'
import { rememberVisit, useProgress } from '../hooks/useProgress'

const BASE = '/class-03-local-inference-fundamentals'

const ANCHORS = [
  { id: 'slides', label: 'Slides' },
  { id: 'leccion', label: 'Lección' },
  { id: 'lab', label: 'Lab' },
  { id: 'artefactos', label: 'Artefactos' },
  { id: 'dod', label: 'Definition of Done' },
]

export default function Class03() {
  const { state, toggle, pct } = useProgress(CLASS03.id)

  useEffect(() => {
    rememberVisit(window.location.pathname)
  }, [])

  return (
    <>
      <section className="class-hero container">
        <Reveal>
          <span className="kicker">{CLASS03.kicker}</span>
          <h1>{CLASS03.title}</h1>
          <p className="eq">&ldquo;{CLASS03.eq}&rdquo;</p>
          <div className="class-hero__progress">
            <ProgressDisplay pct={pct} size={58} label="Progreso Clase 3" />
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
            24 diapositivas · tokens → bucle autoregresivo → streaming events/final → sampling → contexto → KV
            cache → profiler → Break It/Measure It. Expande la card para navegar con ← → o ábrela a pantalla completa.
          </p>
          <SlidesEmbed
            src={`${BASE}/slides.html`}
            title="Slides de la Clase 3: Local Inference Fundamentals"
            previewLabel="Local Inference Fundamentals"
            hint={24}
          />
        </Reveal>
      </section>

      <section className="section container" id="leccion" aria-labelledby="leccion-title">
        <Reveal>
          <h2 className="stitle" id="leccion-title">
            Lección canónica
          </h2>
          <p className="lede section-intro">
            Mecánica observable de inferencia: tokenización, prefill vs decode, sampling, contexto, KV cache,
            TTFT vs throughput — legible sin las diapositivas.
          </p>
          <div className="cta-row">
            <LinkButton href="/lessons/class-03.html">Leer la lección →</LinkButton>
            <LinkButton to={markdownRoute(`${BASE}/lesson.md`)}>Leer Markdown →</LinkButton>
            <LinkButton href={`${BASE}/lesson.md`} variant="ghost">
              Ver Markdown fuente
            </LinkButton>
          </div>
          <div className="grid grid--3">
            {CLASS03.outcomes.map((o) => (
              <FeatureCard key={o.tag} tag={o.tag} title={o.title} body={o.body} />
            ))}
          </div>
        </Reveal>
      </section>

      <section className="section container" id="lab" aria-labelledby="lab-title">
        <Reveal>
          <h2 className="stitle" id="lab-title">
            Lab guiado — Inference Benchmark Lab
          </h2>
          <p className="lede section-intro">
            ~60–75 min. TypeScript CLI: streaming con events/final, experimentos de sampling y contexto, KV cache
            on/off, profiler y Break It con stopReason documentado.
          </p>
          <div className="artifact card card--lift">
            <span className="tag">LAB</span>
            <div>
              <h3>Ocho partes · predicción antes de cada experimento</h3>
              <ul>
                <li>
                  <MarkdownLink staticPath={`${BASE}/lab/README.md`}>lab/README.md</MarkdownLink> — guía con tablas
                  predicción vs observación
                </li>
                <li>
                  <a href={`${BASE}/lab/starter/inference-lab-starter.ts`}>
                    lab/starter/inference-lab-starter.ts
                  </a>{' '}
                  — 6 TODO + auto-verificación ✔
                </li>
                <li>Corre examples/01–05 antes de modificar el starter</li>
              </ul>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="section container" id="artefactos" aria-labelledby="art-title">
        <Reveal>
          <h2 className="stitle" id="art-title">
            Artefactos de la clase
          </h2>
          <div className="grid grid--2">
            <div className="card artifact card--lift">
              <span className="tag">EXAMPLES</span>
              <div>
                <h3>Cinco ejemplos ejecutables</h3>
                <ul>
                  <li>
                    <a href={`${BASE}/examples/01-streaming-events.ts`}>01-streaming-events.ts</a> — events/final
                    + TTFT
                  </li>
                  <li>
                    <a href={`${BASE}/examples/02-sampling-experiment.ts`}>02-sampling-experiment.ts</a> — temp
                    controlado
                  </li>
                  <li>
                    <a href={`${BASE}/examples/03-context-experiment.ts`}>03-context-experiment.ts</a> — history
                    corta vs larga
                  </li>
                  <li>
                    <a href={`${BASE}/examples/04-kv-cache.ts`}>04-kv-cache.ts</a> — follow-up con/sin cache
                  </li>
                  <li>
                    <a href={`${BASE}/examples/05-profiler.ts`}>05-profiler.ts</a> — profiler + completion
                  </li>
                </ul>
              </div>
            </div>
            <div className="card artifact card--lift">
              <span className="tag">CHALLENGE</span>
              <div>
                <h3>Design a Responsive Local Generation Configuration</h3>
                <p className="artifact-desc">
                  Un modelo cargado, usuarios que dicen &ldquo;se siente lento&rdquo;: mide TTFT/tok/s, cambia UNA
                  variable, defiende la configuración. Sin starter.
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
                  8 preguntas (TTFT vs tok/s, KV cache, stopReason) y rúbrica 8 criterios ligada a evidencia
                  observable.
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
                  Timing 180 min, demos de streaming/sampling/cache, puntos de predicción del instructor, y 4
                  prompts de repaso.
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
        </Reveal>
      </section>

      <section className="section container" id="dod" aria-labelledby="dod-title">
        <Reveal>
          <h2 className="stitle" id="dod-title">
            Definition of Done
          </h2>
          <p className="lede section-intro">Marca cada evidencia cuando la tengas. Se guarda en este navegador.</p>
          <ul className="dod">
            {CLASS03.dodItems.map((item) => (
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
              <Link to="/class/04">
                Clase 4 — Build the Offline Chat: de inferencia aislada a aplicación confiable con historial,
                streaming y persistencia. →
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
