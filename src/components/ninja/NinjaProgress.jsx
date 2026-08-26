import { Progress, ProgressLabel, ProgressValue } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

export default function NinjaProgress({ pct, label = 'Progreso', className, showValue = true }) {
  const value = Math.max(0, Math.min(100, pct))

  return (
    <Progress
      value={value}
      className={cn('ninja-progress w-full min-w-[120px]', className)}
      aria-label={`${label}: ${value}%`}
    >
      {label && <ProgressLabel className="sr-only">{label}</ProgressLabel>}
      {showValue && <ProgressValue>{value}%</ProgressValue>}
    </Progress>
  )
}
