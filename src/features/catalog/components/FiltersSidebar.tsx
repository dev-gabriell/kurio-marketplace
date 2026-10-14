import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import type { CatalogSearch, NftList } from '../schemas'

type Facets = NftList['facets']
type Facet = Facets['collections'][number]

interface Props {
  facets?: Facets
  search: CatalogSearch
  onChange: (patch: Partial<CatalogSearch>) => void
}

export function FiltersSidebar({ facets, search, onChange }: Props) {
  if (!facets) return <div className="skeleton h-[560px] rounded" aria-hidden="true" />

  return (
    <aside aria-label="Filtros" className="bg-card p-4 text-xs">
      <FacetList
        title="Coleções"
        items={facets.collections}
        active={search.collection}
        onSelect={(collection) => onChange({ collection })}
      />
      <PriceFilter
        key={`${search.minPrice}-${search.maxPrice}`}
        bounds={facets.priceRange}
        minPrice={search.minPrice}
        maxPrice={search.maxPrice}
        onApply={(minPrice, maxPrice) => onChange({ minPrice, maxPrice })}
      />
      <FacetList
        title="Rede"
        items={facets.networks}
        active={search.network}
        onSelect={(network) => onChange({ network })}
      />
    </aside>
  )
}

function FacetList({
  title,
  items,
  active,
  onSelect,
}: {
  title: string
  items: Facet[]
  active?: string
  onSelect: (value: string | undefined) => void
}) {
  return (
    <section className="mt-8 first:mt-0">
      <h3 className="mb-3 text-sm font-bold">{title}</h3>
      <ul>
        {items.map((item) => {
          const isActive = active === item.name
          return (
            <li key={item.name}>
              <button
                type="button"
                aria-pressed={isActive}
                onClick={() => onSelect(isActive ? undefined : item.name)}
                className={cn(
                  'flex w-full items-center justify-between px-2 py-1.5 text-left hover:text-primary',
                  isActive && 'text-primary',
                )}
              >
                <span>{item.name}</span>
                <span className="text-primary">({item.count})</span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function PriceFilter({
  bounds,
  minPrice,
  maxPrice,
  onApply,
}: {
  bounds: Facets['priceRange']
  minPrice?: string
  maxPrice?: string
  onApply: (min: string | undefined, max: string | undefined) => void
}) {
  const lo = Number(bounds.min)
  const hi = Number(bounds.max)
  const [range, setRange] = useState<number[]>([
    minPrice ? Math.max(lo, Number(minPrice)) : lo,
    maxPrice ? Math.min(hi, Number(maxPrice)) : hi,
  ])
  const isFull = range[0] <= lo && range[1] >= hi

  return (
    <section className="mt-8" aria-labelledby="faixa-preco">
      <h3 id="faixa-preco" className="mb-4 text-sm font-bold">Faixa de preço</h3>
      <Slider min={lo} max={hi} step={0.01} value={range} onValueChange={setRange} />
      <p className="mt-3" aria-live="polite">
        Preço: {range[0].toFixed(2)} – {range[1].toFixed(2)} ETH
      </p>
      <Button
        type="button"
        size="sm"
        className="mt-3"
        onClick={() =>
          onApply(isFull ? undefined : range[0].toFixed(2), isFull ? undefined : range[1].toFixed(2))
        }
      >
        Aplicar
      </Button>
    </section>
  )
}