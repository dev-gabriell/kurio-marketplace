import { cn } from '@/lib/utils'
import type { EditionOption } from '@/features/catalog/schemas'

interface Props {
  options: EditionOption[]
  value?: string
  onChange: (id: string) => void
}

export function EditionPicker({ options, value, onChange }: Props) {
  return (
    <fieldset>
      <legend className="text-sm font-bold">Edição:</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((o) => {
          const unavailable = o.available === 0
          return (
            <label
              key={o.id}
              className={cn(
                'cursor-pointer rounded-full border border-border px-3 py-0.5 text-[11px]',
                'has-[:checked]:border-primary has-[:checked]:text-primary',
                'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring',
                unavailable && 'cursor-not-allowed line-through opacity-50',
              )}
            >
              <input
                type="radio"
                name="edition"
                value={o.id}
                checked={o.id === value}
                disabled={unavailable}
                onChange={() => onChange(o.id)}
                className="sr-only"
              />
              {o.label}
              {unavailable && <span className="sr-only"> (esgotada)</span>}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}