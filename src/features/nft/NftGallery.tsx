import { useState } from 'react'
import { ZoomIn } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export function NftGallery({ name, images }: { name: string; images: string[] }) {
  const [index, setIndex] = useState(0)
  const current = images[index] ?? images[0]

  return (
    <div className="grid gap-4 md:grid-cols-[80px_minmax(0,1fr)]">
      <ul aria-label="Miniaturas" className="order-2 flex gap-3 md:order-1 md:flex-col">
        {images.map((src, i) => (
          <li key={`${src}-${i}`} className="w-20 shrink-0 md:w-full">
            <button
              type="button"
              aria-label={`Ver imagem ${i + 1} de ${images.length}`}
              aria-pressed={i === index}
              onClick={() => setIndex(i)}
              className={cn(
                'block w-full overflow-hidden rounded-lg border-2 bg-card',
                i === index ? 'border-primary' : 'border-transparent',
              )}
            >
              <img src={src} alt="" width={80} height={80} className="aspect-square w-full object-cover" />
            </button>
          </li>
        ))}
      </ul>

      <div className="relative order-1 bg-card p-4 md:order-2 md:p-6">
        <img
          src={current}
          alt={`${name}, imagem ${index + 1} de ${images.length}`}
          width={480}
          height={480}
          fetchPriority="high"
          className="aspect-square w-full rounded-[20px] object-cover"
        />
        <Dialog>
          <DialogTrigger asChild>
            <button
              type="button"
              aria-label="Ampliar imagem"
              className="absolute right-6 top-6 grid size-8 place-items-center rounded-full bg-background/80 md:right-9 md:top-9"
            >
              <ZoomIn className="size-4" />
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl" aria-describedby={undefined}>
            <DialogTitle className="sr-only">{name}</DialogTitle>
            <img src={current} alt={name} className="max-h-[80vh] w-full rounded-lg object-contain" />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}