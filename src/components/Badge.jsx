import { Badge as UiBadge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export default function Badge({ children, soon = false, className, size = 'sm' }) {
  return (
    <UiBadge
      variant={soon ? 'secondary' : 'outline'}
      size={size}
      className={cn(
        'font-mono uppercase tracking-wide',
        size === 'sm' ? 'text-[10px]' : 'text-[11px]',
        className,
      )}
    >
      {children}
    </UiBadge>
  )
}
