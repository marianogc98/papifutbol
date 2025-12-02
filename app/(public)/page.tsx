import { PublicidadBanner } from '@/components/public/PublicidadBanner'
import { NoticiasSlide } from '@/components/public/NoticiasSlide'
import { TablaPosiciones } from '@/components/public/TablaPosiciones'
import { TablaUltimaFecha } from '@/components/public/TablaUltimaFecha'
import { TablaGoleadores } from '@/components/public/TablaGoleadores'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Banner de publicidad principal */}
      <div className="w-full">
        <PublicidadBanner posicion="banner" className="w-full rounded-lg overflow-hidden" />
      </div>

      {/* Título principal 
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">PapiFutbol</h1>
        <p className="text-muted-foreground text-lg">
          Torneo de Fútbol 5 con Sistema de Vidas
        </p>
      </div>
*/}
      {/* Slide de Noticias/Novedades */}
      <div className="w-full">
        <NoticiasSlide />
      </div>

      {/* Tabla de Partidos de la Última Fecha */}

      <TablaUltimaFecha />

      {/* Tabla de Posiciones - La más importante */}
      <TablaPosiciones />

      {/* Tabla de Goleadores */}
      <TablaGoleadores />

      {/* Publicidad lateral (si hay) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <PublicidadBanner posicion="sidebar" className="w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}

