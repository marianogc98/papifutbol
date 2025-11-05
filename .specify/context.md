# Contexto del Proyecto - PapiFutbol

Este archivo contiene el contexto completo del proyecto para spec-kit.

## 📚 Referencias a Documentación

### Especificación Principal
- **`files/specify.md`** - Especificación consolidada completa del proyecto
- **`files/database-setup.md`** - Guía de configuración de base de datos

## 🎯 Resumen Ejecutivo

**PapiFutbol** es una aplicación web para gestión de un torneo de fútbol 5 con sistema de vidas.

### Características Clave
- Sistema de vidas (no puntos tradicionales)
- Torneo manual (admin carga fecha a fecha)
- Partidos de 20-25 minutos
- Gestión flexible de jugadores
- Todos los partidos en el mismo lugar

### Stack Tecnológico
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes, Prisma ORM
- **Base de Datos:** PostgreSQL
- **Autenticación:** NextAuth.js
- **Estado:** React Query
- **Validación:** Zod + React Hook Form

## 🗄️ Base de Datos

### Modelos Principales
1. **User** - Administradores (email, password, nombre, rol)
2. **Equipo** - Equipos (nombre, escudo, vidas, estado)
3. **Jugador** - Jugadores (nombre, apellido, numero, fechaNac, estado, equipoId)
4. **Fecha** - Fechas del torneo (numero, nombre, desde, hasta)
5. **Partido** - Partidos (fechaId, equipos, resultado, estado)
6. **Gol** - Goles (jugador, minuto, esPenal, esAutogol)
7. **Tarjeta** - Tarjetas (jugador, tipo, minuto, motivo)
8. **Publicidad** - Anuncios (para implementación futura)

### Estados Importantes

**Equipos:** `activo`, `eliminado`, `suspendido`, `descalificado`
**Jugadores:** `activo`, `lesionado`, `suspendido`, `dado_de_baja`
**Partidos:** `pendiente`, `jugado`, `suspendido`, `cancelado`, `no_se_presento_local`, `no_se_presento_visitante`

## 🔑 Reglas de Negocio Críticas

### Sistema de Vidas
- Cada equipo empieza con X vidas (default: 3)
- Al perder: se descuenta 1 vida automáticamente
- Al ganar/empatar: no se descuentan vidas
- Al llegar a 0 vidas: se marca como `eliminado` automáticamente

### Gestión de Jugadores
- Se puede agregar jugador a cualquier equipo sin validar duplicados
- No se registran "transferencias", solo se crea nuevo registro
- Permite que jugadores de equipos eliminados se unan a otros

### Partidos
- Todos en el mismo lugar (no campo estadio)
- Duración: 20-25 minutos (un solo tiempo)
- Fechas libres: equipo puede no tener partido (descanso)
- W.O.: Si no se presenta, resultado automático (0-3 o 3-0) y descuenta vida

### Fechas
- Admin carga fecha a fecha manualmente
- No hay generación automática de fixture

## 📡 Estructura de API

### Endpoints Públicos (GET)
- `/api/equipos` - Lista equipos
- `/api/equipos/[id]` - Detalle equipo
- `/api/jugadores` - Lista jugadores
- `/api/fechas` - Lista fechas
- `/api/partidos` - Lista partidos
- `/api/tabla` - Tabla de vidas calculada
- `/api/goleadores` - Tabla goleadores
- `/api/tarjetas` - Tabla amonestados

### Endpoints Admin (POST/PUT/DELETE - Requieren auth)
- `/api/equipos` - CRUD equipos
- `/api/jugadores` - CRUD jugadores
- `/api/fechas` - CRUD fechas
- `/api/partidos` - CRUD partidos
- `/api/resultados/[partidoId]` - Cargar resultado completo

## 📁 Estructura del Proyecto

```
app/
├── (public)/          # Rutas públicas
│   ├── page.tsx       # Home
│   ├── tabla/         # Tabla de vidas
│   ├── fixture/       # Fixture
│   ├── goleadores/    # Goleadores
│   ├── amonestados/   # Tarjetas
│   ├── equipo/[id]/   # Detalle equipo
│   └── estadisticas/  # Estadísticas
├── (auth)/            # Autenticación
│   └── login/
├── admin/             # Panel admin
│   ├── dashboard/
│   ├── equipos/
│   ├── jugadores/
│   ├── fechas/
│   ├── resultados/
│   └── publicidad/
└── api/               # API Routes
    ├── equipos/
    ├── jugadores/
    ├── fechas/
    ├── partidos/
    ├── resultados/
    ├── tabla/
    ├── goleadores/
    └── tarjetas/

components/
├── layout/            # Navbar, Footer, Sidebar
├── public/            # Componentes vista pública
├── admin/             # Componentes admin
└── ui/                # shadcn/ui

lib/
├── db/prisma.ts       # Cliente Prisma
├── auth/              # NextAuth config
├── api/               # React Query hooks
├── validations/       # Schemas Zod
└── calculations/      # Cálculos (tabla, goleadores)
```

## 🎨 Componentes Clave a Implementar

### Vista Pública
- `TablaDeposiciones` - Tabla ordenada por vidas
- `FixtureCard` - Card de partido
- `FixtureList` - Lista por fecha
- `TablaGoleadores` - Tabla goleadores
- `TablaAmonestados` - Tabla tarjetas
- `EquipoCard` - Card de equipo

### Vista Admin
- `EquipoForm` - Form crear/editar equipo
- `JugadorForm` - Form crear/editar jugador
- `FechaForm` - Form crear/editar fecha
- `PartidoForm` - Form crear/editar partido
- `ResultadoForm` - Form complejo para cargar resultado
- `EquiposTable` - Tabla CRUD equipos
- `JugadoresTable` - Tabla CRUD jugadores

## 🔐 Autenticación

- **Proveedor:** NextAuth.js con Credentials
- **Rutas protegidas:** `/admin/*`
- **Middleware:** Verificación en `app/admin/layout.tsx`

## 📊 Cálculos Importantes

### Tabla de Vidas
- Orden: vidas DESC, partidos jugados ASC, diferencia DESC, goles a favor DESC
- Equipos con 0 vidas al final

### Goleadores
- Excluir autogoles
- Contar penales por separado
- Orden: total goles DESC, apellido ASC

### Tarjetas
- Puntos: amarilla = 1, roja = 3
- Orden: puntos DESC, rojas DESC, amarillas DESC

## ⚠️ Validaciones Críticas

- Nombre equipo único
- Número jugador único por equipo
- Equipo local ≠ visitante
- Suma de goles debe coincidir
- Al perder: descontar vida automáticamente
- Al llegar a 0 vidas: marcar como eliminado

## 🚀 Flujos Principales

1. **Admin carga resultado:**
   - Selecciona partido → Estado → Goles/Tarjetas → Guardar
   - Sistema descuenta vida si corresponde
   - Tabla se actualiza automáticamente

2. **Usuario consulta:**
   - Ve tabla de vidas → Click equipo → Detalle completo
   - Ve fixture con fechas libres y W.O.

3. **Admin crea fecha:**
   - Crea fecha → Agrega partidos uno por uno (manual)
   - Puede dejar equipos sin partido

## 🛠️ Configuración de Despliegue

- **Docker:** Dockerfile y docker-compose.yml configurados
- **Nginx:** Configurado como reverse proxy
- **SSL:** Let's Encrypt (certbot)
- **Scripts:** deploy.sh y backup.sh disponibles

## 📝 Notas de Implementación

- **Simplicidad:** Formularios simples y directos para el admin
- **Publicidad:** No prioridad, implementar después
- **Performance:** Cache React Query, cálculos en servidor
- **Validación dual:** Cliente (Zod) y servidor

## 🔗 Archivos de Referencia

Para más detalles, consultar:
- `files/specify.md` - Especificación completa
- `files/database-setup.md` - Setup de BD
- `package.json` - Dependencias
- `docker-compose.yml` - Configuración Docker
- `README.md` - Documentación general

