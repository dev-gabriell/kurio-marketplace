import type { QueryClient } from '@tanstack/react-query'
import { io } from 'socket.io-client'
import { toast } from 'sonner'
import { getToken } from '@/features/auth/token'
import type { Quote } from '@/features/cart/schemas'
import { nftKeys } from '@/features/catalog/queries'
import type { Nft, NftDetail } from '@/features/catalog/schemas'
import { clearAttempt } from '@/features/checkout/attempt'
import { orderKey } from '@/features/checkout/hooks'
import type { Order } from '@/features/checkout/schemas'
import { nftUpdatedSchema, orderUpdatedSchema, type NftUpdatedEvent } from './schemas'
import { setSocketStatus } from './status'

interface Options {
  queryClient: QueryClient
  userId: string | null
  openOrder: (id: string) => void
}

const SEEN_LIMIT = 500
const RECONCILE_ROOTS = ['nfts', 'cart', 'orders']

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null

export function createRealtime({ queryClient, userId, openOrder }: Options) {
  const seen = new Set<string>() // ids já processados: tolera duplicatas
  const versions = new Map<string, number>() // maior versão aplicada por recurso: tolera eventos antigos
  let connectedBefore = false

  function accept(event: { id: string; version: number; resource: { type: string; id: string } }) {
    if (seen.has(event.id)) return false
    seen.add(event.id)
    if (seen.size > SEEN_LIMIT) seen.delete(seen.values().next().value as string)

    const key = `${event.resource.type}:${event.resource.id}`
    if (event.version <= (versions.get(key) ?? 0)) return false
    versions.set(key, event.version)
    return true
  }

  // ---------- nft.updated ----------

  function patchNft<T extends Nft>(nft: T, e: NftUpdatedEvent): T {
    if (nft.id !== e.resource.id || e.version <= nft.version) return nft // nunca regride
    return {
      ...nft,
      price: e.data.price,
      originalPrice: e.data.originalPrice,
      editions: { ...nft.editions, available: e.data.availability['e-1-50'] ?? nft.editions.available },
      version: e.version,
    }
  }

  function patchCatalog(e: NftUpdatedEvent) {
    queryClient.setQueriesData({ queryKey: nftKeys.all }, (old: unknown) => {
      if (!isRecord(old)) return old

      if (Array.isArray(old.items)) {
        const items = (old.items as Nft[]).map((n) => patchNft(n, e)) // listagens
        return items.some((n, i) => n !== (old.items as Nft[])[i]) ? { ...old, items } : old
      }

      if (old.id === e.resource.id) {
        // detalhe e destaque
        const next = patchNft(old as unknown as Nft, e)
        if (next === (old as unknown as Nft)) return old
        const detail = old as unknown as NftDetail
        return Array.isArray(detail.editionOptions)
          ? {
              ...next,
              editionOptions: detail.editionOptions.map((o) => ({
                ...o,
                available: e.data.availability[o.id] ?? o.available,
              })),
            }
          : next
      }
      return old
    })
  }

  function notifyCart(e: NftUpdatedEvent) {
    const quotes = queryClient
      .getQueriesData<Quote>({ queryKey: ['cart'] })
      .map(([, data]) => data)
      .filter((data): data is Quote => isRecord(data) && Array.isArray(data.lines))

    const line = quotes
      .flatMap((q) => q.lines)
      .find(
        (l) =>
          l.nftId === e.resource.id &&
          (l.unitPrice !== e.data.price || l.available !== (e.data.availability[l.editionId] ?? l.available)),
      )
    if (!line) return

    toast(`${line.name}: preço ou disponibilidade mudou. O resumo foi atualizado.`, {
      id: `nft-${e.resource.id}`,
    })
    void queryClient.invalidateQueries({ queryKey: ['cart'] }) // a cotação vem sempre da API
  }

  function onNftUpdated(raw: unknown) {
    const parsed = nftUpdatedSchema.safeParse(raw)
    if (!parsed.success || !accept(parsed.data)) return
    patchCatalog(parsed.data)
    notifyCart(parsed.data)
  }

  // ---------- order.updated ----------

  function onOrderUpdated(raw: unknown) {
    const parsed = orderUpdatedSchema.safeParse(raw)
    if (!parsed.success || !userId) return
    const event = parsed.data
    if (event.userId !== userId) return // evento de outra sessão
    if (!accept(event)) return

    const key = orderKey(userId, event.resource.id)
    const cached = queryClient.getQueryData<Order>(key)
    if (cached && cached.version >= event.data.version) return // a API já trouxe estado igual ou mais novo

    queryClient.setQueryData(key, event.data)
    if (event.data.status === 'pending') return

    // Estado final: libera a tentativa de compra e atualiza carrinho e catálogo
    clearAttempt(userId)
    void queryClient.invalidateQueries({ queryKey: ['cart'] })
    void queryClient.invalidateQueries({ queryKey: ['nfts'] })

    if (!window.location.pathname.startsWith('/pedido/')) {
      const confirmed = event.data.status === 'confirmed'
      const message = confirmed ? 'Seu pedido foi confirmado.' : 'Seu pedido foi recusado.'
      toast(message, { action: { label: 'Ver pedido', onClick: () => openOrder(event.resource.id) } })
    }
  }

  // ---------- conexão ----------

  function reconcile() {
    for (const root of RECONCILE_ROOTS) {
      void queryClient.invalidateQueries({ queryKey: [root], refetchType: 'active' })
    }
  }

  // Somente WebSocket: o long-polling do Socket.IO não é simulado pelo MSW
  const socket = io({ path: '/socket.io/', transports: ['websocket'], reconnectionDelay: 500, reconnectionDelayMax: 3000 })
  setSocketStatus('connecting')

  socket.on('connect', () => {
    setSocketStatus('connected')
    socket.emit('session.auth', { token: getToken() })
    if (connectedBefore) {
      reconcile() // depois de reconectar, o REST é a fonte de verdade
      toast.success('Conexão em tempo real restabelecida.', { id: 'rt-status' })
    }
    connectedBefore = true
  })

  const lost = () => {
    setSocketStatus('disconnected')
    if (connectedBefore) toast('Conexão em tempo real perdida. Tentando reconectar…', { id: 'rt-status' })
  }
  socket.on('disconnect', lost)
  socket.on('connect_error', lost)

  socket.on('nft.updated', onNftUpdated)
  socket.on('order.updated', onOrderUpdated)

  return {
    /** Libera listeners e conexão: chamado ao trocar de sessão e ao desmontar. */
    stop() {
      socket.removeAllListeners()
      socket.disconnect()
      setSocketStatus('disconnected')
    },
  }
}