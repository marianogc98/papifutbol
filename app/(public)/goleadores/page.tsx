import { TablaGoleadores } from '@/components/public/TablaGoleadores'

export default function GoleadoresPage() {
  return (
    <div className="w-full">
      <TablaGoleadores mostrarTodos={true} />
    </div>
  )
}

