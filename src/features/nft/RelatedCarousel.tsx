import { useQuery } from '@tanstack/react-query'
import { NftRail } from '@/features/catalog/components/NftRail'
import { nftListQuery } from '@/features/catalog/queries'
import type { NftDetail } from '@/features/catalog/schemas'

export function RelatedCarousel({ nft }: { nft: NftDetail }) {
  const { data, isPending, isError, refetch } = useQuery(
    nftListQuery({ collection: nft.collection, tab: 'all', sort: 'popular', page: 1 }),
  )
  const items = (data?.items ?? []).filter((i) => i.id !== nft.id)

  return (
    <NftRail
      id="mais-colecao"
      title="Mais desta coleção"
      items={items}
      isPending={isPending}
      isError={isError}
      onRetry={() => refetch()}
    />
  )
}