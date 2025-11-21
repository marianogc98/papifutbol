'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useFechas, useDeleteFecha, Fecha } from '@/lib/api/fechas'
import { FechaForm } from '@/components/admin/FechaForm'
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

export default function FechasPage() {
  const pathname = usePathname()
  const [showForm, setShowForm] = useState(false)
  const [editingFecha, setEditingFecha] = useState<Fecha | undefined>()
  const { data: fechas, isLoading } = useFechas()
  const deleteFecha = useDeleteFecha()

  // Cerrar formulario cuando se hace click en el link de navegación
  useEffect(() => {
    const handleNavClick = (e: CustomEvent) => {
      if (e.detail.href === '/admin/fechas') {
        setShowForm(false)
        setEditingFecha(undefined)
      }
    }

    window.addEventListener('admin-nav-click', handleNavClick as EventListener)

    return () => {
      window.removeEventListener('admin-nav-click', handleNavClick as EventListener)
    }
  }, [])

  const handleEdit = (fecha: Fecha) => {
    setEditingFecha(fecha)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta fecha?')) return

    try {
      await deleteFecha.mutateAsync(id)
    } catch (error: any) {
      alert(error.message || 'Error al eliminar fecha')
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingFecha(undefined)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR')
  }

  if (isLoading) {
    return <div>Cargando fechas...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión de Fechas</h2>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            Crear Nueva Fecha
          </Button>
        )}
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingFecha ? 'Editar Fecha' : 'Nueva Fecha'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FechaForm
              fecha={editingFecha}
              onSuccess={handleFormSuccess}
            />
          </CardContent>
        </Card>
      )}

      {!showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Lista de Fechas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Partidos</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fechas && fechas.length > 0 ? (
                  fechas.map((fecha) => (
                    <TableRow key={fecha.id}>
                      <TableCell className="font-medium">
                        Fecha {fecha.numero}
                      </TableCell>
                      <TableCell>{fecha.nombre || '-'}</TableCell>
                      <TableCell>{formatDate(fecha.fecha)}</TableCell>
                      <TableCell>{fecha._count?.partidos || 0}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/fechas/${fecha.id}`}>
                            <Button variant="outline" size="sm">
                              Ver Partidos
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(fecha)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(fecha.id)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No hay fechas registradas
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

