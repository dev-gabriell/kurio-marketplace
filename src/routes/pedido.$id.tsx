import { useEffect } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { requireAuth } from '@/features/auth/guard'
import { useSession } from '@/features/auth/queries'
import { clearAttempt } from '@/features/checkout/attempt'
import { useOrder } from '@/features/checkout/hooks'
import { OrderDialog } from '@/features/checkout/OrderDialog'
import { isApiError } from '@/lib/http'

export const Route = createFileRoute('/pedido/$id')({
  beforeLoad: async ({ context, location }) => {
    await requireAuth(context.queryClient, location.href)
  },
  component: OrderPage,
})

function OrderPage() {
  const { id } = Route.useParams()
  const { user } = useSession()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: order, error, isPending, isError, refetch } = useOrder(id)

  const status = order?.status
  const userId = user?.id

  // Estado final (terminal): libera a tentativa e atualiza carrinho e catálogo
  useEffect(() => {
    if (!userId || !status || status === 'pending') return
    clearAttempt(userId)
    void queryClient.invalidateQueries({ queryKey: ['cart'] })
    void queryClient.invalidateQueries({ queryKey: ['nfts'] })
  }, [status, userId, queryClient])

  const denied = isError && isApiError(error) && (error.status === 403 || error.status === 404)

  return (
    <main id="conteudo" className="mx-auto max-w-6xl px-6 py-6">
      <h1 className="sr-only">Confirmação do pedido</h1>

      {isPending && (
        <div role="status" aria-busy="true" aria-label="Carregando pedido" className="mx-auto mt-10 max-w-md space-y-3">
          <div className="skeleton h-16 w-full rounded" />
          <div className="skeleton h-40 w-full rounded" />
        </div>
      )}

      {denied && (
        <div role="alert" className="mx-auto mt-10 max-w-xl bg-card p-6 text-center text-sm">
          <p className="font-bold">{isApiError(error) ? error.message : 'Pedido indisponível.'}</p>
          <Button asChild size="sm" className="mt-4"><Link to="/">Voltar ao início</Link></Button>
        </div>
      )}

      {isError && !denied && (
        <div role="alert" className="mx-auto mt-10 max-w-xl bg-card p-6 text-center text-sm">
          <p className="font-bold">Não foi possível carregar o pedido.</p>
          <Button type="button" size="sm" className="mt-4" onClick={() => refetch()}>Tentar novamente</Button>
        </div>
      )}

      {order && <OrderDialog order={order} onClose={() => navigate({ to: '/' })} />}
    </main>
  )
}