import { TablaUltimaFecha } from '@/components/public/TablaUltimaFecha'

export default function FechasPage() {
  return (
    <TablaUltimaFecha 
      soloConPartidos={false}
      ordenAscendente={true}
      layoutCentrado={true}
    />
  )
}
