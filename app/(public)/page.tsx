import { PublicidadBanner } from '@/components/public/PublicidadBanner'
import { NoticiasSlide } from '@/components/public/NoticiasSlide'
import { TablaPosiciones } from '@/components/public/TablaPosiciones'
import { TablaUltimaFecha } from '@/components/public/TablaUltimaFecha'
import { TablaGoleadores } from '@/components/public/TablaGoleadores'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Banner de publicidad principal */}
      <div className="w-full">
        <PublicidadBanner posicion="banner" className="w-full rounded-lg overflow-hidden" />
      </div>

      {/* Título principal */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">PapiFutbol</h1>
        <p className="text-muted-foreground text-lg">
          Torneo de Fútbol 5 con Sistema de Vidas
        </p>
      </div>

      {/* Slide de Noticias/Novedades */}
      <div className="w-full">
        <NoticiasSlide />
      </div>

      {/* Tabla de Posiciones - La más importante */}
      <Card>
        <CardHeader>
          <CardTitle>Tabla de Posiciones</CardTitle>
          <CardDescription>
            Clasificación general del torneo con estadísticas completas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TablaPosiciones />
        </CardContent>
      </Card>

      {/* Tabla de Partidos de la Última Fecha */}
      <Card>
        <CardHeader>
          <CardTitle>Última Fecha</CardTitle>
          <CardDescription>
            Resultados de los partidos de la última fecha jugada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TablaUltimaFecha />
        </CardContent>
      </Card>

      {/* Tabla de Goleadores */}
      <Card>
        <CardHeader>
          <CardTitle>Tabla de Goleadores</CardTitle>
          <CardDescription>
            Ranking de los máximos goleadores del torneo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TablaGoleadores />
        </CardContent>
      </Card>

      {/* Publicidad lateral (si hay) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <PublicidadBanner posicion="sidebar" className="w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}

