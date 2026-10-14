import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { catalogSearchSchema, type CatalogSearch } from '@/features/catalog/schemas'
import { CatalogSection } from '@/features/catalog/components/CatalogSection'
import { Hero } from '@/features/home/Hero'
import { PromoBanners } from '@/features/home/PromoBanners'
import { Journal } from '@/features/home/Journal'

export const Route = createFileRoute('/')({
  validateSearch: catalogSearchSchema,
  component: Home,
})

function Home() {
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  // Qualquer mudança de filtro volta para a página 1 e mantém o catálogo em vista
  function update(patch: Partial<CatalogSearch>) {
    navigate({ search: (prev) => ({ ...prev, ...patch, page: 1 }), hash: 'catalogo' })
  }

  return (
    <main id="conteudo">
      <Hero />
      <CatalogSection search={search} onChange={update} />
      <PromoBanners />
      <Journal />
    </main>
  )
}