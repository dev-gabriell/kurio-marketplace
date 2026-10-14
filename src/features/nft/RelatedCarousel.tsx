import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { NftCard, NftCardSkeleton } from '@/features/catalog/components/NftCard'
import { nftListQuery } from '@/features/catalog/queries'
import type { NftDetail } from '@/features/catalog/schemas'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 5

export function RelatedCarousel({ nft }: { nft: NftDetail }) {
  const [page, setPage] = useState(0)
  const { data, isPending, isError, refetch } = useQuery(
    nftListQuery({ collection: nft.collection, tab: 'all', sort: 'popular', page: 1 }),
  )

  const items = (data?.items ?? []).filter((i) => i.id !== nft.id)
  const pages = Math.max(1, Math.ceil(items.length / PAGE_SIZE))
  const current = Math.min(page, pages - 1)
  const visible = items.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE)

  if (!isPending && !isError && items.length === 0) return null

  return (
    <section aria-labelledby="mais-colecao" className="mt-14">
      <h2 id="mais-colecao" className="border-b border-primary/40 pb-3 text-sm font-bold text-primary">
        Mais desta coleção
      </h2>

      {isPending && (
        <ul className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5" aria-busy="true">
          {Array.from({ length: PAGE_SIZE }, (_, i) => <NftCardSkeleton key={i} />)}
        </ul>
      )}

      {isError && (
        <div role="alert" className="mt-6 bg-card p-4 text-xs">
          <p>Não foi possível carregar os itens da coleção.</p>
          <Button type="button" size="sm" className="mt-3" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </div>
      )}

      {visible.length > 0 && (
        <ul className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
          {visible.map((n) => <NftCard key={n.id} nft={n} />)}
        </ul>
      )}

      {pages > 1 && (
        <div role="group" aria-label="Páginas da coleção" className="mt-6 flex justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Página ${i + 1} de ${pages}`}
              aria-current={i === current}
              onClick={() => setPage(i)}
              className={cn('size-2.5 rounded-full border border-primary', i === current && 'bg-primary')}
            />
          ))}
        </div>
      )}
    </section>
  )
}