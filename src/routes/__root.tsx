import { createRootRouteWithContext, Link, Outlet } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { Toaster } from '@/components/ui/sonner'
import { AuthDialog } from '@/features/auth/components/AuthDialog'
import { useRealtime } from '@/features/realtime/useRealtime'

interface RouterContext {
  queryClient: QueryClient
}

// Parâmetros globais: abrem o modal de acesso e guardam o destino pós-login
const rootSearchSchema = z.object({
  auth: z.enum(['login', 'register']).optional().catch(undefined),
  redirect: z.string().optional().catch(undefined),
})

function RootLayout() {
  useRealtime()
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:bg-primary focus:p-2 focus:text-primary-foreground"
      >
        Pular para o conteúdo
      </a>
      <SiteHeader />
      <div className="flex-1">
        <Outlet />
      </div>
      <SiteFooter />
      <AuthDialog />
      <Toaster />
    </div>
  )
}

export const Route = createRootRouteWithContext<RouterContext>()({
  validateSearch: rootSearchSchema,
  component: RootLayout,
  notFoundComponent: () => (
    <main id="conteudo" className="mx-auto max-w-xl p-8 text-center">
      <h1 className="text-3xl font-bold">PÁGINA NÃO ENCONTRADA</h1>
      <p className="mt-2 text-muted-foreground">O endereço que você acessou não existe.</p>
      <Link to="/" className="mt-6 inline-block text-primary underline">Voltar ao início</Link>
    </main>
  ),
})