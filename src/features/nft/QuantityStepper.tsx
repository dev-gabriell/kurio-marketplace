import { Minus, Plus } from 'lucide-react'

interface Props {
  value: number
  max: number
  onChange: (value: number) => void
  disabled?: boolean
}

const round =
  'grid size-9 place-items-center rounded-full bg-primary text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40'

export function QuantityStepper({ value, max, onChange, disabled }: Props) {
  return (
    <div role="group" aria-label="Quantidade" className="flex items-center gap-4">
      <button
        type="button"
        aria-label="Diminuir quantidade"
        disabled={disabled || value <= 1}
        onClick={() => onChange(value - 1)}
        className={round}
      >
        <Minus className="size-4" />
      </button>
      <span role="status" aria-label={`Quantidade: ${value}`} className="w-6 text-center text-sm">
        {value}
      </span>
      <button
        type="button"
        aria-label="Aumentar quantidade"
        disabled={disabled || value >= max}
        onClick={() => onChange(value + 1)}
        className={round}
      >
        <Plus className="size-4" />
      </button>
    </div>
  )
}