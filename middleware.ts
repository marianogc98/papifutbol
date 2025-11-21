import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // Aquí puedes agregar lógica adicional si es necesario
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Proteger rutas /papifutbol/admin
        if (req.nextUrl.pathname.startsWith('/papifutbol/admin')) {
          return !!token
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/papifutbol/admin/:path*'],
}

