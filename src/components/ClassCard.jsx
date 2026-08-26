import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import Badge from './Badge'
import ProgressDisplay from './ProgressDisplay'
import { getProgressPct } from '../hooks/useProgress'
import { cn } from '@/lib/utils'

export default function ClassCard({ cls }) {
  const pct = cls.available && cls.slug ? getProgressPct(cls.slug) : 0

  const content = (
    <CardContent className="flex gap-5 items-start pt-(--card-spacing)">
      <span className="class-no">{cls.no}</span>
      <div className="class-card__body min-w-0 flex-1">
        <h3 className="font-semibold text-base leading-snug tracking-tight">{cls.title}</h3>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{cls.desc}</p>
        <div className="badge-row mt-3">
          {cls.available && cls.badges
            ? cls.badges.map((b) => <Badge key={b}>{b}</Badge>)
            : <Badge soon>próximamente</Badge>}
        </div>
      </div>
      {cls.available && <ProgressDisplay pct={pct} label={`Progreso ${cls.no}`} />}
    </CardContent>
  )

  const cardClass = cn(
    'course-card h-full',
    !cls.available && 'soon opacity-90',
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
