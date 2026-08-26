import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import Badge from './Badge'
import ArtifactBadgeRow from './ArtifactBadgeRow'
import ProgressDisplay from './ProgressDisplay'
import { getProgressPct } from '../hooks/useProgress'
import { cn } from '@/lib/utils'

export default function ClassCard({ cls, isContinueTarget = false }) {
  const pct = cls.available && cls.slug ? getProgressPct(cls.slug) : 0

  const content = (
    <CardContent className="class-card-layout pt-(--card-spacing) pb-5">
      <div className="class-card__header">
        <div className="class-card__header-meta">
          {isContinueTarget && cls.available && (
            <span className="class-card__continue-pill">Continuar aquí</span>
          )}
          <span className="class-no class-no--lite">{cls.no}</span>
        </div>
        {cls.available && (
          <div className="class-card__progress">
            <ProgressDisplay pct={pct} size={52} label={`Progreso ${cls.no}`} />
          </div>
        )}
      </div>
      <div className="class-card__body min-w-0">
        <h3 className="font-semibold text-base leading-snug tracking-tight">{cls.title}</h3>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{cls.desc}</p>
        {cls.available && cls.badges ? (
          <ArtifactBadgeRow tags={cls.badges} />
        ) : (
          <div className="artifact-badge-row">
            <div className="artifact-badge-row__divider" aria-hidden="true" />
            <div className="badge-row">
              <Badge soon>próximamente</Badge>
            </div>
          </div>
        )}
      </div>
    </CardContent>
  )

  const cardClass = cn(
    'course-card h-full',
    !cls.available && 'soon opacity-90',
    isContinueTarget && cls.available && 'course-card--continue',
  )

  if (cls.available && cls.href) {
    return (
      <Link to={cls.href} className="block h-full no-underline text-inherit">
        <Card className={cn(cardClass, 'course-card--interactive')}>{content}</Card>
      </Link>
    )
  }

  return <Card className={cardClass}>{content}</Card>
}
