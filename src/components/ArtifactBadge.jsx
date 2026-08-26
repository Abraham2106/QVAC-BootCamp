import {
  BookOpen,
  CheckCircle2,
  Code2,
  GraduationCap,
  Mic2,
  Play,
  Presentation,
  Target,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ARTIFACT_BADGES } from '../lib/artifactBadges'

const ICONS = {
  book: BookOpen,
  slides: Presentation,
  play: Play,
  code: Code2,
  target: Target,
  check: CheckCircle2,
  instructor: GraduationCap,
  audio: Mic2,
}

export default function ArtifactBadge({ id, className }) {
  const meta = ARTIFACT_BADGES[id]
  if (!meta) return null

  const Icon = ICONS[meta.icon]
  const group = meta.group

  return (
    <span
      className={cn(
        'artifact-badge',
        group === 'content' && 'artifact-badge--content',
        group === 'eval' && 'artifact-badge--eval',
        group === 'meta' && 'artifact-badge--meta',
        className,
      )}
    >
      {Icon && <Icon className="artifact-badge__icon" aria-hidden="true" strokeWidth={2} />}
      <span>{meta.label}</span>
    </span>
  )
}
