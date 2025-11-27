import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { generarSlug, generarSlugUnico } from '../lib/utils/slug'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // Crear usuario admin por defecto
  const adminEmail = 'admin@papifutbol.com'
  const adminPassword = await bcrypt.hash('admin123', 10)

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: adminPassword,
      nombre: 'Administrador',
      rol: 'admin',
    },
  })

  console.log('✅ Usuario admin creado:', admin.email)

  // Crear algunos equipos de ejemplo
  const equipos = [
    { nombre: 'Equipo A', vidas: 2, estado: 'activo' },
    { nombre: 'Equipo B', vidas: 2, estado: 'activo' },
    { nombre: 'Equipo C', vidas: 2, estado: 'activo' },
    { nombre: 'Equipo D', vidas: 2, estado: 'activo' },
  ]

  for (const equipoData of equipos) {
    // Generar slug único
    const slug = await generarSlugUnico(
      equipoData.nombre,
      async (slug) => {
        const existe = await prisma.equipo.findUnique({ where: { slug } })
        return !!existe
      }
    )

    const equipo = await prisma.equipo.upsert({
      where: { nombre: equipoData.nombre },
      update: {},
      create: {
        ...equipoData,
        slug,
      },
    })
    console.log(`✅ Equipo creado: ${equipo.nombre} (slug: ${equipo.slug})`)
  }

  // Crear algunos jugadores de ejemplo
  const jugadores = [
    { nombre: 'Juan', apellido: 'Pérez', numero: 10, equipoNombre: 'Equipo A', estado: 'activo' },
    { nombre: 'Carlos', apellido: 'García', numero: 7, equipoNombre: 'Equipo A', estado: 'activo' },
    { nombre: 'Luis', apellido: 'Martínez', numero: 9, equipoNombre: 'Equipo B', estado: 'activo' },
    { nombre: 'Pedro', apellido: 'Rodríguez', numero: 11, equipoNombre: 'Equipo B', estado: 'activo' },
  ]

  for (const jugadorData of jugadores) {
    const equipo = await prisma.equipo.findUnique({
      where: { nombre: jugadorData.equipoNombre },
    })

    if (equipo) {
      const jugador = await prisma.jugador.create({
        data: {
          nombre: jugadorData.nombre,
          apellido: jugadorData.apellido,
          numero: jugadorData.numero,
          estado: jugadorData.estado,
          equipoId: equipo.id,
        },
      })
      console.log(`✅ Jugador creado: ${jugador.nombre} ${jugador.apellido}`)
    }
  }

  console.log('✅ Seed completado exitosamente!')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

