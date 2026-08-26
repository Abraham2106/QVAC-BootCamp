import { cn } from '@/lib/utils'

export function CircularProgress({
  value,
  renderLabel,
  className,
  progressClassName,
  labelClassName,
  showLabel = false,
  shape = 'round',
  size = 100,
  strokeWidth,
  circleStrokeWidth = 10,
  progressStrokeWidth = 10,
  ...props
}) {
  const safeValue = Math.min(100, Math.max(0, value))
  const lineWidth = strokeWidth ?? circleStrokeWidth
  const radius = size / 2 - lineWidth - 2
  const circumference = Math.ceil(Math.PI * radius * 2)
  const strokeDashoffset = Math.ceil(circumference * ((100 - safeValue) / 100))
  const viewBox = `-${size * 0.125} -${size * 0.125} ${size * 1.25} ${size * 1.25}`

  return (
    <div className="relative" {...props}>
      <svg
        className="relative"
        height={size}
        style={{ transform: 'rotate(-90deg)' }}
        viewBox={viewBox}
        width={size}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden={showLabel ? undefined : true}
      >
        <circle
          className={cn('stroke-primary/25', className)}
          cx={size / 2}
          cy={size / 2}
          fill="transparent"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset="0"
          strokeWidth={lineWidth}
        />
        <circle
          className={cn('stroke-primary', progressClassName)}
          cx={size / 2}
          cy={size / 2}
          fill="transparent"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap={shape}
          strokeWidth={strokeWidth ?? progressStrokeWidth}
        />
      </svg>
      {showLabel && (
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center text-md',
            labelClassName,
          )}
        >
          {renderLabel ? renderLabel(safeValue) : safeValue}
        </div>
      )}
    </div>
  )
}
