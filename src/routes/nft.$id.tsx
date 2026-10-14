import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { nftDetailQuery } from '@/features/catalog/queries'
import { NftDetailSkeleton } from '@/features/nft/NftDetailSkeleton'
import { NftDetailView } from '@/features/nft/NftDetailView'
import { isApiError } from '@/lib/http'

export const Route = createFileRoute('/nft/$id')({
  // Começa a buscar antes de montar a tela, sem bloquear a navegação
  loader: ({ context, params }) => {
    void context.queryClient.prefetchQuery(nftDetailQuery(params.id))
  },
  component: NftPage,
})

function NftPage() {
  const { id } = Route.useParams()
  const { data, error, isPending, isError, refetch } = useQuery(nftDetailQuery(id))

  return (
    <main id="conteudo" className="mx-auto max-w-6xl px-6 py-6">
      {isPending && <NftDetailSkeleton />}

      {isError && isApiError(error) && error.status === 404 && (
        <div role="alert" className="mx-auto max-w-xl py-16 text-center">
          <h1 className="text-2xl font-bold">NFT NÃO ENCONTRADO</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            O item “{id}” não existe ou foi removido.
          </p>
          <Button asChild className="mt-6">
            <Link to="/" hash="catalogo">Voltar ao catálogo</Link>
          </Button>
        </div>
      )}

      {isError && !(isApiError(error) && error.status === 404) && (
        <div role="alert" className="mx-auto max-w-xl bg-card p-6 text-center">
          <h1 className="text-xl font-bold">Não foi possível carregar o NFT</h1>
          <p className="mt-2 text-xs text-muted-foreground">
            {isApiError(error) ? `${error.status ?? 'Sem conexão'} · ${error.message}` : 'Erro inesperado.'}
          </p>
          <Button type="button" className="mt-4" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </div>
      )}

      {/* key: ao ir de um NFT para outro, zera edição, quantidade e galeria */}
      {data && <NftDetailView key={data.id} nft={data} />}
    </main>
  )
}