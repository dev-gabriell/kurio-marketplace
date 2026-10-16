export function CartSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Carregando carrinho" className="mt-4 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(260px,300px)]">
      <div>
        <div className="skeleton hidden h-6 w-full rounded md:block" />
        <div className="mt-3 space-y-3">
          {Array.from({ length: 3 }, (_, i) => <div key={i} className="skeleton h-[66px] rounded" />)}
        </div>
      </div>
      <div className="space-y-4">
        <div className="skeleton h-7 w-2/3 rounded" />
        <div className="skeleton h-14 w-full rounded" />
        <div className="skeleton h-28 w-full rounded" />
        <div className="skeleton h-9 w-full rounded" />
      </div>
    </div>
  )
}