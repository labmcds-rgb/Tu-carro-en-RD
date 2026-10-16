# TU CARRO EN RD · App de renta de vehículos

App móvil real construida con **React + Vite + TypeScript + Supabase**.
Convertida desde el prototipo (conservado en [`_prototipo/`](./_prototipo)).

## Puesta en marcha (una sola vez)

### 1) Credenciales de Supabase
En el dashboard de Supabase → **Project Settings → API**, copia:
- **Project URL** (ej. `https://abcd1234.supabase.co`)
- **anon public** key (la pública, **NO** la `service_role`)

Pégalas en el archivo **`.env.local`**:

```
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### 2) Crear las tablas en la base de datos (Supabase CLI)
Ejecuta en la carpeta del proyecto (te pedirá abrir el navegador para autorizar):

```bash
npx supabase login
npx supabase link --project-ref TU_PROJECT_REF
npx supabase db push
```

> El **PROJECT_REF** es la parte antes de `.supabase.co` en tu Project URL
> (también aparece en **Project Settings → General → Reference ID**).
> `db push` aplica las migraciones de [`supabase/migrations`](./supabase/migrations):
> crea las tablas `profiles`, `cars`, `bookings`, la seguridad (RLS), el trigger
> de nuevo usuario, y **carga los 8 carros de la flota** de ejemplo.

### 3) Autenticación
En **Authentication → Providers**:
- **Email**: ya viene activo. Para pruebas rápidas puedes desactivar
  *"Confirm email"* (en **Authentication → Sign In / Providers → Email**)
  para entrar sin confirmar por correo.
- **Google** (opcional): actívalo y pega el *Client ID* y *Client Secret* de
  Google Cloud Console. En Google, agrega como URI de redirección autorizado:
  `https://TU-PROYECTO.supabase.co/auth/v1/callback`

En **Authentication → URL Configuration**, agrega a *Redirect URLs*:
`http://localhost:5173`

### 3b) Correos vía Resend (SMTP)
Para que los correos de cuenta (confirmación, recuperar contraseña) salgan por
**Resend**, en **Authentication → Emails → SMTP Settings** activa *Custom SMTP*:

| Campo | Valor |
|---|---|
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | tu API key de Resend (`re_...`) |
| Sender email | `onboarding@resend.dev` (prueba) o `no-reply@tudominio.com` (con dominio verificado) |
| Sender name | `TU CARRO EN RD` |

> La API key de Resend **NUNCA** va en `.env.local` ni en el frontend: solo aquí
> (lado servidor). Para enviar a cualquier correo, verifica un dominio en Resend.

### 4) Correr la app
```bash
npm run dev
```
Abre http://localhost:5173

## Estructura

```
src/
  context/     AuthContext, UIContext (toasts/sheets), CarsContext
  screens/     Login, Home, Catalog, CarDetail, Booking, Success, Trips, Profile
  components/  AppShell, TabBar, CarCard, CarArt, ChipRow, icons, sheets/
  lib/         supabase, format, filters
  data/        constants (categorías, extras, horas, zonas)
supabase/
  migrations/  20260819120000_init.sql, 20260819120100_seed_cars.sql
```

## Scripts
- `npm run dev` — servidor de desarrollo
- `npm run build` — compila para producción (carpeta `dist/`)
- `npm run preview` — sirve la build de producción
