import useUiMode from '../hooks/useUiMode'
import ProgressRing from './ProgressRing'
import NinjaProgress from './ninja/NinjaProgress'
import { cn } from '@/lib/utils'

export default function ProgressDisplay({ pct, size = 54, label, className, showValue }) {
  const { isNinja } = useUiMode()

  if (isNinja) {
    return <NinjaProgress pct={pct} label={label} className={className} showValue={showValue} />
  }

  return <ProgressRing pct={pct} size={size} className={className} />
}
