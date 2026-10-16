import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { CartRecommendations } from '@/features/cart/components/CartRecommendations'
import { CartSkeleton } from '@/features/cart/components/CartSkeleton'
import { CartTable } from '@/features/cart/components/CartTable'
import { OrderSummary } from '@/features/cart/components/OrderSummary'
import { useCartQuote } from '@/features/cart/queries'

export const Route = createFileRoute('/carrinho')({
  component: CartPage,
})

function CartPage() {
  const { data: quote, isPending, isError, refetch } = useCartQuote()

  return (
    <main id="conteudo" className="mx-auto max-w-6xl px-6 py-6">
      <h1 className="sr-only">Carrinho</h1>
      <nav aria-label="Trilha de navegação" className="text-xs font-bold">
        <Link to="/" className="hover:text-primary">Início</Link>
        {' / '}
        <Link to="/" hash="catalogo" className="hover:text-primary">Mercado</Link>
        {' / '}
        <span aria-current="page">Carrinho</span>
      </nav>

      {isPending && <CartSkeleton />}

      {isError && (
        <div role="alert" className="mt-6 bg-card p-6 text-sm">
          <p className="font-bold">Não foi possível carregar o carrinho.</p>
          <Button type="button" size="sm" className="mt-4" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </div>
      )}

      {quote && quote.lines.length === 0 && (
        <div className="mt-6 bg-card p-6 text-sm">
          <p className="font-bold">Seu carrinho está vazio.</p>
          <p className="mt-1 text-xs text-muted-foreground">Escolha um NFT no catálogo para começar.</p>
          <Button asChild size="sm" className="mt-4">
            <Link to="/" hash="catalogo">Explorar NFTs</Link>
          </Button>
        </div>
      )}

      {quote && quote.lines.length > 0 && (
        <div className="mt-4 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(260px,300px)]">
          <CartTable lines={quote.lines} />
          <OrderSummary quote={quote} />
        </div>
      )}

      <CartRecommendations excludeIds={quote?.lines.map((l) => l.nftId) ?? []} />
    </main>
  )
}