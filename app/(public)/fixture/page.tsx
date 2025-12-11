import { TablaUltimaFecha } from '@/components/public/TablaUltimaFecha'

export default function FechasPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <TablaUltimaFecha 
        soloConPartidos={false}
        ordenAscendente={true}
        layoutCentrado={true}
      />
    </div>
  )
}
