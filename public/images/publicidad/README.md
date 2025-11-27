# Imágenes de Publicidad

Esta carpeta es para almacenar las imágenes de publicidad que se mostrarán en el sitio web.

## Cómo usar imágenes locales

1. **Coloca tus imágenes** en esta carpeta (`public/images/publicidad/`)

2. **Al crear o editar una publicidad** en el panel de administración, usa la ruta relativa:
   ```
   /images/publicidad/nombre-de-tu-imagen.jpg
   ```

3. **Ejemplos de rutas válidas:**
   - `/images/publicidad/banner-principal.jpg`
   - `/images/publicidad/promocion-verano.png`
   - `/images/publicidad/patrocinador-logo.svg`

## Formatos soportados

- JPG/JPEG
- PNG
- GIF
- SVG
- WebP

## Tamaños recomendados

- **Banner principal**: 1200x300px o similar
- **Sidebar**: 300x250px o similar
- **Header/Footer**: 1200x100px o similar

## Nota

- Las imágenes deben tener nombres descriptivos y sin espacios (usa guiones o guiones bajos)
- Las rutas deben empezar con `/` para que Next.js las reconozca como archivos locales
- También puedes usar URLs externas (https://...) si prefieres alojar las imágenes en otro servidor

