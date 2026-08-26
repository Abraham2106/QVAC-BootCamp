import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ArtifactBadgeRow from './ArtifactBadgeRow'
import { cn } from '@/lib/utils'

export default function CourseCard({
  tag,
  title,
  body,
  badges,
  artifactTags,
  className,
  children,
  headerClassName,
  interactive = false,
  isContinueTarget = false,
}) {
  return (
    <Card
      className={cn(
        'course-card h-full',
        interactive && 'course-card--interactive',
        isContinueTarget && 'course-card--continue',
        className,
      )}
    >
      {isContinueTarget && <span className="class-card__continue-pill">Continuar aquí</span>}
      <CardHeader
        className={cn(
          'gap-2.5 pb-0',
          isContinueTarget && 'pt-8',
          headerClassName,
        )}
      >
        {tag && <p className="card-kicker">{tag}</p>}
        <CardTitle className="text-base font-semibold tracking-tight">{title}</CardTitle>
      </CardHeader>
      {(body || badges || artifactTags || children) && (
        <CardContent
          className={cn(
            'pb-5',
            badges || artifactTags || children ? 'mt-auto pt-3' : 'pt-0',
          )}
        >
          {body && (
            <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
          )}
          {artifactTags && <ArtifactBadgeRow tags={artifactTags} />}
          {badges && !artifactTags && (
            <div className={cn('artifact-badge-row', body && 'mt-0')}>
              <div className="artifact-badge-row__divider" aria-hidden="true" />
              <div className={cn('badge-row', body && 'mt-0')}>{badges}</div>
            </div>
          )}
          {children}
        </CardContent>
      )}
    </Card>
  )
}
