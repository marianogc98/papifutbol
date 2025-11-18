# Sistema de Subida de Imágenes

Este directorio contiene las imágenes subidas por los administradores del sistema.

## Estructura

```
uploads/
  equipos/      # Escudos de equipos (admin/superadmin)
  jugadores/    # Fotos de jugadores (admin/superadmin)
  publicidades/ # Imágenes de publicidad (solo superadmin)
```

## Características

- **Reemplazo automático**: Si se sube una nueva imagen sobre una existente, la anterior se elimina automáticamente
- **Nombres únicos**: Los archivos se renombran con timestamp + hash para evitar colisiones
- **Validación**: Solo se permiten imágenes JPG, PNG y WebP (máximo 5MB)
- **Limpieza automática**: Las imágenes se eliminan cuando se borra la entidad asociada

## Nota para Producción

En producción (VPS), asegúrate de:
1. Configurar permisos de escritura para el usuario que ejecuta la aplicación
2. Incluir esta carpeta en los backups
3. Considerar usar un volumen persistente en Docker si aplica

