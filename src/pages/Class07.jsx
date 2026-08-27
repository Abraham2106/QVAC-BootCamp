import { Link } from 'react-router-dom'
import DodLiveRegion from '../components/DodLiveRegion'
import ClassArtifactsSection from '../components/ClassArtifactsSection'
import ClassLessonLinks from '../components/ClassLessonLinks'
import FeatureCard from '../components/FeatureCard'
import MarkdownLink from '../components/MarkdownLink'
import ProgressDisplay from '../components/ProgressDisplay'
import Reveal from '../components/Reveal'
import SlidesEmbed from '../components/SlidesEmbed'
import { CLASS07 } from '../data/curriculum'
import { useRememberVisit } from '../hooks/useProgress'
import { useProgressWithFeedback } from '../hooks/useProgressWithFeedback'

const BASE = '/class-07-speech-systems'
const ANCHORS = [{ id: 'slides', label: 'Slides' }, { id: 'leccion', label: 'Lección' }, { id: 'lab', label: 'Lab' }, { id: 'artefactos', label: 'Artefactos' }, { id: 'dod', label: 'Definition of Done' }]

export default function Class07() {
  const { state, toggle, pct, feedback } = useProgressWithFeedback(CLASS07.id, CLASS07.dodItems.length)
  useRememberVisit()
  return <>
    <section className="class-hero container"><Reveal><span className="kicker">{CLASS07.kicker}</span><h1>{CLASS07.title}</h1><p className="eq">&ldquo;{CLASS07.eq}&rdquo;</p><div className="class-hero__progress"><ProgressDisplay pct={pct} size={58} label="Progreso Clase 7" /><p>Tu progreso se guarda en este navegador. Marca tu avance en la checklist.</p></div><nav className="anchor-tabs" aria-label="Secciones de la clase">{ANCHORS.map(a => <a key={a.id} href={'#' + a.id}>{a.label}</a>)}</nav></Reveal></section>
    <section className="section container" id="slides"><Reveal><h2 className="stitle">Presentación de la clase</h2><p className="lede section-intro">8 diapositivas · contratos PCM, ASR, TTS, relay y medición.</p><SlidesEmbed src={`${BASE}/slides.html`} title="Slides de la Clase 7: Speech Systems" previewLabel="Speech Systems" hint={8} /></Reveal></section>
    <section className="section container" id="leccion"><Reveal><h2 className="stitle">Lección canónica</h2><p className="lede section-intro">PCM, ASR Whisper/Parakeet, TTS y un relay de voz con métricas, cancelación y backpressure.</p><ClassLessonLinks base={BASE} classIndex={7} /><div className="grid grid--3">{CLASS07.outcomes.map(o => <FeatureCard key={o.tag} tag={o.tag} title={o.title} body={o.body} />)}</div></Reveal></section>
    <section className="section container" id="lab"><Reveal><h2 className="stitle">Lab guiado — Local Voice Pipeline</h2><p className="lede section-intro">~90 min. Contrato PCM, ASR por ventanas, TTS, relay correlacionado y Break It.</p><div className="artifact card card--lift"><span className="tag">LAB</span><div><h3>Siete partes · predice antes de medir</h3><ul><li><MarkdownLink staticPath={`${BASE}/lab/README.md`}>lab/README.md</MarkdownLink></li><li><a href={`${BASE}/lab/starter/voice-relay-starter.ts`}>lab/starter/voice-relay-starter.ts</a> — contrato y eventos con TODOs</li></ul></div></div></Reveal></section>
    <ClassArtifactsSection><div className="grid grid--2"><div className="card artifact"><span className="tag">EXAMPLES</span><div><h3>Ejemplos incrementales</h3><p className="artifact-desc">El lab incluye la secuencia ASR → TTS → relay y una prueba de formato.</p></div></div><div className="card artifact"><span className="tag">CHALLENGE</span><div><h3>Relay defendible</h3><p className="artifact-desc">Diseña ventanas, backpressure, cancelación y métricas reproducibles.</p><p><MarkdownLink staticPath={`${BASE}/challenge/challenge.md`}>challenge/challenge.md</MarkdownLink> · <MarkdownLink staticPath={`${BASE}/solution/solution.md`}>solution/solution.md</MarkdownLink></p></div></div><div className="card artifact"><span className="tag">ASSESSMENT</span><div><h3>Checkpoint + rubric</h3><p><MarkdownLink staticPath={`${BASE}/assessment/checkpoint.md`}>checkpoint.md</MarkdownLink> · <MarkdownLink staticPath={`${BASE}/assessment/rubric.md`}>rubric.md</MarkdownLink></p></div></div><div className="card artifact"><span className="tag">INSTRUCTOR</span><div><h3>Guía + NotebookLM</h3><p><MarkdownLink staticPath={`${BASE}/instructor/instructor-guide.md`}>instructor guide</MarkdownLink> · prompts en <MarkdownLink staticPath={`${BASE}/notebooklm/podcast-prompt.md`}>notebooklm/</MarkdownLink></p></div></div></div></ClassArtifactsSection>
    <section className="section container" id="dod"><Reveal><h2 className="stitle">Definition of Done</h2><p className="lede section-intro">Marca cada evidencia cuando la tengas.</p><DodLiveRegion message={feedback} /><ul className="dod">{CLASS07.dodItems.map(item => <li key={item.id}><label><input type="checkbox" checked={!!state[item.id]} onChange={e => toggle(item.id, e.target.checked)} /><span>{item.label}</span></label></li>)}</ul><div className="block example dod-next"><div className="block-title">Siguiente parada</div><div className="block-body"><Link to="/curriculum">Continúa con el siguiente capítulo de Beyond Text. →</Link></div></div></Reveal></section>
    <div className="container class-back"><Link to="/curriculum">← Currículo completo</Link></div>
  </>
}
