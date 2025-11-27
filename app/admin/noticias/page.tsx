'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useNoticias, useDeleteNoticia, Noticia } from '@/lib/api/noticias'
import { NoticiaForm } from '@/components/admin/NoticiaForm'
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

export default function NoticiasPage() {
  const pathname = usePathname()
  const [showForm, setShowForm] = useState(false)
  const [editingNoticia, setEditingNoticia] = useState<Noticia | undefined>()
  const { data: noticias, isLoading } = useNoticias() // Mostrar todas
  const deleteNoticia = useDeleteNoticia()

  // Cerrar formulario cuando se hace click en el link de navegación
  useEffect(() => {
    const handleNavClick = (e: CustomEvent) => {
      if (e.detail.href === '/admin/noticias') {
        setShowForm(false)
        setEditingNoticia(undefined)
      }
    }

    window.addEventListener('admin-nav-click', handleNavClick as EventListener)

    return () => {
      window.removeEventListener('admin-nav-click', handleNavClick as EventListener)
    }
  }, [])

  const handleEdit = (noticia: Noticia) => {
    setEditingNoticia(noticia)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta noticia?')) return

    try {
      await deleteNoticia.mutateAsync(id)
    } catch (error: any) {
      alert(error.message || 'Error al eliminar noticia')
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingNoticia(undefined)
  }

  if (isLoading) {
    return <div>Cargando noticias...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión de Noticias</h2>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            Crear Nueva Noticia
          </Button>
        )}
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingNoticia ? 'Editar Noticia' : 'Nueva Noticia'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <NoticiaForm
              noticia={editingNoticia}
              onSuccess={handleFormSuccess}
            />
          </CardContent>
        </Card>
      )}

      {!showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Lista de Noticias</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Orden</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {noticias && noticias.length > 0 ? (
                  noticias.map((noticia) => (
                    <TableRow key={noticia.id}>
                      <TableCell className="font-medium">
                        {noticia.titulo}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            noticia.tipo === 'urgente' ? 'destructive' :
                            noticia.tipo === 'informacion' ? 'default' :
                            'secondary'
                          }
                        >
                          {noticia.tipo === 'urgente' ? 'Urgente' :
                           noticia.tipo === 'informacion' ? 'Información' :
                           'Otra'}
                        </Badge>
                      </TableCell>
                      <TableCell>{noticia.orden}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(noticia)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(noticia.id)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No hay noticias registradas
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

