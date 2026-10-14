import { Link } from '@tanstack/react-router'
import { formatEth } from '@/lib/money'
import type { Nft } from '../schemas'

export function NftCard({ nft }: { nft: Nft }) {
  const soldOut = nft.editions.available === 0
  return (
    <li>
      <Link
        to="/nft/$id"
        params={{ id: nft.id }}
        className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        <div className="bg-card p-4">
          <div className="relative">
            <img
              src={nft.image}
              alt={nft.name}
              width={240}
              height={240}
              loading="lazy"
              className="aspect-square w-full rounded-[20px] object-cover"
            />
            {soldOut && (
              <span className="absolute left-2 top-2 rounded bg-background/90 px-2 py-0.5 text-[10px] font-bold">
                ESGOTADO
              </span>
            )}
          </div>
        </div>
        <p className="mt-3 h-4 text-xs leading-4">{nft.name}</p>
        <p className="mt-1 h-5 text-sm font-bold leading-5 text-primary">
          {formatEth(nft.price)}
          {nft.originalPrice && (
            <>
              {' '}
              <s className="font-normal text-muted-foreground">
                <span className="sr-only">preço original </span>
                {formatEth(nft.originalPrice)}
              </s>
            </>
          )}
        </p>
      </Link>
    </li>
  )
}

/** Mesmas medidas do card real, para não haver layout shift. */
export function NftCardSkeleton() {
  return (
    <li aria-hidden="true">
      <div className="bg-card p-4">
        <div className="skeleton aspect-square w-full rounded-[20px] bg-band" />
      </div>
      <div className="skeleton mt-3 h-4 w-3/4 rounded" />
      <div className="skeleton mt-1 h-5 w-1/3 rounded" />
    </li>
  )
}