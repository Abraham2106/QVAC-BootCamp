import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export default function CourseCard({
  tag,
  title,
  body,
  badges,
  className,
  children,
  headerClassName,
  interactive = false,
}) {
  return (
    <Card
      className={cn(
        'course-card h-full',
        interactive && 'course-card--interactive',
        className,
      )}
    >
      <CardHeader
        className={cn(
          'gap-2.5 pb-0',
          headerClassName,
        )}
      >
        {tag && <p className="card-kicker">{tag}</p>}
        <CardTitle className="text-base font-semibold tracking-tight">{title}</CardTitle>
      </CardHeader>
      {(body || badges || children) && (
        <CardContent
          className={cn(
            'pt-0',
            badges || children ? 'mt-auto pt-4' : undefined,
          )}
        >
          {body && (
            <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
          )}
          {badges && <div className={cn('badge-row', body && 'mt-3')}>{badges}</div>}
          {children}
        </CardContent>
      )}
    </Card>
  )
}
