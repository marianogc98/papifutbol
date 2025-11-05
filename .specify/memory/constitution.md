# PapiFutbol Constitution

## Core Principles

### I. Simplicidad ante todo
El administrador debe poder usar el sistema sin capacitación. Interfaz simple, directa y clara. No sobre-ingeniería. Formularios simples con validaciones claras.

### II. Sistema de Vidas (No Puntos Tradicionales)
Este torneo NO usa sistema de puntos tradicional. Usa sistema de vidas donde:
- Cada equipo empieza con X vidas (default: 3)
- Al perder: se descuenta 1 vida automáticamente
- Al ganar/empatar: NO se descuentan vidas
- Al llegar a 0 vidas: se marca como `eliminado` automáticamente

### III. Torneo Manual (No Generación Automática)
El admin carga fecha a fecha los cruces manualmente. NO hay generación automática de fixture. El admin crea fecha → agrega partidos uno por uno. Puede dejar equipos sin partido (fecha libre).

### IV. Flexibilidad de Jugadores
Un jugador puede agregarse a cualquier equipo sin validar si ya existía en otro. NO se registran "transferencias". Simplemente se crea nuevo registro Jugador con nuevo equipoId. Esto permite que jugadores de equipos eliminados se unan a otros equipos.

### V. Validación Dual (Cliente + Servidor)
TODA validación debe hacerse en cliente (para UX) Y en servidor (para seguridad). Usar Zod tanto en React Hook Form como en API Routes.

## Technology Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Database:** PostgreSQL con Prisma ORM
- **Auth:** NextAuth.js
- **UI:** Tailwind CSS + shadcn/ui
- **Validation:** Zod + React Hook Form
- **State:** React Query (TanStack Query)
- **Deployment:** VPS con Docker + Nginx

## Development Rules

### Code Standards
- TypeScript estricto siempre
- ESLint configurado
- Componentes pequeños y reutilizables
- Funciones puras cuando sea posible
- Comentarios solo donde sea necesario

### Database
- Usar Prisma para TODAS las operaciones
- Transacciones para operaciones críticas
- Validaciones con constraints en PostgreSQL
- Backups regulares

### API
- RESTful con Next.js API Routes
- Autenticación requerida para POST/PUT/DELETE
- Respuestas consistentes: { data, error?, code? }
- Validación con Zod en todas las rutas

### UI/UX
- Componentes shadcn/ui para consistencia
- Loading states en TODAS las operaciones
- Toast notifications para feedback
- Confirmaciones en operaciones destructivas
- Responsive design (mobile-first)

### Performance
- Cálculos SIEMPRE en servidor (API routes)
- Cache con React Query (tabla 5min, goleadores 5min, fixture 1min)
- Invalidar cache al actualizar datos
- Optimización de imágenes con Next.js Image

## Business Rules

### Sistema de Vidas
- Descontar vida automáticamente al perder partido
- Marcar como `eliminado` automáticamente al llegar a 0 vidas
- Equipos eliminados se muestran al final de la tabla

### Partidos
- Todos en el mismo lugar (no campo estadio)
- Duración: 20-25 minutos (un solo tiempo)
- Fechas libres son válidas
- W.O.: Si no se presenta, resultado automático (0-3 o 3-0) y descuenta vida

### Estados
- Equipos: activo, eliminado, suspendido, descalificado
- Jugadores: activo, lesionado, suspendido, dado_de_baja
- Partidos: pendiente, jugado, suspendido, cancelado, no_se_presento_local, no_se_presento_visitante

## What NOT to Do

- ❌ NO generar fixture automáticamente
- ❌ NO validar transferencias de jugadores
- ❌ NO usar sistema de puntos tradicional
- ❌ NO agregar campos innecesarios (estadio, fundación, colores, posición)
- ❌ NO hacer la interfaz compleja
- ❌ NO calcular en cliente (solo en servidor)
- ❌ NO implementar publicidad ahora (prioridad baja)

## What TO Do

- ✅ Simplificar todo lo posible
- ✅ Validar en cliente Y servidor
- ✅ Feedback inmediato al usuario
- ✅ Cálculos automáticos (vidas, tabla, goleadores)
- ✅ Manejo de errores claro
- ✅ Documentación en código
- ✅ Testing básico de funcionalidades críticas

## Development Phases

1. **Fase 1:** Autenticación + CRUD básico (Equipos, Jugadores)
2. **Fase 2:** Fechas y Partidos manuales
3. **Fase 3:** Cargar resultados + sistema de vidas
4. **Fase 4:** Vistas públicas (tabla, fixture, goleadores)
5. **Fase 5:** Polish, optimizaciones, deploy

## Governance

- Esta constitución define las reglas fundamentales del proyecto
- Todas las decisiones deben alinearse con estos principios
- Cambios a la constitución requieren justificación clara
- Simplicidad > Complejidad siempre
- Usabilidad del admin es prioridad

**Version**: 1.0.0 | **Ratified**: 2024-12-19 | **Last Amended**: 2024-12-19
