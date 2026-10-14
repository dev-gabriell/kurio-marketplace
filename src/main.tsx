import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { toast } from 'sonner'
import { clearPrivateCache } from '@/features/auth/cache'
import { sessionKey } from '@/features/auth/queries'
import { clearToken } from '@/features/auth/token'
import { setSessionExpiredHandler } from '@/lib/http'
import { routeTree } from './routeTree.gen'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false } },
})

const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
  scrollRestoration: true,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Sessão perdida no meio da navegação: limpa tudo e reabre o login, voltando para onde o usuário estava
setSessionExpiredHandler(() => {
  clearToken()
  clearPrivateCache(queryClient)
  queryClient.setQueryData(sessionKey, null)
  toast('Sua sessão expirou. Entre novamente para continuar.')

  const here = new URL(router.state.location.href, window.location.origin)
  here.searchParams.delete('auth')
  here.searchParams.delete('redirect')
  const back = here.pathname + here.search + here.hash

  here.searchParams.set('auth', 'login')
  here.searchParams.set('redirect', back)
  router.history.push(here.pathname + here.search + here.hash)
})

async function bootstrap() {
  if (import.meta.env.VITE_ENABLE_MOCKS === 'true') {
    const { initScenario } = await import('./mocks/scenarios')
    const { installDevTools } = await import('./mocks/dev-tools')
    const { worker } = await import('./mocks/browser')
    installDevTools() // antes do cenário: "?reset=1&scenario=slow" funciona na ordem certa
    initScenario()
    await worker.start({ onUnhandledRequest: 'bypass' })
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>,
  )
}

bootstrap()