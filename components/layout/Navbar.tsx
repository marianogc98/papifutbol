'use client'

import Link from 'next/link'

export function Navbar() {

  const navLinks = [
    { href: '/', label: 'Inicio' },
    { href: '/posiciones', label: 'Posiciones' },
    { href: '/fixture', label: 'Fixture' },
    { href: '/goleadores', label: 'Goleadores' },
  ]

  return (
    <>
      {/* Header Principal - Desktop */}
      <header
        className="hidden md:block w-full mb-6 rounded-b-xl"
        style={{ backgroundColor: '#852024' }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo y Nombre del Club */}
            <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <div className="bg-white rounded-xl p-2">
                <img
                  src="/images/logo.png"
                  alt="Papi Fútbol"
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div className="text-white">
                <h1 className="text-xl font-bold">Papi Fútbol</h1>
                <p className="text-sm opacity-90">Torneo 2025</p>
              </div>
            </Link>

            {/* Navegación Desktop */}
            <nav className="flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-white text-sm font-medium hover:opacity-80 transition-opacity"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Navegación Móvil */}
      <div
        className="md:hidden sticky top-0 z-50 w-full rounded-b-xl"
        style={{ backgroundColor: '#9a2a2e' }}
      >
        <div className="px-4 py-3">
          {/* Logo y Nombre en Móvil */}
          <Link href="/" className="flex items-center gap-2 mb-3">
            <div className="bg-white rounded-xl p-1.5">
              <img
                src="/images/logo.png"
                alt="Papi Fútbol"
                className="w-6 h-6 object-contain"
              />
            </div>
            <div className="text-white">
              <h1 className="text-base font-bold">Papi Fútbol</h1>
              <p className="text-xs opacity-90">Torneo 2025</p>
            </div>
          </Link>

          {/* Botones de navegación con scroll horizontal */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white text-xs font-medium px-3 py-1.5 bg-white/10 rounded-lg whitespace-nowrap hover:bg-white/20 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

