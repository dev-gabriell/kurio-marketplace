import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  value: number
  max: number
  onChange: (value: number) => void
  disabled?: boolean
  compact?: boolean
  label?: string
}

export function QuantityStepper({ value, max, onChange, disabled, compact, label = 'Quantidade' }: Props) {
  const round = cn(
    'grid place-items-center rounded-full bg-primary text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40',
    compact ? 'size-6' : 'size-9', // 24px no mínimo: alvo de toque acessível
  )
  const icon = compact ? 'size-3' : 'size-4'

  return (
    <div role="group" aria-label={label} className={cn('flex items-center', compact ? 'gap-2' : 'gap-4')}>
      <button
        type="button"
        aria-label={`Diminuir ${label.toLowerCase()}`}
        disabled={disabled || value <= 1}
        onClick={() => onChange(value - 1)}
        className={round}
      >
        <Minus className={icon} />
      </button>
      <span
        role="status"
        aria-label={`${label}: ${value}`}
        className={cn('text-center', compact ? 'w-4 text-xs' : 'w-6 text-sm')}
      >
        {value}
      </span>
      <button
        type="button"
        aria-label={`Aumentar ${label.toLowerCase()}`}
        disabled={disabled || value >= max}
        onClick={() => onChange(value + 1)}
        className={round}
      >
        <Plus className={icon} />
      </button>
    </div>
  )
}