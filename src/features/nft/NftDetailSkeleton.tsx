export function NftDetailSkeleton() {
  return (
    <div aria-busy="true" aria-label="Carregando NFT" role="status">
      <div className="skeleton h-4 w-32 rounded" />
      <div className="mt-4 grid gap-8 lg:grid-cols-2">
        <div className="grid gap-4 md:grid-cols-[80px_minmax(0,1fr)]">
          <div className="order-2 flex gap-3 md:order-1 md:flex-col">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="skeleton aspect-square w-20 rounded-lg md:w-full" />
            ))}
          </div>
          <div className="skeleton order-1 aspect-square w-full rounded-[20px] md:order-2" />
        </div>
        <div className="space-y-4">
          <div className="skeleton h-8 w-2/3 rounded" />
          <div className="skeleton h-6 w-full rounded" />
          <div className="skeleton h-4 w-24 rounded" />
          <div className="skeleton h-16 w-full rounded" />
          <div className="skeleton h-6 w-1/2 rounded" />
          <div className="skeleton h-10 w-full rounded" />
          <div className="skeleton h-20 w-full rounded" />
        </div>
      </div>
      <div className="skeleton mt-14 h-40 w-full rounded" />
    </div>
  )
}