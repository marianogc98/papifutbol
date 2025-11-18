'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEquipos, useDeleteEquipo, Equipo } from '@/lib/api/equipos'
import { EquipoForm } from '@/components/admin/EquipoForm'
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

export default function EquiposPage() {
  const pathname = usePathname()
  const [showForm, setShowForm] = useState(false)
  const [editingEquipo, setEditingEquipo] = useState<Equipo | undefined>()
  const { data: equipos, isLoading } = useEquipos()
  const deleteEquipo = useDeleteEquipo()

  // Cerrar formulario cuando se hace click en el link de navegación
  useEffect(() => {
    const handleNavClick = (e: CustomEvent) => {
      if (e.detail.href === '/admin/equipos') {
        setShowForm(false)
        setEditingEquipo(undefined)
      }
    }

    window.addEventListener('admin-nav-click', handleNavClick as EventListener)

    return () => {
      window.removeEventListener('admin-nav-click', handleNavClick as EventListener)
    }
  }, [])

  const handleEdit = (equipo: Equipo) => {
    setEditingEquipo(equipo)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este equipo?')) return

    try {
      await deleteEquipo.mutateAsync(id)
    } catch (error: any) {
      alert(error.message || 'Error al eliminar equipo')
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingEquipo(undefined)
  }

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      activo: 'default',
      eliminado: 'destructive',
      suspendido: 'secondary',
      descalificado: 'destructive',
    }
    return variants[estado] || 'outline'
  }

  if (isLoading) {
    return <div>Cargando equipos...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión de Equipos</h2>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            Crear Nuevo Equipo
          </Button>
        )}
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingEquipo ? 'Editar Equipo' : 'Nuevo Equipo'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EquipoForm
              equipo={editingEquipo}
              onSuccess={handleFormSuccess}
            />
          </CardContent>
        </Card>
      )}

      {!showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Lista de Equipos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Vidas</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Jugadores</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {equipos && equipos.length > 0 ? (
                  equipos.map((equipo) => (
                    <TableRow key={equipo.id}>
                      <TableCell className="font-medium">
                        {equipo.nombre}
                      </TableCell>
                      <TableCell>{equipo.vidas}</TableCell>
                      <TableCell>
                        <Badge variant={getEstadoBadge(equipo.estado)}>
                          {equipo.estado}
                        </Badge>
                      </TableCell>
                      <TableCell>{equipo._count?.jugadores || 0}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/equipos/${equipo.id}`}>
                            <Button variant="outline" size="sm">
                              Ver Detalle
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(equipo)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(equipo.id)}
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
                      No hay equipos registrados
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

