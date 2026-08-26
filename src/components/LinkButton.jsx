import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

const VARIANT_MAP = {
  solid: 'default',
  ghost: 'outline',
  default: 'default',
  outline: 'outline',
  secondary: 'secondary',
}

export default function LinkButton({
  to,
  href,
  variant = 'solid',
  size = 'default',
  className,
  children,
  target,
  rel,
  ...props
}) {
  const mapped = VARIANT_MAP[variant] ?? variant

  if (to) {
    return (
      <Button
        variant={mapped}
        size={size}
        className={cn(className)}
        render={<Link to={to} />}
        {...props}
      >
        {children}
      </Button>
    )
  }

  if (href) {
    return (
      <Button
        variant={mapped}
        size={size}
        className={cn(className)}
        render={<a href={href} target={target} rel={rel} />}
        {...props}
      >
        {children}
      </Button>
    )
  }

  return (
    <Button variant={mapped} size={size} className={cn(className)} {...props}>
      {children}
    </Button>
  )
}
