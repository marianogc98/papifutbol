'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { usePublicidades, useDeletePublicidad, Publicidad } from '@/lib/api/publicidades'
import { PublicidadForm } from '@/components/admin/PublicidadForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default function PublicidadesPage() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [showForm, setShowForm] = useState(false)
  const [editingPublicidad, setEditingPublicidad] = useState<Publicidad | undefined>()
  // En admin queremos ver todas las publicidades (activas e inactivas)
  const { data: publicidades, isLoading } = usePublicidades(false)
  const deletePublicidad = useDeletePublicidad()

  const isSuperAdmin = session?.user?.role === 'super_admin'

  // Cerrar formulario cuando se hace click en el link de navegación
  useEffect(() => {
    const handleNavClick = (e: CustomEvent) => {
      if (e.detail.href === '/admin/publicidades') {
        setShowForm(false)
        setEditingPublicidad(undefined)
      }
    }

    window.addEventListener('admin-nav-click', handleNavClick as EventListener)

    return () => {
      window.removeEventListener('admin-nav-click', handleNavClick as EventListener)
    }
  }, [])

  const handleEdit = (publicidad: Publicidad) => {
    setEditingPublicidad(publicidad)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta publicidad?')) return

    try {
      await deletePublicidad.mutateAsync(id)
    } catch (error: any) {
      alert(error.message || 'Error al eliminar publicidad')
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingPublicidad(undefined)
  }

  if (isLoading) {
    return <div>Cargando publicidades...</div>
  }

  if (!isSuperAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Acceso Denegado</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">
            No tienes permisos para acceder a esta sección. Se requiere rol de super administrador.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión de Publicidades</h2>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            Crear Nueva Publicidad
          </Button>
        )}
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingPublicidad ? 'Editar Publicidad' : 'Nueva Publicidad'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PublicidadForm
              publicidad={editingPublicidad}
              onSuccess={handleFormSuccess}
            />
          </CardContent>
        </Card>
      )}

      {!showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Lista de Publicidades</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Posición</TableHead>
                  <TableHead>Orden</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {publicidades && publicidades.length > 0 ? (
                  publicidades.map((publicidad) => (
                    <TableRow key={publicidad.id}>
                      <TableCell className="font-medium">
                        {publicidad.titulo}
                      </TableCell>
                      <TableCell>
                        {publicidad.posicion || (
                          <span className="text-muted-foreground">Sin posición</span>
                        )}
                      </TableCell>
                      <TableCell>{publicidad.orden}</TableCell>
                      <TableCell>
                        <Badge variant={publicidad.activa ? 'default' : 'secondary'}>
                          {publicidad.activa ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(publicidad)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(publicidad.id)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No hay publicidades registradas
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

