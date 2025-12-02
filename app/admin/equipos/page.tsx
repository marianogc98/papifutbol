'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEquipos, useDeleteEquipo, Equipo } from '@/lib/api/equipos'
import { EquipoForm } from '@/components/admin/EquipoForm'
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


  if (isLoading) {
    return <div>Cargando equipos...</div>
  }

  // Ordenar equipos por vidas (mayor a menor)
  const equiposOrdenados = equipos ? [...equipos].sort((a, b) => b.vidas - a.vidas) : []

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Equipos</h2>
        {!showForm && (
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-[#852024] hover:bg-[#6a1a1d] text-white"
          >
            Nuevo Equipo
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
                  {equiposOrdenados.length > 0 ? (
                    equiposOrdenados.map((equipo) => (
                      <TableRow key={equipo.id}>
                        <TableCell className="font-medium">
                          {equipo.nombre}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/admin/equipos/${equipo.slug || equipo.id}`}>
                              <Button 
                                variant="outline" 
                                size="icon"
                                className="h-8 w-8"
                                title="Ver Detalle"
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEdit(equipo)}
                              title="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleDelete(equipo.id)}
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
                        No hay equipos registrados
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

