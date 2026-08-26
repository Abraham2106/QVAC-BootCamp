import { CircularProgress } from '@/components/ui/circular-progress'
import { cn } from '@/lib/utils'

export default function ProgressRing({ pct, size = 54, className }) {
  const safePct = Math.min(100, Math.max(0, pct))
  const strokeWidth = Math.max(3, Math.round(size * 0.1))

  return (
    <CircularProgress
      value={safePct}
      size={size}
      strokeWidth={strokeWidth}
      circleStrokeWidth={strokeWidth}
      progressStrokeWidth={strokeWidth}
      showLabel
      renderLabel={(value) => `${value}%`}
      className={cn('stroke-[color:var(--ring-track)]', className)}
      progressClassName="stroke-[color:var(--green)]"
      labelClassName="progress-ring__label"
      role="img"
      aria-label={`Progreso: ${safePct}%`}
    />
  )
}
