import { useState } from 'react'
import { Button } from '@/components/ui/button'

const SLIDES = [
  { image: '/nfts/ape-1.png', alt: 'Macaco de óculos escuros e jaqueta verde' },
  { image: '/nfts/ape-3.png', alt: 'Macaco de cabelo escuro e gola alta verde' },
  { image: '/nfts/ape-2.png', alt: 'Gorila de chapéu e moletom roxo' },
]

export function Hero() {
  const [index, setIndex] = useState(0)
  const slide = SLIDES[index]

  return (
    <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-10 md:grid-cols-2">
      <div>
        <p className="text-xs">Bem-vindo à Kurio</p>
        <h1 className="mt-4 text-4xl font-bold leading-[1.45]">
          SEJA DONO DO FUTURO DA ARTE DIGITAL
        </h1>
        <p className="mt-4 max-w-md text-xs leading-6 text-muted-foreground">
          Descubra NFTs selecionados de criadores emergentes e consagrados. Colecione arte
          digital rara, apoie artistas e tenha uma parte da cultura da internet.
        </p>
        <Button asChild className="mt-6">
          <a href="#catalogo">EXPLORAR</a>
        </Button>

        <div className="mt-10 flex justify-end gap-2 md:max-w-md" role="group" aria-label="Destaques">
          {SLIDES.map((s, i) => (
            <button
              key={s.image}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Destaque ${i + 1}`}
              aria-current={i === index}
              className={`size-2 rounded-full ${i === index ? 'bg-primary' : 'bg-primary/40'}`}
            />
          ))}
        </div>
      </div>

      <img
        src={slide.image}
        alt={slide.alt}
        width={420}
        height={420}
        fetchPriority="high"
        className="aspect-square w-full max-w-[420px] justify-self-end rounded-[24px] object-cover"
      />
    </section>
  )
}