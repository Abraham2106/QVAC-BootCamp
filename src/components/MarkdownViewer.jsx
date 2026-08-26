import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { cn } from '@/lib/utils'
import { isMarkdownStaticPath, markdownRoute } from '@/lib/markdown'
import useUiMode from '@/hooks/useUiMode'
import { useTheme } from '@/hooks/useTheme'

function MarkdownLink({ href, children, ...props }) {
  if (href && isMarkdownStaticPath(href) && href.startsWith('/')) {
    return (
      <Link to={markdownRoute(href)} {...props}>
        {children}
      </Link>
    )
  }

  if (href && /^https?:\/\//i.test(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    )
  }

  return (
    <a href={href} {...props}>
      {children}
    </a>
  )
}

export default function MarkdownViewer({ src, className }) {
  const [content, setContent] = useState('')
  const [status, setStatus] = useState('loading')
  const { isNinja } = useUiMode()
  const { isDark } = useTheme()

  useEffect(() => {
    let cancelled = false
    setStatus('loading')

    fetch(src)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.text()
      })
      .then((text) => {
        if (!cancelled) {
          setContent(text)
          setStatus('ok')
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [src])

  const proseClass = cn(
    'markdown-viewer prose prose-neutral max-w-none',
    (isNinja || isDark) && 'prose-invert',
    isNinja && 'markdown-viewer--ninja',
    className,
  )

  if (status === 'loading') {
    return (
      <div className="markdown-viewer__state" role="status">
        Cargando documento…
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="markdown-viewer__state markdown-viewer__state--error" role="alert">
        No se pudo cargar el documento.{' '}
        <a href={src} target="_blank" rel="noopener noreferrer">
          Abrir archivo original
        </a>
      </div>
    )
  }

  return (
    <article className={proseClass}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          a: MarkdownLink,
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  )
}
