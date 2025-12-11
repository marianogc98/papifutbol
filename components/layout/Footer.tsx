import Link from 'next/link'
import { Facebook, Instagram, Mail, Phone } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  const navLinks = [
    { href: '/', label: 'Inicio' },
    { href: '/posiciones', label: 'Posiciones' },
    { href: '/fixture', label: 'Fixture' },
    { href: '/goleadores', label: 'Goleadores' },
    { href: '/sponsors', label: 'Sponsors' },
    { href: '/publicidad', label: 'Publicidad' },
  ]

  return (
    <footer
      className="mt-auto rounded-t-xl"
      style={{ backgroundColor: '#852024' }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Información de Contacto */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Contacto</h3>
            <div className="space-y-2 text-white text-sm">

              <div className="flex items-center gap-3 mt-4">
                <a
                  href="https://www.facebook.com/PapiFutbolDelIngeniero"
                  className="text-white hover:opacity-80 transition-opacity"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="https://instagram.com/papi_futbol"
                  className="text-white hover:opacity-80 transition-opacity"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Enlaces Rápidos */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Enlaces Rápidos</h3>
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-white text-sm hover:opacity-80 transition-opacity w-fit"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Información del Club */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Papi Fútbol</h3>
            <p className="text-white text-sm opacity-90 mb-4">
              Torneo 2025
            </p>
            <p className="text-white text-xs opacity-75">
              © {currentYear} Todos los derechos reservados
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

