'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useFechas, useDeleteFecha, Fecha } from '@/lib/api/fechas'
import { FechaForm } from '@/components/admin/FechaForm'
import { formatDateUTC } from '@/lib/utils/date'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Pencil, Trash2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Loader } from '@/components/ui/loader'

export default function FechasPage() {
  const pathname = usePathname()
  const [showForm, setShowForm] = useState(false)
  const [editingFecha, setEditingFecha] = useState<Fecha | undefined>()
  const { data: fechas, isLoading } = useFechas()
  const deleteFecha = useDeleteFecha()

  // Cerrar formulario cuando se hace click en el link de navegación
  useEffect(() => {
    const handleNavClick = (e: CustomEvent) => {
      if (e.detail.href === '/admin/fixture') {
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

  // Ordenar fechas del más nuevo al más viejo
  const fechasOrdenadas = useMemo(() => {
    if (!fechas) return []
    return [...fechas].sort((a, b) => {
      // Ordenar por fecha (más nuevo primero)
      const fechaA = new Date(a.fecha).getTime()
      const fechaB = new Date(b.fecha).getTime()
      return fechaB - fechaA
    })
  }, [fechas])

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
        <h2 className="text-2xl font-bold">Fechas</h2>
        {!showForm && (
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-[#852024] hover:bg-[#6a1a1d] text-white"
          >
            Nueva Fecha
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
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fechasOrdenadas && fechasOrdenadas.length > 0 ? (
                    fechasOrdenadas.map((fecha) => (
                      <TableRow key={fecha.id}>
                        <TableCell className="font-medium">
                          {fecha.nombre || `Fecha ${fecha.numero}`}
                        </TableCell>
                        <TableCell>
                          {formatDateUTC(fecha.fecha)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/admin/fixture/${fecha.slug || fecha.id}`}>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8"
                                title="Ver Partidos"
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEdit(fecha)}
                              title="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(fecha.id)}
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
                      <TableCell colSpan={3} className="text-center">
                        No hay fechas registradas
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
