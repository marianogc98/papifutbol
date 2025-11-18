'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useJugadores, useDeleteJugador, Jugador } from '@/lib/api/jugadores'
import { JugadorForm } from '@/components/admin/JugadorForm'
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

export default function JugadoresPage() {
  const pathname = usePathname()
  const [showForm, setShowForm] = useState(false)
  const [editingJugador, setEditingJugador] = useState<Jugador | undefined>()
  const { data: jugadores, isLoading } = useJugadores()
  const deleteJugador = useDeleteJugador()

  // Cerrar formulario cuando se hace click en el link de navegación
  useEffect(() => {
    const handleNavClick = (e: CustomEvent) => {
      if (e.detail.href === '/admin/jugadores') {
        setShowForm(false)
        setEditingJugador(undefined)
      }
    }

    window.addEventListener('admin-nav-click', handleNavClick as EventListener)

    return () => {
      window.removeEventListener('admin-nav-click', handleNavClick as EventListener)
    }
  }, [])

  const handleEdit = (jugador: Jugador) => {
    setEditingJugador(jugador)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este jugador?')) return

    try {
      await deleteJugador.mutateAsync(id)
    } catch (error: any) {
      alert(error.message || 'Error al eliminar jugador')
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingJugador(undefined)
  }

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      activo: 'default',
      lesionado: 'secondary',
      suspendido: 'secondary',
      dado_de_baja: 'destructive',
    }
    return variants[estado] || 'outline'
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('es-AR')
  }

  if (isLoading) {
    return <div>Cargando jugadores...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión de Jugadores</h2>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            Crear Nuevo Jugador
          </Button>
        )}
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingJugador ? 'Editar Jugador' : 'Nuevo Jugador'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <JugadorForm
              jugador={editingJugador}
              onSuccess={handleFormSuccess}
            />
          </CardContent>
        </Card>
      )}

      {!showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Lista de Jugadores</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Apellido</TableHead>
                  <TableHead>Número</TableHead>
                  <TableHead>Equipo</TableHead>
                  <TableHead>Fecha Nac.</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jugadores && jugadores.length > 0 ? (
                  jugadores.map((jugador) => (
                    <TableRow key={jugador.id}>
                      <TableCell className="font-medium">
                        {jugador.nombre}
                      </TableCell>
                      <TableCell>{jugador.apellido}</TableCell>
                      <TableCell>{jugador.numero || '-'}</TableCell>
                      <TableCell>
                        {jugador.equipo?.nombre || 'Sin equipo'}
                      </TableCell>
                      <TableCell>{formatDate(jugador.fechaNac)}</TableCell>
                      <TableCell>
                        <Badge variant={getEstadoBadge(jugador.estado)}>
                          {jugador.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(jugador)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(jugador.id)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      No hay jugadores registrados
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

