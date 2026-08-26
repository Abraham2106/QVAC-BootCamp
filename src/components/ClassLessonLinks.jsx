import LinkButton from './LinkButton'
import { markdownRoute } from '../lib/markdown'

/**
 * Primary lesson CTA (Markdown SPA viewer) plus secondary formats in a collapsible block.
 * `base` is the static class folder (e.g. `/class-01-airplane-mode-intelligence`).
 */
export default function ClassLessonLinks({ base, classIndex }) {
  const lessonMd = `${base}/lesson.md`
  const htmlLesson = `/lessons/class-${String(classIndex).padStart(2, '0')}.html`

  return (
    <>
      <div className="cta-row">
        <LinkButton to={markdownRoute(lessonMd)}>Leer la lección →</LinkButton>
      </div>
      <details className="lesson-versions">
        <summary>Otras versiones</summary>
        <p className="lesson-versions__hint">
          Índice HTML resumido y archivo Markdown sin renderizar, por si prefieres otra forma de leer o enlazar.
        </p>
        <div className="lesson-versions__links">
          <LinkButton href={htmlLesson} variant="ghost">
            Índice HTML resumido →
          </LinkButton>
          <LinkButton href={lessonMd} variant="ghost">
            Ver Markdown fuente →
          </LinkButton>
        </div>
      </details>
    </>
  )
}
