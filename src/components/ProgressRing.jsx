export default function ProgressRing({ pct, size = 54, className }) {
  const inner = Math.round(size * 0.74)
  return (
    <div
      className={['ring', className].filter(Boolean).join(' ')}
      style={{ '--pct': pct, width: size, height: size }}
      aria-label={`Progreso: ${pct}%`}
      role="img"
    >
      <i style={{ width: inner, height: inner }}>{pct}%</i>
    </div>
  )
}
