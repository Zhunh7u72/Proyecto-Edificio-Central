# Proyecto Edificio Central — FEUE UTN

Proyecto web para la Federación de Estudiantes Universitarios del Ecuador — Universidad Técnica del Norte.

## Stack Tecnológico

- **Framework:** Next.js 16 (App Router + Turbopack)
- **Base de datos:** Supabase (PostgreSQL + Storage)
- **Autenticación:** JWT con `jose` + `bcryptjs`
- **Estilos:** CSS Modules + Diseño Institucional UTN

## Inicio Rápido

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con las credenciales de Supabase

# Desarrollo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

## Estructura del Proyecto

```
src/
├── app/
│   ├── (public)/        # Rutas públicas (Inicio, Historial, Institucional, Eventos)
│   ├── admin/           # Panel de administración (Dashboard, CRUD)
│   ├── api/             # Endpoints API (descarga PDFs)
│   └── actions/         # Server Actions (inscripciones, actividades, etc.)
├── components/          # Componentes reutilizables (Header, Footer, Cards, etc.)
└── lib/                 # Utilidades (Supabase client, sesiones, configuración)
```

## Funcionalidades Principales

- **Carrusel + Panel lateral** con los últimos eventos
- **Cartelera de actividades** del mes en tarjetas
- **Inscripción a eventos** con subida de PDFs protegidos
- **Historial** con filtros por año, mes y semana
- **Sección institucional** (Gobierno, Cogobierno, Asociaciones)
- **Comentarios** en texto plano
- **Panel de administración** completo con CRUD
