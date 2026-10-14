import { http } from '@/lib/http'
import {
  authResponseSchema,
  sessionResponseSchema,
  type LoginInput,
  type RegisterBody,
} from './schemas'

export async function login(input: LoginInput) {
  const { data } = await http.post('/auth/login', input, { skipSessionExpired: true })
  return authResponseSchema.parse(data)
}

export async function register(input: RegisterBody) {
  const { data } = await http.post('/auth/register', input, { skipSessionExpired: true })
  return authResponseSchema.parse(data)
}

export async function fetchSession(signal?: AbortSignal) {
  const { data } = await http.get('/auth/session', { signal, skipSessionExpired: true })
  return sessionResponseSchema.parse(data)
}

export async function logout() {
  await http.post('/auth/logout', null, { skipSessionExpired: true })
}