import { useQuery } from '@tanstack/react-query'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { isApiError } from '@/lib/http'
import { nftListQuery } from '../queries'
import type { CatalogSearch } from '../schemas'
import { CatalogPagination } from './CatalogPagination'
import { FeaturedCard } from './FeaturedCard'
import { FiltersSidebar } from './FiltersSidebar'
import { NftCard, NftCardSkeleton } from './NftCard'

const TABS = [
  { value: 'all', label: 'Todos os NFTs' },
  { value: 'new', label: 'Novos lançamentos' },
  { value: 'trending', label: 'Em alta' },
] as const

const SORTS = [
  { value: 'recent', label: 'Listados recentemente' },
  { value: 'price_asc', label: 'Preço: menor para maior' },
  { value: 'price_desc', label: 'Preço: maior para menor' },
  { value: 'popular', label: 'Mais populares' },
] as const

const CLEAR_ALL: Partial<CatalogSearch> = {
  q: undefined,
  collection: undefined,
  network: undefined,
  minPrice: undefined,
  maxPrice: undefined,
  tab: 'all',
}

interface Props {
  search: CatalogSearch
  onChange: (patch: Partial<CatalogSearch>) => void
}

export function CatalogSection({ search, onChange }: Props) {
  const { data, error, isPending, isError, isPlaceholderData, refetch } = useQuery(
    nftListQuery(search),
  )

  return (
    <section id="catalogo" aria-labelledby="catalogo-titulo" className="mx-auto max-w-6xl scroll-mt-4 px-6 py-10">
      <h2 id="catalogo-titulo" className="sr-only">Catálogo de NFTs</h2>

      <div className="grid gap-8 lg:grid-cols-[215px_1fr]">
        <div className="space-y-8">
          <FiltersSidebar facets={data?.facets} search={search} onChange={onChange} />
          <FeaturedCard />
        </div>

        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div role="group" aria-label="Filtrar por tipo" className="flex gap-4 text-sm">
              {TABS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  aria-pressed={search.tab === t.value}
                  onClick={() => onChange({ tab: t.value })}
                  className={cn(
                    'border-b-2 pb-1',
                    search.tab === t.value ? 'border-primary text-primary' : 'border-transparent',
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span id="ordenar-label">Ordenar por:</span>
              <Select
                value={search.sort}
                onValueChange={(sort) => onChange({ sort: sort as CatalogSearch['sort'] })}
              >
                <SelectTrigger aria-labelledby="ordenar-label" className="w-[220px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORTS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {search.q && (
            <p className="mb-4 text-xs">
              Resultados para “{search.q}”{' '}
              <button type="button" className="text-primary underline" onClick={() => onChange({ q: undefined })}>
                Limpar busca
              </button>
            </p>
          )}

          {data && (
            <p className="sr-only" aria-live="polite">
              {data.total} {data.total === 1 ? 'resultado' : 'resultados'}
            </p>
          )}

          {isError && (
            <div role="alert" className="bg-card p-6 text-sm">
              <p className="font-bold">Não foi possível carregar os NFTs.</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {isApiError(error) ? `${error.status ?? 'Sem conexão'} · ${error.message}` : 'Erro inesperado.'}
              </p>
              <Button type="button" size="sm" className="mt-4" onClick={() => refetch()}>
                Tentar novamente
              </Button>
            </div>
          )}

          {isPending && (
            <ul className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-3" aria-busy="true">
              {Array.from({ length: 12 }, (_, i) => <NftCardSkeleton key={i} />)}
            </ul>
          )}

          {data && data.items.length === 0 && (
            <div className="bg-card p-6 text-sm">
              <p className="font-bold">Nenhum NFT encontrado.</p>
              <p className="mt-1 text-xs text-muted-foreground">Tente remover alguns filtros.</p>
              <Button type="button" size="sm" className="mt-4" onClick={() => onChange(CLEAR_ALL)}>
                Limpar filtros
              </Button>
            </div>
          )}

          {data && data.items.length > 0 && (
            <ul
              aria-busy={isPlaceholderData}
              className={cn(
                'grid grid-cols-2 gap-x-6 gap-y-8 transition-opacity md:grid-cols-3',
                isPlaceholderData && 'opacity-60',
              )}
            >
              {data.items.map((nft) => <NftCard key={nft.id} nft={nft} />)}
            </ul>
          )}

          {data && <CatalogPagination page={data.page} totalPages={data.totalPages} />}
        </div>
      </div>
    </section>
  )
}