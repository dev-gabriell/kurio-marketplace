import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Stars({ value }: { value: number }) {
  const filled = Math.round(value)
  return (
    <span
      role="img"
      aria-label={`Nota ${value.toFixed(1).replace('.', ',')} de 5`}
      className="inline-flex gap-0.5 text-primary"
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} aria-hidden="true" className={cn('size-3.5', i < filled && 'fill-current')} />
      ))}
    </span>
  )
}