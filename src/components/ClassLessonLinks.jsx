import LinkButton from './LinkButton'
import { markdownRoute } from '../lib/markdown'

/**
 * Primary lesson CTA (HTML index with sidebar TOC) plus secondary formats in a collapsible block.
 * `base` is the static class folder (e.g. `/class-01-airplane-mode-intelligence`).
 */
export default function ClassLessonLinks({ base, classIndex }) {
  const lessonMd = `${base}/lesson.md`
  const htmlLesson = `/lessons/class-${String(classIndex).padStart(2, '0')}.html`

  return (
    <>
      <div className="cta-row">
        <LinkButton href={htmlLesson}>Leer la lección →</LinkButton>
      </div>
      <details className="lesson-versions">
        <summary>Otras versiones</summary>
        <p className="lesson-versions__hint">
          Visor Markdown integrado y archivo fuente, por si prefieres otra forma de leer o enlazar.
        </p>
        <div className="lesson-versions__links">
          <LinkButton to={markdownRoute(lessonMd)} variant="ghost">
            Leer en visor Markdown →
          </LinkButton>
          <LinkButton href={lessonMd} variant="ghost">
            Ver Markdown fuente →
          </LinkButton>
        </div>
      </details>
    </>
  )
}
