import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">SEJA DONO DO FUTURO</h1>
      <Button className="mt-4">EXPLORAR</Button>
    </main>
  )
}