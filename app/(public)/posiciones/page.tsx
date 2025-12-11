import { TablaPosiciones } from '@/components/public/TablaPosiciones'

export default function TablaPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <TablaPosiciones mostrarTodos={true} />
    </div>
  )
}

