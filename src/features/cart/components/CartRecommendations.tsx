import { useQuery } from '@tanstack/react-query'
import { NftRail } from '@/features/catalog/components/NftRail'
import { nftListQuery } from '@/features/catalog/queries'

export function CartRecommendations({ excludeIds }: { excludeIds: string[] }) {
  const { data, isPending, isError, refetch } = useQuery(
    nftListQuery({ tab: 'all', sort: 'popular', page: 1 }),
  )
  const items = (data?.items ?? []).filter((n) => !excludeIds.includes(n.id))

  return (
    <NftRail
      id="tambem-viram"
      title="Colecionadores também viram"
      items={items}
      isPending={isPending}
      isError={isError}
      onRetry={() => refetch()}
    />
  )
}