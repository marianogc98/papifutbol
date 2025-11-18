import { getServerSession } from 'next-auth'
import { authOptions } from './config'

export async function getSession() {
  return await getServerSession(authOptions)
}

export async function getCurrentUser() {
  const session = await getSession()
  return session?.user
}

export async function isSuperAdmin() {
  const session = await getSession()
  return session?.user?.role === 'super_admin'
}

export async function requireSuperAdmin() {
  const session = await getSession()
  if (!session) {
    throw new Error('No autorizado')
  }
  if (session.user?.role !== 'super_admin') {
    throw new Error('Acceso denegado. Se requiere rol de super administrador')
  }
  return session
}

