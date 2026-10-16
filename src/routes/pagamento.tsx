import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { requireAuth } from '@/features/auth/guard'
import { useSession } from '@/features/auth/queries'
import { loadAttempt } from '@/features/checkout/attempt'
import { CheckoutContent } from '@/features/checkout/CheckoutContent'
import { useCheckoutQuote, useWallets } from '@/features/checkout/hooks'

export const Route = createFileRoute('/pagamento')({
  beforeLoad: async ({ context, location }) => {
    const user = await requireAuth(context.queryClient, location.href)
    // Já existe um pedido desta tentativa: retoma em vez de abrir outro
    const attempt = loadAttempt(user.id)
    if (attempt?.orderId) {
      throw redirect({ to: '/pedido/$id', params: { id: attempt.orderId }, replace: true })
    }
  },
  component: CheckoutPage,
})

function CheckoutSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Carregando pagamento" className="mt-4 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
      <div className="space-y-5">
        <div className="skeleton h-6 w-48 rounded" />
        {Array.from({ length: 5 }, (_, i) => <div key={i} className="skeleton h-14 w-full rounded" />)}
      </div>
      <div className="space-y-3">
        <div className="skeleton h-6 w-32 rounded" />
        {Array.from({ length: 3 }, (_, i) => <div key={i} className="skeleton h-14 w-full rounded" />)}
        <div className="skeleton h-28 w-full rounded" />
        <div className="skeleton h-10 w-full rounded" />
      </div>
    </div>
  )
}

function CheckoutPage() {
  const { user } = useSession()
  const quote = useCheckoutQuote()
  const wallets = useWallets()

  const failed = quote.isError || wallets.isError
  const retry = () => {
    void quote.refetch()
    void wallets.refetch()
  }

  return (
    <main id="conteudo" className="mx-auto max-w-6xl px-6 py-6">
      <h1 className="sr-only">Pagamento</h1>
      <nav aria-label="Trilha de navegação" className="text-xs font-bold">
        <Link to="/" className="hover:text-primary">Início</Link>
        {' / '}
        <Link to="/" hash="catalogo" className="hover:text-primary">Mercado</Link>
        {' / '}
        <span aria-current="page">Pagamento</span>
      </nav>

      {failed && (
        <div role="alert" className="mt-6 bg-card p-6 text-sm">
          <p className="font-bold">Não foi possível carregar o pagamento.</p>
          <Button type="button" size="sm" className="mt-4" onClick={retry}>Tentar novamente</Button>
        </div>
      )}

      {!failed && (!user || quote.isPending || wallets.isPending) && <CheckoutSkeleton />}

      {!failed && user && quote.data && wallets.data && quote.data.lines.length === 0 && (
        <div className="mt-6 bg-card p-6 text-sm">
          <p className="font-bold">Seu carrinho está vazio.</p>
          <Button asChild size="sm" className="mt-4">
            <Link to="/" hash="catalogo">Explorar NFTs</Link>
          </Button>
        </div>
      )}

      {!failed && user && quote.data && wallets.data && quote.data.lines.length > 0 && (
        <CheckoutContent user={user} quote={quote.data} wallets={wallets.data.items} />
      )}
    </main>
  )
}