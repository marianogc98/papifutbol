-- ============================================
-- Script para verificar usuarios en la base de datos
-- ============================================

-- Verificar que la tabla user existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'user';

-- Ver todos los usuarios
SELECT id, email, nombre, rol, "createdAt" 
FROM "user" 
ORDER BY "createdAt";

-- Contar usuarios
SELECT COUNT(*) as total_usuarios FROM "user";

