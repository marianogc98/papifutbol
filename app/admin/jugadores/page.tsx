'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useJugadores, useDeleteJugador, Jugador } from '@/lib/api/jugadores'
import { JugadorForm } from '@/components/admin/JugadorForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Pencil, Trash2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Loader } from '@/components/ui/loader'

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Jugadores</h2>
        {!showForm && (
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-[#852024] hover:bg-[#6a1a1d] text-white"
          >
            Nuevo Jugador
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
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jugadores && jugadores.length > 0 ? (
                    jugadores.map((jugador) => (
                      <TableRow key={jugador.id}>
                        <TableCell className="font-medium">
                          {jugador.nombre} {jugador.apellido}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEdit(jugador)}
                              title="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(jugador.id)}
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center">
                        No hay jugadores registrados
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

