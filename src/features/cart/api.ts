import { http } from '@/lib/http'
import {
  cartSchema,
  mergeResponseSchema,
  quoteSchema,
  type AddItemInput,
} from './schemas'

export async function fetchCart(signal?: AbortSignal) {
  const { data } = await http.get('/cart', { signal })
  return cartSchema.parse(data)
}

export async function fetchQuote(signal?: AbortSignal) {
  const { data } = await http.get('/cart/quote', { signal })
  return quoteSchema.parse(data)
}

export async function addCartItem(input: AddItemInput) {
  const { data } = await http.post('/cart/items', input)
  return cartSchema.parse(data)
}

export async function updateCartItem(itemId: string, quantity: number) {
  const { data } = await http.patch(`/cart/items/${encodeURIComponent(itemId)}`, { quantity })
  return cartSchema.parse(data)
}

export async function removeCartItem(itemId: string) {
  const { data } = await http.delete(`/cart/items/${encodeURIComponent(itemId)}`)
  return cartSchema.parse(data)
}

export async function applyCoupon(code: string) {
  const { data } = await http.put('/cart/coupon', { code })
  return cartSchema.parse(data)
}

export async function removeCoupon() {
  const { data } = await http.delete('/cart/coupon')
  return cartSchema.parse(data)
}

export async function mergeCart(guestCartId: string) {
  const { data } = await http.post('/cart/merge', { guestCartId })
  return mergeResponseSchema.parse(data)
}