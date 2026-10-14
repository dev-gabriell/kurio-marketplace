import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { nftDetailQuery } from '@/features/catalog/queries'
import { formatEth } from '@/lib/money'

export const Route = createFileRoute('/nft/$id')({
  component: NftPage,
})

function NftPage() {
  const { id } = Route.useParams()
  const { data, isPending, isError } = useQuery(nftDetailQuery(id))

  return (
    <main id="conteudo" className="mx-auto max-w-3xl p-6">
      <Link to="/" className="text-xs text-primary underline">← Voltar</Link>
      {isPending && <p className="mt-6">Carregando…</p>}
      {isError && <p role="alert" className="mt-6">NFT não encontrado.</p>}
      {data && (
        <div className="mt-6">
          <h1 className="text-2xl font-bold">{data.name}</h1>
          <p className="mt-2 font-bold text-primary">{formatEth(data.price)}</p>
        </div>
      )}
    </main>
  )
}