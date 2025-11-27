# PapiFutbol - Sistema de Gestión de Torneo de Fútbol 5

Aplicación web para gestión y visualización de un torneo de fútbol 5 con sistema de vidas.

## 🚀 Características

- **Sistema de vidas:** Cada equipo empieza con X vidas que se descuentan al perder
- **Torneo manual:** Admin carga fecha a fecha los cruces (no generación automática)
- **Partidos:** 20-25 minutos (un solo tiempo)
- **Gestión flexible:** Equipos pueden agregar/eliminar jugadores durante el torneo
- **Ubicación única:** Todos los partidos se juegan en el mismo lugar

## 🛠️ Stack Tecnológico

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes, Prisma ORM
- **Base de Datos:** PostgreSQL
- **Autenticación:** NextAuth.js
- **Validación:** Zod + React Hook Form
- **Estado:** React Query

## 📋 Requisitos Previos

- Node.js 18+ y npm
- Docker y Docker Compose (para producción)
- PostgreSQL 12+ (si no usas Docker)

## 🚀 Instalación Local

```bash
# Clonar repositorio
git clone <repo-url>
cd papiFutbol

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# Configurar base de datos (ver files/database-setup.md)
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed

# Ejecutar en desarrollo
npm run dev
```

## 🐳 Despliegue en VPS con Docker

### 1. Preparar servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo apt install docker-compose -y

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER
```

### 2. Configurar proyecto

```bash
# Clonar proyecto en el servidor
git clone <repo-url> /opt/papifutbol
cd /opt/papifutbol

# Crear archivo .env
cp .env.example .env
nano .env
# Configurar DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET, etc.
```

### 3. Configurar SSL con Let's Encrypt

```bash
# Instalar Certbot
sudo apt install certbot -y

# Obtener certificados (reemplazar tu-dominio.com)
sudo certbot certonly --standalone -d tu-dominio.com

# Copiar certificados al directorio del proyecto
sudo cp /etc/letsencrypt/live/tu-dominio.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/tu-dominio.com/privkey.pem nginx/ssl/
sudo chmod 644 nginx/ssl/*.pem
```

### 4. Construir y ejecutar

```bash
# Construir imágenes
docker-compose build

# Ejecutar migraciones
docker-compose run app npx prisma migrate deploy

# (Opcional) Cargar datos de prueba
docker-compose run app npm run db:seed

# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f
```

### 5. Configurar renovación automática de SSL

```bash
# Agregar al crontab
sudo crontab -e
# Agregar línea:
0 3 * * * certbot renew --quiet --deploy-hook "cd /opt/papifutbol && docker-compose restart nginx"
```

## 📝 Comandos Útiles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo
npm run build            # Build de producción
npm run start            # Servidor de producción

# Base de datos
npm run prisma:generate  # Generar Prisma Client
npm run prisma:migrate   # Crear migración
npm run db:seed          # Cargar datos de prueba
npm run db:migrate       # Aplicar migraciones (producción)

# Docker
docker-compose up -d     # Iniciar servicios
docker-compose down      # Detener servicios
docker-compose logs -f   # Ver logs
docker-compose restart   # Reiniciar servicios
docker-compose exec app npm run db:migrate  # Ejecutar migraciones
```

## 🔧 Configuración

### Variables de Entorno

Ver `.env.example` para todas las variables necesarias.

**Importante:**
- Generar `NEXTAUTH_SECRET` con: `openssl rand -base64 32`
- Configurar `NEXTAUTH_URL` con tu dominio completo (https://)
- Configurar `DATABASE_URL` correctamente

### Base de Datos

Ver `files/database-setup.md` para instrucciones detalladas.

## 📚 Documentación

- `files/specify.md` - Especificación completa del proyecto
- `files/database-setup.md` - Guía de configuración de base de datos

## 🔐 Credenciales por Defecto

Después de ejecutar el seed:
- **Email:** `admin@torneo.com`
- **Password:** `admin123`

⚠️ **IMPORTANTE:** Cambiar estas credenciales en producción.

## 🛡️ Seguridad

- Cambiar credenciales por defecto
- Usar HTTPS (SSL/TLS)
- Mantener dependencias actualizadas
- Configurar firewall en el VPS
- Hacer backups regulares de la base de datos

## 📦 Backup de Base de Datos

```bash
# Backup manual
docker-compose exec postgres pg_dump -U postgres papifutbol > backup_$(date +%Y%m%d).sql

# Restore
docker-compose exec -T postgres psql -U postgres papifutbol < backup_20240101.sql
```

## 🐛 Troubleshooting

### Error de conexión a base de datos
- Verificar que PostgreSQL esté corriendo: `docker-compose ps`
- Verificar variables de entorno en `.env`
- Verificar logs: `docker-compose logs postgres`

### Error de migraciones
```bash
docker-compose exec app npm run db:migrate
```

### Reiniciar todo
```bash
docker-compose down
docker-compose up -d --build
```

## 📄 Licencia

Privado - Uso interno

## 👥 Soporte

Para problemas o consultas, revisar la documentación en `files/`.

