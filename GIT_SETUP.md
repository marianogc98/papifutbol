# Configuración de Git Remoto

El repositorio local está inicializado y tiene el commit inicial. Para subirlo a un remoto:

## Opción 1: GitHub

### 1. Crear repositorio en GitHub
- Ve a https://github.com/new
- Nombre: `papifutbol` (o el que prefieras)
- **NO** inicialices con README, .gitignore o licencia (ya los tenemos)
- Click en "Create repository"

### 2. Conectar remoto y hacer push

```bash
# Agregar remoto (reemplaza con tu usuario y nombre de repo)
git remote add origin https://github.com/marianogc98/papifutbol.git

# O si usas SSH:
git remote add origin git@github.com:TU-USUARIO/papifutbol.git

# Cambiar rama a main (si no está ya)
git branch -M main

# Hacer push
git push -u origin main
```

## Opción 2: GitLab

### 1. Crear proyecto en GitLab
- Ve a tu GitLab y crea un nuevo proyecto
- Nombre: `papifutbol`
- **NO** inicialices con README

### 2. Conectar remoto y hacer push

```bash
git remote add origin https://github.com/marianogc98/papifutbol.git
git branch -M main
git push -u origin main
```

## Opción 3: Otro servidor Git

```bash
git remote add origin URL_DEL_REPOSITORIO
git branch -M main
git push -u origin main
```

## Verificar configuración

```bash
# Ver remotos configurados
git remote -v

# Ver estado
git status

# Ver commits
git log --oneline
```

## Comandos útiles

```bash
# Ver cambios
git status

# Agregar cambios
git add .

# Commit
git commit -m "Descripción del cambio"

# Push
git push

# Pull
git pull
```

