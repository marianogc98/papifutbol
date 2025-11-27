// Script para crear usuario administrador
// Ejecutar: node scripts/crear-usuario-admin.js

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🔐 Creando usuario administrador...')

  const adminEmail = 'admin@papifutbol.com'
  const adminPassword = 'admin123'
  const hashedPassword = await bcrypt.hash(adminPassword, 10)

  try {
    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        password: hashedPassword, // Actualizar contraseña si existe
      },
      create: {
        email: adminEmail,
        password: hashedPassword,
        nombre: 'Administrador',
        rol: 'admin',
      },
    })

    console.log('✅ Usuario admin creado/actualizado:')
    console.log(`   Email: ${admin.email}`)
    console.log(`   Nombre: ${admin.nombre}`)
    console.log(`   Rol: ${admin.rol}`)
    console.log(`   Password: ${adminPassword}`)
  } catch (error) {
    console.error('❌ Error al crear usuario:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()

