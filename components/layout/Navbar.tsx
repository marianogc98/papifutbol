'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const navLinks = [
    { href: '/', label: 'Inicio' },
    { href: '/posiciones', label: 'Posiciones' },
    { href: '/fixture', label: 'Fixture' },
    { href: '/goleadores', label: 'Goleadores' },
    { href: '/sponsors', label: 'Sponsors' },
  ]

  // Cerrar menú cuando cambia la ruta
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  // Prevenir scroll del body cuando el menú está abierto
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

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
        className={`md:hidden sticky top-0 z-50 w-full transition-all duration-300 ${
          isMenuOpen ? 'rounded-b-xl overflow-hidden shadow-lg' : 'rounded-b-xl'
        }`}
        style={{ backgroundColor: '#9a2a2e' }}
      >
        <div className="px-4 py-3">
          {/* Header móvil con logo y botón hamburguesa */}
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
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

            {/* Botón hamburguesa */}
            <button
              onClick={toggleMenu}
              className="text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Menú desplegable */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isMenuOpen
              ? 'max-h-[500px] opacity-100'
              : 'max-h-0 opacity-0'
          }`}
        >
          <nav className="px-4 pb-4 space-y-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block text-white text-base font-medium px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-white/20'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </>
  )
}

