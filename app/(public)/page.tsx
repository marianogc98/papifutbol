import { PublicidadBanner } from '@/components/public/PublicidadBanner'
import { NoticiasSlide } from '@/components/public/NoticiasSlide'
import { TablaPosiciones } from '@/components/public/TablaPosiciones'
import { TablaUltimaFecha } from '@/components/public/TablaUltimaFecha'
import { TablaGoleadores } from '@/components/public/TablaGoleadores'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  return (
    <>
      {/* Banner de publicidad principal - Ancho completo */}
      <div className="w-full">
        <PublicidadBanner posicion="banner" className="w-full" />
      </div>
      
      <div className="container mx-auto px-4 py-8 space-y-8">

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

      {/* Publicidad Plata - Banner Secundario */}
      <div className="w-full">
        <PublicidadBanner posicion="footer" className="w-full" />
      </div>
      </div>
    </>
  )
}

