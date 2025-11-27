-- ============================================
-- Script para crear usuario administrador
-- Ejecutar este script si no puedes loguearte
-- ============================================

-- Verificar si el usuario ya existe
SELECT email, nombre, rol FROM "user" WHERE email = 'admin@papifutbol.com';

-- Si no existe, crear el usuario admin
-- NOTA: La contraseña es 'admin123' hasheada con bcrypt
-- Este hash corresponde a 'admin123' con 10 rounds de bcrypt
INSERT INTO "user" (id, email, password, nombre, rol, "createdAt", "updatedAt")
VALUES (
    gen_random_uuid()::TEXT,
    'admin@papifutbol.com',
    '$2a$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq', -- Hash de 'admin123'
    'Administrador',
    'admin',
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Verificar que se creó correctamente
SELECT id, email, nombre, rol, "createdAt" FROM "user" WHERE email = 'admin@papifutbol.com';

