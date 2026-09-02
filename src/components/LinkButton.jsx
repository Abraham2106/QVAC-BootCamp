import { buttonVariants } from '@/components/ui/button'
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
  const classes = cn(buttonVariants({ variant: mapped, size }), className)

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} target={target} rel={rel} className={classes} {...props}>
        {children}
      </a>
    )
  }

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  )
}
