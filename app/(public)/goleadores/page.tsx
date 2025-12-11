import { TablaGoleadores } from '@/components/public/TablaGoleadores'

export default function GoleadoresPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <TablaGoleadores mostrarTodos={true} />
    </div>
  )
}

