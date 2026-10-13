import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { catalogSearchSchema } from '@/features/catalog/schemas'
import { nftListQuery } from '@/features/catalog/queries'
import { formatEth } from '@/lib/money'

export const Route = createFileRoute('/')({
  validateSearch: catalogSearchSchema,
  component: Home,
})

function Home() {
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const { data, isPending, isError, isFetching, refetch } = useQuery(nftListQuery(search))

  return (
    <main className="mx-auto max-w-5xl p-6">
      <input
        aria-label="Buscar NFT"
        placeholder="Buscar..."
        defaultValue={search.q}
        className="mb-4 w-full rounded border border-border bg-card p-2"
        onChange={(e) =>
          navigate({ search: (prev) => ({ ...prev, q: e.target.value || undefined, page: 1 }), replace: true })
        }
      />

      {isFetching && !isPending && <p className="text-sm text-muted-foreground">Atualizando…</p>}
      {isPending && <p>Carregando…</p>}
      {isError && (
        <p role="alert">
          Falha ao carregar.{' '}
          <button className="underline" onClick={() => refetch()}>Tentar novamente</button>
        </p>
      )}
      {data && data.items.length === 0 && <p>Nenhum NFT encontrado.</p>}

      <ul className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {data?.items.map((n) => (
          <li key={n.id} className="rounded bg-card p-3">
            <img src={n.image} alt={n.name} className="aspect-square w-full rounded-[20px] object-cover" />
            <p className="mt-2">{n.name}</p>
            <p className="font-bold text-primary">{formatEth(n.price)}</p>
          </li>
        ))}
      </ul>

      {data && (
        <nav className="mt-6 flex items-center gap-4" aria-label="Paginação">
          <Link to="/" search={(prev) => ({ ...prev, page: Math.max(1, prev.page - 1) })} disabled={data.page <= 1}>
            ← Anterior
          </Link>
          <span>{data.page} / {data.totalPages}</span>
          <Link to="/" search={(prev) => ({ ...prev, page: prev.page + 1 })} disabled={data.page >= data.totalPages}>
            Próxima →
          </Link>
        </nav>
      )}
    </main>
  )
}