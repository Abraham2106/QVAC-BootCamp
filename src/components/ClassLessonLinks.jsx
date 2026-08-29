import LinkButton from './LinkButton'
import { markdownRoute } from '../lib/markdown'

/**
 * Primary lesson CTA (HTML index with sidebar TOC) plus secondary formats and bibliography.
 * `base` is the static class folder (e.g. `/class-01-airplane-mode-intelligence`).
 */
export default function ClassLessonLinks({ base, classIndex }) {
  const lessonMd = `${base}/lesson.md`
  const bibliographyMd = `${base}/bibliography.md`
  const htmlLesson = `/lessons/class-${String(classIndex).padStart(2, '0')}.html`

  return (
    <>
      <div className="cta-row">
        <LinkButton href={htmlLesson}>Leer la lección →</LinkButton>
        <LinkButton to={markdownRoute(bibliographyMd)} variant="ghost">
          Bibliografía ampliada →
        </LinkButton>
      </div>
      <details className="lesson-versions">
        <summary>Otras versiones y fuentes</summary>
        <p className="lesson-versions__hint">
          Visor Markdown integrado, archivo fuente y bibliografía anotada para profundizar en papers, documentación oficial y lecturas complementarias.
        </p>
        <div className="lesson-versions__links">
          <LinkButton to={markdownRoute(lessonMd)} variant="ghost">
            Leer en visor Markdown →
          </LinkButton>
          <LinkButton href={lessonMd} variant="ghost">
            Ver Markdown fuente →
          </LinkButton>
          <LinkButton to={markdownRoute(bibliographyMd)} variant="ghost">
            Leer bibliografía →
          </LinkButton>
          <LinkButton href={bibliographyMd} variant="ghost">
            Ver bibliografía Markdown →
          </LinkButton>
        </div>
      </details>
    </>
  )
}
