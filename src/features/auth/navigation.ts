import { useRouter } from '@tanstack/react-router'

export type AuthTab = 'login' | 'register'

/** Só aceita caminhos internos, para evitar redirecionamento para sites externos. */
export function safeRedirect(target?: string) {
  if (!target || !target.startsWith('/') || target.startsWith('//')) return undefined
  return target
}

export function useAuthNavigation() {
  const router = useRouter()

  function update(mutate: (url: URL) => void, mode: 'push' | 'replace') {
    const url = new URL(router.state.location.href, window.location.origin)
    mutate(url)
    router.history[mode](url.pathname + url.search + url.hash)
  }

  const closeAuth = () =>
    update((u) => {
      u.searchParams.delete('auth')
      u.searchParams.delete('redirect')
    }, 'replace')

  return {
    openAuth: (tab: AuthTab = 'login') => update((u) => u.searchParams.set('auth', tab), 'push'),
    switchTab: (tab: AuthTab) => update((u) => u.searchParams.set('auth', tab), 'replace'),
    closeAuth,
    /** Após autenticar: retoma o destino original ou só fecha o modal. */
    finishAuth: (redirectTo?: string) => {
      const target = safeRedirect(redirectTo)
      if (target) router.history.replace(target)
      else closeAuth()
    },
  }
}