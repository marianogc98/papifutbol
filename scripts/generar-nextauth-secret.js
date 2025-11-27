// Script para generar NEXTAUTH_SECRET
// Ejecutar: node scripts/generar-nextauth-secret.js

const crypto = require('crypto')

function generarSecret() {
  return crypto.randomBytes(32).toString('base64')
}

const secret = generarSecret()

console.log('='.repeat(60))
console.log('NEXTAUTH_SECRET generado:')
console.log('='.repeat(60))
console.log(secret)
console.log('='.repeat(60))
console.log('')
console.log('Copia este valor y agrégalo a tu archivo .env:')
console.log(`NEXTAUTH_SECRET=${secret}`)
console.log('')
console.log('También asegúrate de tener:')
console.log('NEXTAUTH_URL=http://localhost:3000')
console.log('')

