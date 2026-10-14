import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/features/auth/guard'
import { useSession } from '@/features/auth/queries'

export const Route = createFileRoute('/perfil')({
  beforeLoad: async ({ context, location }) => {
    await requireAuth(context.queryClient, location.href)
  },
  component: ProfilePage,
})

function ProfilePage() {
  const { user } = useSession()
  return (
    <main id="conteudo" className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-bold">Meu perfil</h1>
      <p className="mt-4 text-sm">Olá, {user?.username}.</p>
      <p className="text-xs text-muted-foreground">{user?.email}</p>
    </main>
  )
}