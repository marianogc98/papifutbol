import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ReactNode } from 'react'

interface CardTableProps {
  title?: string
  subtitle?: string
  children: ReactNode
  emptyMessage?: string
  isEmpty?: boolean
}

/**
 * Componente de tabla con diseño de Cards (estilo de fechas)
 * Usa fondo #f3f3f3 para las filas
 */
export function CardTable({
  title,
  subtitle,
  children,
  emptyMessage = 'No hay datos disponibles',
  isEmpty = false,
}: CardTableProps) {
  return (
    <Card>
      {(title || subtitle) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </CardHeader>
      )}
      <CardContent>
        {isEmpty ? (
          <p className="text-muted-foreground text-center py-4">{emptyMessage}</p>
        ) : (
          <div className="space-y-4">{children}</div>
        )}
      </CardContent>
    </Card>
  )
}

interface CardTableRowProps {
  children: ReactNode
  className?: string
}

/**
 * Fila de la tabla con fondo #f3f3f3
 */
export function CardTableRow({ children, className = '' }: CardTableRowProps) {
  return (
    <div
      className={`flex items-center justify-between p-4 border rounded-lg ${className}`}
      style={{ backgroundColor: '#f3f3f3' }}
    >
      {children}
    </div>
  )
}










