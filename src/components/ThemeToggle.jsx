import { useTheme } from '../hooks/useTheme'
import { Button } from '@/components/ui/button'

export default function ThemeToggle() {
  const { isDark, toggle } = useTheme()

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="theme-toggle h-8 gap-1.5 px-2.5 font-medium"
      onClick={toggle}
      aria-label={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      title={isDark ? 'Tema claro' : 'Tema oscuro'}
    >
      <span className="theme-toggle__icon text-base leading-none" aria-hidden="true">
        {isDark ? '☀' : '☽'}
      </span>
      <span className="theme-toggle__label text-xs">{isDark ? 'Claro' : 'Oscuro'}</span>
    </Button>
  )
}
