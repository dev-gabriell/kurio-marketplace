import { useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import { applyApiError } from '@/features/auth/errors'
import type { User } from '@/features/auth/schemas'
import { quoteKey } from '@/features/cart/queries'
import type { Quote } from '@/features/cart/schemas'
import { isApiError } from '@/lib/http'
import { loadAttempt } from './attempt'
import { CheckoutSummary, type Banner, type Phase } from './CheckoutSummary'
import { CollectorForm } from './CollectorForm'
import { useConnectWallet, useConnection, useCreateOrder, useDisconnectWallet } from './hooks'
import {
  checkoutFormSchema,
  type CheckoutFormValues,
  type NetworkName,
  type Wallet,
  type WalletType,
} from './schemas'

interface Props {
  user: User
  quote: Quote
  wallets: Wallet[]
}

export function CheckoutContent({ user, quote, wallets }: Props) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const connection = useConnection()
  const connect = useConnectWallet(user.id)
  const disconnect = useDisconnectWallet(user.id)
  const createOrder = useCreateOrder(user.id)
  const busy = useRef(false)

  // Tentativa anterior sem resposta (timeout ou refresh): restaura os dados e exige verificação
  const saved = loadAttempt(user.id)
  const pendingAttempt = saved && !saved.orderId ? saved : null
  const restored = pendingAttempt ? checkoutFormSchema.safeParse(pendingAttempt.payload) : null
  const primary = wallets.find((w) => w.role === 'primary')

  const [phase, setPhase] = useState<Phase>('idle')
  const [banner, setBanner] = useState<Banner | undefined>(
    pendingAttempt
      ? {
          kind: 'unknown',
          message: 'Há uma tentativa de compra sem confirmação. Verifique o pedido antes de tentar novamente.',
        }
      : undefined,
  )
  // Cotação que o usuário revisou; se a vigente mudar, ele precisa confirmar de novo
  const [ackId, setAckId] = useState(pendingAttempt?.payload.quoteId ?? quote.quoteId)
  const changed = !pendingAttempt && quote.quoteId !== ackId

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: restored?.success
      ? restored.data
      : {
          displayName: user.username,
          username: user.username,
          network: primary?.network ?? '',
          profileName: '',
          walletAddress: primary?.address ?? '',
          secondaryWallet: '',
          walletType: primary?.type ?? '',
          referralCode: '',
          email: user.email,
          ensName: '',
          notes: '',
        },
  })

  function handleError(error: unknown) {
    if (!isApiError(error)) return setBanner({ kind: 'error', message: 'Algo deu errado. Tente novamente.' })
    if (error.status === 401) return // sessão expirada: o fluxo global reabre o login
    if (error.code === 'quote_changed') {
      void queryClient.invalidateQueries({ queryKey: quoteKey(user.id) })
      return setBanner({ kind: 'error', message: error.message })
    }
    if (error.code === 'timeout' || error.status === null) {
      return setBanner({
        kind: 'unknown',
        message: 'Não recebemos a resposta do servidor. Seu pedido pode ter sido criado: verifique antes de tentar novamente.',
      })
    }
    applyApiError(error, form.setError, (message) => setBanner({ kind: 'error', message }))
  }

  async function guarded(work: () => Promise<void>) {
    if (busy.current) return // cliques repetidos não criam pedidos duplicados
    busy.current = true
    setBanner(undefined)
    try {
      await work()
    } catch (error) {
      handleError(error)
    } finally {
      busy.current = false
      setPhase('idle')
    }
  }

  const submit = (values: CheckoutFormValues) =>
    guarded(async () => {
      const c = connection.data
      const connected =
        c &&
        c.type === values.walletType &&
        c.network === values.network &&
        c.address.toLowerCase() === values.walletAddress.toLowerCase()

      if (!connected) {
        setPhase('connecting')
        await connect.mutateAsync({
          type: values.walletType as WalletType,
          network: values.network as NetworkName,
          address: values.walletAddress,
        })
      }
      setPhase('submitting')
      const order = await createOrder.mutateAsync({ ...values, quoteId: ackId })
      await navigate({ to: '/pedido/$id', params: { id: order.id } })
    })

  // Reenvia exatamente a tentativa guardada: a mesma chave recupera o mesmo pedido
  const recover = () =>
    guarded(async () => {
      const attempt = loadAttempt(user.id)
      if (!attempt) return
      setPhase('submitting')
      const order = await createOrder.mutateAsync(attempt.payload)
      await navigate({ to: '/pedido/$id', params: { id: order.id } })
    })

  return (
    <FormProvider {...form}>
      <div className="mt-4 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
        <CollectorForm wallets={wallets} onSubmit={form.handleSubmit(submit)} />
        <CheckoutSummary
          quote={quote}
          phase={phase}
          banner={banner}
          changed={changed}
          connection={connection.data}
          disconnecting={disconnect.isPending}
          onAcknowledge={() => setAckId(quote.quoteId)}
          onRecover={recover}
          onDisconnect={() => disconnect.mutate()}
        />
      </div>
    </FormProvider>
  )
}