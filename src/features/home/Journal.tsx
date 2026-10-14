// src/features/home/Journal.tsx
import { toast } from 'sonner'

// Os textos abaixo dos cards não apareceram nos prints: títulos provisórios.
const POSTS = [
  { image: '/nfts/ape-3.png', title: 'Como começar sua coleção' },
  { image: '/nfts/ape-1.png', title: 'Guia de carteiras e segurança' },
  { image: '/nfts/ape-2.png', title: 'Criadores para acompanhar' },
  { image: '/nfts/ape-4.png', title: 'Entendendo edições limitadas' },
]

export function Journal() {
  return (
    <section aria-labelledby="diario" className="mx-auto max-w-6xl px-6 pb-16">
      <h2 id="diario" className="text-center text-2xl font-bold">Diário da Cunhagem</h2>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Histórias, guias e insights para colecionadores sobre o universo da propriedade digital.
      </p>
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {POSTS.map((p) => (
          <article key={p.title}>
            <button type="button" onClick={() => toast('Artigo indisponível nesta demo.')} className="block w-full text-left">
              <img src={p.image} alt="" loading="lazy" className="aspect-square w-full rounded-t-lg object-cover" />
              <h3 className="mt-2 text-sm">{p.title}</h3>
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}