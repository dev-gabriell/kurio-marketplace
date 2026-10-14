import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

function pageList(page: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = [...new Set([1, total, page - 1, page, page + 1])]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b)
  const out: (number | '…')[] = []
  pages.forEach((p, i) => {
    if (i > 0 && p - pages[i - 1] > 1) out.push('…')
    out.push(p)
  })
  return out
}

const box = 'grid size-8 place-items-center rounded border border-border text-xs hover:border-primary'

export function CatalogPagination({ page, totalPages }: { page: number; totalPages: number }) {
  if (totalPages <= 1) return null
  return (
    <nav aria-label="Paginação" className="mt-10 flex justify-end gap-2">
      {pageList(page, totalPages).map((p, i) =>
        p === '…' ? (
          <span key={`gap-${i}`} className="grid size-8 place-items-center text-xs">…</span>
        ) : (
          <Link
            key={p}
            to="/"
            hash="catalogo"
            search={(prev) => ({ ...prev, page: p })}
            aria-label={`Página ${p}`}
            aria-current={p === page ? 'page' : undefined}
            className={cn(box, p === page && 'border-primary bg-primary font-bold text-primary-foreground')}
          >
            {p}
          </Link>
        ),
      )}
      {page < totalPages && (
        <Link
          to="/"
          hash="catalogo"
          search={(prev) => ({ ...prev, page: page + 1 })}
          aria-label="Próxima página"
          className={box}
        >
          <ChevronRight className="size-4" />
        </Link>
      )}
    </nav>
  )
}