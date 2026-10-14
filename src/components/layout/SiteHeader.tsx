import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { LogIn, Search, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const soon = () => toast('Disponível em breve nesta demo.')
const OTHER_LINKS = ['Mercado', 'Criadores', 'Aprenda']

function SearchDialog() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const q = String(new FormData(e.currentTarget).get('q') ?? '').trim()
    setOpen(false)
    navigate({ to: '/', search: { q: q || undefined, page: 1 }, hash: 'catalogo' })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" aria-label="Buscar">
          <Search className="size-5" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Buscar NFTs</DialogTitle>
          <DialogDescription>Digite o nome do NFT que você procura.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex gap-2">
          <label htmlFor="busca" className="sr-only">Nome do NFT</label>
          <Input id="busca" name="q" placeholder="Ex.: Emerald Ape" autoFocus />
          <Button type="submit">Buscar</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function SiteHeader({ cartCount = 0 }: { cartCount?: number }) {
  return (
    <header className="border-b border-primary/40">
      <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-6">
        <Link to="/" className="text-xs font-bold tracking-widest">KURIO</Link>

        <nav aria-label="Principal" className="flex h-full items-stretch gap-8 text-sm">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            className="flex items-center border-b-2 border-transparent data-[status=active]:border-primary data-[status=active]:text-primary"
          >
            Início
          </Link>
          {OTHER_LINKS.map((label) => (
            <button key={label} type="button" onClick={soon} className="border-b-2 border-transparent">
              {label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <SearchDialog />
          <button type="button" aria-label={`Carrinho, ${cartCount} itens`} onClick={soon} className="relative">
            <ShoppingCart className="size-5" />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 grid size-4 place-items-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                {cartCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={soon}
            className="flex items-center gap-2 rounded border border-primary bg-primary/15 px-3 py-1.5 text-sm text-primary"
          >
            <LogIn className="size-4" /> Entrar
          </button>
        </div>
      </div>
    </header>
  )
}