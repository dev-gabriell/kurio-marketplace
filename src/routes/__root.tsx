import { createRootRouteWithContext, Link, Outlet } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => <Outlet />,
  notFoundComponent: () => (
    <main className="mx-auto max-w-xl p-8 text-center">
      <h1 className="text-3xl font-bold">PÁGINA NÃO ENCONTRADA</h1>
      <p className="mt-2 text-muted-foreground">
        O endereço que você acessou não existe.
      </p>
      <Link to="/" className="mt-6 inline-block text-primary underline">
        Voltar ao início
      </Link>
    </main>
  ),
})