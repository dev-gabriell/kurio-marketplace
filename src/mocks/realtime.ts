import { toSocketIo } from '@mswjs/socket.io-binding'
import { ws } from 'msw'
import type { Order } from '@/features/checkout/schemas'
import type {
  NftUpdatedEvent,
  OrderUpdatedEvent,
} from '@/features/realtime/schemas'
import { findNft, toDetail } from './db'
import { getDb } from './fixtures/store'

type SocketIo = ReturnType<typeof toSocketIo>
type Connection = Parameters<
  Parameters<typeof link.addEventListener>[1]
>[0]

interface Entry {
  io: SocketIo
  connection: Connection
  userId: string | null
}

interface Sent {
  name: string
  payload: unknown
  userId: string | null
}

// O cliente conecta na mesma origem, em /socket.io/ (somente WebSocket)
const link = ws.link(
  `${window.location.origin.replace(/^http/, 'ws')}/socket.io/`,
)

// A binding não tem broadcast: o servidor simulado guarda as próprias conexões
const entries = new Set<Entry>()
const history: Sent[] = []

let online = true
let seq = 0

const nextId = () => `evt_${++seq}`

function send(name: string, payload: unknown, userId: string | null) {
  history.push({ name, payload, userId })

  if (history.length > 50) history.shift()

  for (const entry of entries) {
    // Evento de usuário vai somente para o dono
    if (userId !== null && entry.userId !== userId) continue

    try {
      entry.io.client.emit(name, payload)
    } catch {
      entries.delete(entry)
    }
  }
}

/** Preço e disponibilidade atuais de um NFT, para catálogo, detalhe e carrinho. */
export function emitNftUpdated(nftId: string) {
  const nft = findNft(nftId)
  if (!nft) return

  const event: NftUpdatedEvent = {
    id: nextId(),
    type: 'nft.updated',
    resource: { type: 'nft', id: nftId },
    version: nft.version,
    occurredAt: new Date().toISOString(),
    data: {
      price: nft.price,
      originalPrice: nft.originalPrice,
      availability: Object.fromEntries(
        toDetail(nft).editionOptions.map((o) => [o.id, o.available]),
      ),
    },
  }

  send('nft.updated', event, null)
}

/** Estado do pedido: só o dono recebe. */
export function emitOrderUpdated(order: Order, userId: string) {
  const event: OrderUpdatedEvent = {
    id: nextId(),
    type: 'order.updated',
    resource: { type: 'order', id: order.id },
    userId,
    version: order.version,
    occurredAt: new Date().toISOString(),
    data: order,
  }

  send('order.updated', event, userId)
}

// ---------- Controles para demonstração e testes ----------

/** Derruba as conexões e recusa novas, simulando queda de rede. */
export function setRealtimeOnline(value: boolean) {
  online = value

  if (!value) {
    for (const entry of entries) {
      try {
        entry.connection.client.close()
      } catch {
        // A conexão pode já estar fechada.
      }
    }

    entries.clear()
  }
}

/** Reenvia o último evento, idêntico (mesmo id e versão). */
export function replayLast() {
  const last = history.at(-1)

  if (last) {
    send(last.name, last.payload, last.userId)
  }
}

/** Envia um evento antigo (versão menor) com preço diferente. */
export function emitStaleNft(nftId: string) {
  const nft = findNft(nftId)
  if (!nft) return

  const event: NftUpdatedEvent = {
    id: nextId(),
    type: 'nft.updated',
    resource: { type: 'nft', id: nftId },
    version: Math.max(0, nft.version - 1),
    occurredAt: new Date().toISOString(),
    data: {
      price: '0.01',
      originalPrice: null,
      availability: {},
    },
  }

  send('nft.updated', event, null)
}

export const clientsInfo = () => [...entries].map((e) => e.userId)

export const realtimeHandlers = [
  link.addEventListener('connection', (connection) => {
    if (!online) {
      connection.client.close()
      return
    }

    const io = toSocketIo(
      connection as unknown as Parameters<typeof toSocketIo>[0],
    )

    const entry: Entry = {
      io,
      connection,
      userId: null,
    }

    entries.add(entry)

    connection.client.addEventListener('close', () => {
      entries.delete(entry)
    })

    io.client.on('session.auth', (...args: unknown[]) => {
      // Dependendo da versão da binding, o primeiro argumento é o evento bruto
      const payload = args.find(
        (a) => !(a instanceof Event),
      ) as { token?: string | null } | undefined

      const token = payload?.token

      const session = token
        ? getDb().sessions.find(
            (s) =>
              s.token === token &&
              Date.parse(s.expiresAt) > Date.now(),
          )
        : undefined

      entry.userId = session?.userId ?? null

      io.client.emit('session.ready', {
        authenticated: !!session,
      })
    })
  }),
]