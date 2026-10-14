// src/features/home/PromoBanners.tsx
import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'

const BANNERS = [
  {
    title: 'Lançamentos gênesis de edição limitada',
    text: 'Colecione edições escassas diretamente dos criadores antes da revelação pública.',
    image: '/nfts/ape-1.png',
    tab: 'new' as const,
  },
  {
    title: 'Arte digital selecionada e muito mais',
    text: 'Explore novos artistas, coleções verificadas e obras digitais que definem a cultura da internet.',
    image: '/nfts/ape-3.png',
    tab: 'trending' as const,
  },
]

export function PromoBanners() {
  return (
    <section aria-label="Destaques" className="mx-auto grid max-w-6xl gap-6 px-6 py-16 md:grid-cols-2">
      {BANNERS.map((b) => (
        <article key={b.title} className="flex overflow-hidden rounded-lg bg-card">
          <img src={b.image} alt="" loading="lazy" className="w-2/5 object-cover" />
          <div className="flex flex-1 flex-col items-end justify-center p-5 text-right">
            <h3 className="font-bold">{b.title}</h3>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">{b.text}</p>
            <Link
              to="/"
              search={{ tab: b.tab }}
              hash="catalogo"
              className="mt-3 inline-flex items-center gap-1 rounded bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
            >
              Explorar <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </article>
      ))}
    </section>
  )
}