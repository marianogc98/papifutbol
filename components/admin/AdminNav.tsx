'use client'

import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

export function AdminNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const isSuperAdmin = session?.user?.role === 'super_admin'

  // Función para manejar clicks en los links
  const handleNavClick = (href: string, e: React.MouseEvent) => {
    // Si ya estamos en esa ruta exacta, disparar evento para cerrar formularios
    if (pathname === href) {
      e.preventDefault()
      // Disparar evento custom que las páginas pueden escuchar
      window.dispatchEvent(new CustomEvent('admin-nav-click', { detail: { href } }))
    }
  }

  const navLinks = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/equipos', label: 'Equipos' },
    { href: '/admin/jugadores', label: 'Jugadores' },
    { href: '/admin/fechas', label: 'Fechas' },
    { href: '/admin/partidos', label: 'Partidos' },
    { href: '/admin/noticias', label: 'Noticias' },
    { href: '/admin/publicidades', label: 'Publicidades', requiresSuperAdmin: true },
  ]

  return (
    <nav className="mb-6 border-b">
      <div className="flex gap-4">
        {navLinks
          .filter((link) => !link.requiresSuperAdmin || isSuperAdmin)
          .map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(link.href, e)}
                className={`px-4 py-2 text-sm hover:text-primary transition-colors border-b-2 ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent hover:border-primary'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
      </div>
    </nav>
  )
}

