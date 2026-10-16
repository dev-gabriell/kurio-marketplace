import { http } from '@/lib/http'
import {
  connectionResponseSchema,
  orderSchema,
  walletsResponseSchema,
  type ConnectInput,
  type OrderInput,
} from './schemas'

export async function fetchWallets(signal?: AbortSignal) {
  const { data } = await http.get('/wallets', { signal })
  return walletsResponseSchema.parse(data)
}

export async function fetchConnection(signal?: AbortSignal) {
  const { data } = await http.get('/wallet/connection', { signal })
  return connectionResponseSchema.parse(data).connection
}

export async function connectWallet(input: ConnectInput) {
  const { data } = await http.post('/wallet/connection', input)
  return connectionResponseSchema.parse(data).connection
}

export async function disconnectWallet() {
  await http.delete('/wallet/connection')
}

export async function createOrder(input: OrderInput, idempotencyKey: string) {
  const { data } = await http.post('/orders', input, {
    headers: { 'Idempotency-Key': idempotencyKey },
    timeout: 6000, // se a resposta se perder, recuperamos pela mesma chave
  })
  return orderSchema.parse(data)
}

export async function fetchOrder(id: string, signal?: AbortSignal) {
  const { data } = await http.get(`/orders/${encodeURIComponent(id)}`, { signal })
  return orderSchema.parse(data)
}