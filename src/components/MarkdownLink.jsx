import { Link } from 'react-router-dom'
import { markdownRoute } from '@/lib/markdown'

/**
 * Link to the rendered markdown viewer for a static `.md` asset path.
 * `staticPath` must start with `/` (e.g. `/class-01-…/lab/README.md`).
 */
export default function MarkdownLink({ staticPath, children, className }) {
  return (
    <Link to={markdownRoute(staticPath)} className={className}>
      {children}
    </Link>
  )
}
