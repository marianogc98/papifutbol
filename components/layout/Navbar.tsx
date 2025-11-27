'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'

export function Navbar() {
  const { data: session } = useSession()
  const isAdmin = !!session

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xl font-bold">
              PapiFutbol
            </Link>
            <div className="hidden md:flex items-center gap-4">
              <Link href="/tabla" className="text-sm hover:text-primary transition-colors">
                Tabla
              </Link>
              <Link href="/fechas" className="text-sm hover:text-primary transition-colors">
                Fechas
              </Link>
              <Link href="/goleadores" className="text-sm hover:text-primary transition-colors">
                Goleadores
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isAdmin ? (
              <>
                <Link href="/admin" className="text-sm hover:text-primary transition-colors">
                  Admin
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  Salir
                </Button>
              </>
            ) : (
              <Link href="/login" className="text-sm hover:text-primary transition-colors">
                Admin
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

