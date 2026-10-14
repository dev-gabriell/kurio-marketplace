import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { formatEth } from '@/lib/money'
import { featuredNftQuery } from '../queries'

export function FeaturedCard() {
  const { data } = useQuery(featuredNftQuery())

  if (!data) return <div className="skeleton h-[420px] rounded" aria-hidden="true" />

  return (
    <aside aria-label="NFT em destaque" className="bg-card">
      <div className="p-4">
        <h2 className="text-lg font-bold text-primary">NFT EM DESTAQUE</h2>
        <p className="mt-2 text-center text-sm font-bold">OFERTA LIMITADA</p>
      </div>
      <Link to="/nft/$id" params={{ id: data.id }} className="block">
        <img
          src={data.image}
          alt={data.name}
          width={215}
          height={280}
          loading="lazy"
          className="aspect-[3/4] w-full rounded-[20px] object-cover"
        />
        <p className="px-4 pt-3 text-xs">{data.name}</p>
        <p className="px-4 pb-4 pt-1 text-sm font-bold text-primary">{formatEth(data.price)}</p>
      </Link>
    </aside>
  )
}