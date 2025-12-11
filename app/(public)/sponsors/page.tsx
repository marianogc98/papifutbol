'use client'

import { PublicidadBanner } from '@/components/public/PublicidadBanner'
import { Card, CardContent } from '@/components/ui/card'
import { usePublicidades } from '@/lib/api/publicidades'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { trackPublicidadView, trackPublicidadClick } from '@/lib/utils/umami'

export default function SponsorsPage() {
  const { data: sponsors, isLoading } = usePublicidades()
  const viewedSponsorsRef = useRef<Set<string>>(new Set())
  
  const sponsorsBronce = sponsors?.filter((s) => s.posicion === 'sponsor') || []

  // Trackear vistas de sponsors cuando se cargan
  useEffect(() => {
    if (sponsorsBronce.length === 0) return

    sponsorsBronce.forEach((sponsor) => {
      if (!viewedSponsorsRef.current.has(sponsor.id)) {
        trackPublicidadView(sponsor.id, sponsor.titulo, 'sponsor')
        viewedSponsorsRef.current.add(sponsor.id)
      }
    })
  }, [sponsorsBronce])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Título de la página */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Nuestros Sponsors</h1>
          <p className="text-muted-foreground text-lg">
            Empresas que apoyan nuestro torneo
          </p>
        </div>

        {/* Grid de Sponsors Bronce */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Cargando sponsors...</p>
          </div>
        ) : sponsorsBronce.length === 0 ? (
          <Card className="bg-white">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Aún no hay sponsors registrados.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div>
            <h2 className="text-2xl font-semibold mb-6 text-center">Patrocinadores</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {sponsorsBronce.map((sponsor) => {
                const esImagenLocal = sponsor.imagen?.startsWith('/')
                const contenido = (
                  <Card className="h-full flex items-center justify-center p-6 hover:shadow-lg transition-shadow bg-white">
                    {sponsor.imagen ? (
                      esImagenLocal ? (
                        <Image
                          src={sponsor.imagen}
                          alt={sponsor.titulo}
                          width={200}
                          height={150}
                          className="w-full h-auto object-contain max-h-32"
                          unoptimized
                        />
                      ) : (
                        <img
                          src={sponsor.imagen}
                          alt={sponsor.titulo}
                          className="w-full h-auto object-contain max-h-32"
                        />
                      )
                    ) : (
                      <div className="text-center">
                        <p className="text-sm font-medium">{sponsor.titulo}</p>
                      </div>
                    )}
                  </Card>
                )

                const handleSponsorClick = () => {
                  if (sponsor.url) {
                    trackPublicidadClick(sponsor.id, sponsor.titulo, sponsor.url, 'sponsor')
                  }
                }

                if (sponsor.url) {
                  return (
                    <Link
                      key={sponsor.id}
                      href={sponsor.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                      onClick={handleSponsorClick}
                    >
                      {contenido}
                    </Link>
                  )
                }

                return <div key={sponsor.id}>{contenido}</div>
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

