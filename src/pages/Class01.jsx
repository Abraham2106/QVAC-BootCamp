import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import FeatureCard from '../components/FeatureCard'
import LinkButton from '../components/LinkButton'
import MarkdownLink from '../components/MarkdownLink'
import ProgressDisplay from '../components/ProgressDisplay'
import Reveal from '../components/Reveal'
import SlidesEmbed from '../components/SlidesEmbed'
import { markdownRoute } from '../lib/markdown'
import { CLASS01 } from '../data/curriculum'
import { rememberVisit, useProgress } from '../hooks/useProgress'

const BASE = '/class-01-airplane-mode-intelligence'

const ANCHORS = [
  { id: 'slides', label: 'Slides' },
  { id: 'leccion', label: 'Lección' },
  { id: 'lab', label: 'Lab' },
  { id: 'artefactos', label: 'Artefactos' },
  { id: 'dod', label: 'Definition of Done' },
]

export default function Class01() {
  const { state, toggle, pct } = useProgress(CLASS01.id)

  useEffect(() => {
    rememberVisit(window.location.pathname)
  }, [])

  return (
    <>
      <section className="class-hero container">
        <Reveal>
          <span className="kicker">{CLASS01.kicker}</span>
          <h1>{CLASS01.title}</h1>
          <p className="eq">&ldquo;{CLASS01.eq}&rdquo;</p>
          <div className="class-hero__progress">
            <ProgressDisplay pct={pct} size={58} label="Progreso Clase 1" />
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
            25 diapositivas · narrativa Predict → Demo → Break It → Measure It. Expande la card para navegar con ← →
            o ábrela a pantalla completa.
          </p>
          <SlidesEmbed
            src={`${BASE}/slides.html`}
            title="Slides de la Clase 1: Airplane-Mode Intelligence"
            previewLabel="Airplane-Mode Intelligence"
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
            El artefacto más profundo: concepto, modelo mental, Inside QVAC, Under the Hood, misconcepciones y
            checkpoint — legible sin las diapositivas.
          </p>
          <div className="cta-row">
            <LinkButton href="/lessons/class-01.html">Leer la lección →</LinkButton>
            <LinkButton to={markdownRoute(`${BASE}/lesson.md`)}>Leer Markdown →</LinkButton>
            <LinkButton href={`${BASE}/lesson.md`} variant="ghost">
              Ver Markdown fuente
            </LinkButton>
          </div>
          <div className="grid grid--3">
            {CLASS01.outcomes.map((o) => (
              <FeatureCard key={o.tag} tag={o.tag} title={o.title} body={o.body} />
            ))}
          </div>
        </Reveal>
      </section>

      <section className="section container" id="lab" aria-labelledby="lab-title">
        <Reveal>
          <h2 className="stitle" id="lab-title">
            Lab guiado — Airplane-Mode Proof
          </h2>
          <p className="lede section-intro">
            ~60–75 min. CLI TypeScript real (no Jupyter): es una aplicación con ciclo de vida completo, no un
            experimento iterativo.
          </p>
          <div className="artifact card card--lift">
            <span className="tag">LAB</span>
            <div>
              <h3>Ocho partes: Worked Example → Modify → Predict → Run → Break It → Diagnose → Measure → Extension</h3>
              <ul>
                <li>
                  <MarkdownLink staticPath={`${BASE}/lab/README.md`}>lab/README.md</MarkdownLink> — guía paso a paso
                  con tabla de métricas frío/tibio
                </li>
                <li>
                  <a href={`${BASE}/lab/starter/airplane-mode-starter.ts`}>
                    lab/starter/airplane-mode-starter.ts
                  </a>{' '}
                  — esqueleto con 5 TODO y auto-verificación ✔
                </li>
                <li>Predicciones escritas ANTES de ejecutar (Parte 3) — no negociable</li>
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
                <h3>Ejemplos ejecutables mínimos</h3>
                <ul>
                  <li>
                    <a href={`${BASE}/examples/01-provision.ts`}>01-provision.ts</a> —
                    descarga con progreso (fase RED)
                  </li>
                  <li>
                    <a href={`${BASE}/examples/02-offline-inference.ts`}>
                      02-offline-inference.ts
                    </a>{' '}
                    — inferencia offline desde caché
                  </li>
                  <li>
                    <a href={`${BASE}/examples/03-measure.ts`}>03-measure.ts</a> —
                    instrumentación completa de métricas
                  </li>
                </ul>
              </div>
            </div>
            <div className="card artifact card--lift">
              <span className="tag">CHALLENGE</span>
              <div>
                <h3>Reto independiente: field-provision</h3>
                <p className="artifact-desc">
                  Sin starter ni pasos: provisioner de campo con modo verify --offline que nunca toca la red.
                  Defiéndelo oralmente.
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
                  8 preguntas (≤20% recall) y rúbrica 4 niveles ligada a evidencia observable.
                </p>
                <p>
                  <MarkdownLink staticPath={`${BASE}/assessment/checkpoint.md`}>
                    assessment/checkpoint.md
                  </MarkdownLink>
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
                  Ritmo de 180 min, guion de demo, facilitación del Break It, y 4 prompts de repaso con fuentes
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
        </Reveal>
      </section>

      <section className="section container" id="dod" aria-labelledby="dod-title">
        <Reveal>
          <h2 className="stitle" id="dod-title">
            Definition of Done
          </h2>
          <p className="lede section-intro">Marca cada evidencia cuando la tengas. Se guarda en este navegador.</p>
          <ul className="dod">
            {CLASS01.dodItems.map((item) => (
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
              <Link to="/class/02">
                Clase 2 — Models, GGUF and the QVAC Lifecycle: abrimos la caja negra que descargaste hoy. →
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
