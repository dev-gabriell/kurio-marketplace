import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthNavigation } from '@/features/auth/navigation'
import { useSession } from '@/features/auth/queries'
import { cn } from '@/lib/utils'
import { useToggleFavorite } from './mutations'
import { useFavoriteIds } from './queries'

export function FavoriteButton({ nftId }: { nftId: string }) {
  const { user, isPending: sessionPending } = useSession()
  const { openAuth } = useAuthNavigation()
  const favorites = useFavoriteIds()
  const toggle = useToggleFavorite(nftId)

  const isFavorite = favorites.data?.has(nftId) ?? false
  const loading = sessionPending || (!!user && favorites.isPending)

  function onClick() {
    // Visitante: abre o login e volta para esta mesma página depois
    if (!user) return openAuth('login', { resume: true })
    toggle.mutate({ favorite: !isFavorite })
  }

  return (
    <Button
      type="button"
      variant="outline"
      aria-pressed={isFavorite}
      aria-busy={loading || undefined}
      disabled={loading}
      onClick={onClick}
    >
      <Heart className={cn('size-4', isFavorite && 'fill-current text-primary')} />
      {isFavorite ? 'Favoritado' : 'Favoritar'}
    </Button>
  )
}