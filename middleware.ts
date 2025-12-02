import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // Si está en /admin exactamente, permitir acceso (es la página de login)
    if (req.nextUrl.pathname === '/admin') {
      return NextResponse.next()
    }
    // Para todas las demás rutas /admin/*, verificar autenticación
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Permitir acceso a /admin (página de login) sin autenticación
        if (req.nextUrl.pathname === '/admin') {
          return true
        }
        // Proteger todas las demás rutas /admin/*
        if (req.nextUrl.pathname.startsWith('/admin/')) {
          return !!token
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/admin/:path*', '/admin'],
}

