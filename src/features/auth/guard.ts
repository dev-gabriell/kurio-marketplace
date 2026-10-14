import { redirect } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { sessionQuery } from './queries'

export async function requireAuth(queryClient: QueryClient, href: string) {
  const user = await queryClient.ensureQueryData(sessionQuery())
  if (!user) {
    throw redirect({ to: '/', search: { auth: 'login', redirect: href } })
  }
  return user
}