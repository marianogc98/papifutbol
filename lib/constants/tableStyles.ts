/**
 * Estilos estandarizados para tablas públicas
 * Usar estos valores para mantener consistencia en todas las tablas
 */

export const tableStyles = {
  // Tamaños de texto
  text: {
    // Headers
    header: {
      desktop: 'text-xs',
      mobile: 'text-[10px]',
    },
    // Contenido principal (nombres, equipos, etc.)
    content: {
      desktop: 'text-sm',
      mobile: 'text-sm',
    },
    // Información secundaria (números de jugador, partidos jugados, etc.)
    secondary: {
      desktop: 'text-xs',
      mobile: 'text-xs',
    },
    // Números destacados (goles, vidas, puntos)
    highlighted: {
      desktop: 'text-lg',
      mobile: 'text-xl',
    },
    // Títulos de sección
    title: {
      desktop: 'text-3xl',
      mobile: 'text-2xl',
    },
  },

  // Colores
  colors: {
    // Texto principal
    primary: 'text-slate-800',
    // Texto secundario
    secondary: 'text-slate-600',
    // Texto muted
    muted: 'text-slate-500',
    // Color de marca (rojo)
    brand: 'text-[#852024]',
    // Números destacados
    highlighted: 'text-[#852024]',
    // Verde (positivo)
    positive: 'text-green-600',
    // Rojo (negativo)
    negative: 'text-red-600',
    // Amarillo
    warning: 'text-yellow-600',
    // Naranja
    orange: 'text-orange-600',
  },

  // Fondos
  backgrounds: {
    // Fondo de tabla
    table: 'bg-white',
    // Fondo de header
    header: 'bg-[#f3f3f3]',
    // Hover
    hover: 'hover:bg-[#f3f3f3]',
  },

  // Padding
  padding: {
    // Celdas desktop
    cell: {
      desktop: 'px-4 py-3',
      mobile: 'px-2 py-2',
    },
    // Headers
    header: {
      desktop: 'px-4 py-3',
      mobile: 'px-2 py-2',
    },
  },

  // Bordes
  borders: {
    // Borde de tabla
    table: 'border rounded-xl',
    // Borde de fila
    row: 'border-b',
  },

  // Sombras
  shadows: {
    // Sombra de tabla
    table: 'shadow-lg',
    // Sombra de card mobile
    card: 'shadow-sm',
  },
} as const

