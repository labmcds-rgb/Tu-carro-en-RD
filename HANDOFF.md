# HANDOFF — TU CARRO EN RD

> Documento para retomar el contexto rápido en una sesión nueva. Última actualización: 2026-10-12.

## Qué es
App móvil de **renta de carros** para República Dominicana (negocio real; WhatsApp **+1 (484) 828-2792**, enlace de chat `https://wa.me/message/QUBUIPLHYY2QG1` — ver `WHATSAPP_URL`/`openWhatsApp()` en `constants.ts`; IG @tucarroenrd01). Diseño oscuro neón. UI **bilingüe ES/EN** (ver Fase 6). Precios en **US$ (dólares)** porque los clientes son de EE.UU. — símbolo `$` en la UI, etiqueta `US$` en el form admin. Extras y rango del filtro ya en USD (`constants.ts`); la conversión de los precios que ya estaban en la BD de RD$→US$ (tasa 60, redondeo a múltiplos de 5) está incluida dentro de **`supabase/SETUP_COMPLETO.sql`**.

- **Ubicación:** `C:\Users\emilc\.gemini\antigravity\playground\Tu carro en rd`
- **Origen:** empezó como prototipo HTML de 1 archivo → `_prototipo/tucarro-rental.html` (referencia). También publicado como artifact: https://claude.ai/code/artifact/02c6bf58-6614-4b55-8da8-de48d7e69801
- **Ahora:** app real.

## Stack
- **Frontend:** React 19 + Vite 8 + TypeScript. Diseño en `src/index.css` (portado del prototipo).
- **Backend:** Supabase (project ref `uxlcatzzzdxiowzqspqu`, URL `https://uxlcatzzzdxiowzqspqu.supabase.co`, org MC Digital Prueba, plan free). Credenciales (URL + publishable key) en `.env.local`.
- **Nativo:** Capacitor 8 (Android) para notificaciones push con **Firebase FCM**. Carpeta `android/` generada. appId `com.mcdigital.tucarroenrd`. Firebase project propio: **`tu-carro-en-rd`** (`google-services.json` en `android/app/`).

## Correr / compilar
```bash
npm run dev        # web (http://localhost:5173)
npm run build      # compila web (tsc + vite). SIEMPRE pasa limpio.
npx cap sync android   # copia el build al proyecto Android
npx cap open android   # abre Android Studio para compilar el APK
```
> Tras agregar dependencias (ej. Capacitor), **reiniciar `npm run dev`** (Vite re-optimiza, si no da un 500 temporal).

## APK / Android (ver sesión 2026-10-12)
- **Build del APK por consola** (sin abrir Android Studio): primero `npm run build && npx cap sync android`, luego desde la raíz del proyecto:
  ```bash
  cd android && JAVA_HOME="/c/Program Files/Android/Android Studio/jbr" ./gradlew assembleDebug --no-daemon
  ```
  Salida: `android/app/build/outputs/apk/debug/app-debug.apk` (~6.1 MB). **El APK debug ya se compiló OK esta sesión.**
- **`android/local.properties`** (no se commitea): `sdk.dir=C:/Users/emilc/AppData/Local/Android/Sdk`. El JDK es el de Android Studio (OpenJDK 21) en `C:\Program Files\Android\Android Studio\jbr`.
- **Firma de release configurada** en `android/app/build.gradle`: lee `android/keystore.properties` (gitignored, hay plantilla con `storeFile`/`keyAlias`/`storePassword`/`keyPassword`); el `buildType release` usa esa firma solo si el archivo existe. `.gitignore` ya excluye `*.jks`/`*.keystore`/`keystore.properties`.
  - **PENDIENTE (lo hace el usuario, él crea y guarda las contraseñas):** desde `android/` correr
    `keytool -genkey -v -keystore tucarroenrd-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias tucarroenrd`,
    rellenar `keystore.properties` con esas contraseñas, y luego `JAVA_HOME=... ./gradlew assembleRelease` → `app/build/outputs/apk/release/app-release.apk`.
- **Ícono propio** (no genérico): carro azul (`#4A89FF`) con aros cian (`#22D3EE`) sobre fondo azul marino `#0B1020`. Se generaron todos los PNG de `res/mipmap-*` (ic_launcher, round y foreground) con `sharp`; el fondo adaptativo (`res/values/ic_launcher_background.xml`) quedó en `#0B1020`. El script generador (`gen-icons.mjs`) fue temporal y ya se borró.

## Web pública en Vercel (2026-10-13)
La web está desplegada en **Vercel** (equipo `mc-digital-systems-llc`, proyecto `tu-carro-en-rd`), sobre todo para tener una **URL pública de política de privacidad** (requisito de Google Play).
- **App:** https://tu-carro-en-rd.vercel.app · **Privacidad:** `/privacidad` · **Términos:** `/terminos` (verificado público con curl → HTTP 200, sin login).
- `vercel.json` en la raíz tiene el rewrite de SPA (`/(.*) → /index.html`) para que las rutas de React Router no den 404.
- Deploy: `npx vercel --prod` desde la carpeta del proyecto (Vercel detecta Vite solo). El login del usuario ya quedó hecho.
- **OJO:** se desplegó SIN las variables de Supabase, así que en la web el login/datos NO funcionan todavía (privacidad/términos sí, porque `supabase.ts` es defensivo y no se cae). Para habilitar la app completa por navegador: agregar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en Vercel (Settings → Environment Variables) y re-desplegar.

## Gráficos para Google Play
En `play-assets/`: `play-icon-512.png` (ícono 512×512 hi-res) y `play-feature-1024x500.png` (gráfico destacado), generados con `sharp` reusando el diseño del carro. Falta (lo hace el usuario): capturas de pantalla reales + `app-release.aab` (ya generado en `android/app/build/outputs/bundle/release/`).

## Auth (importante)
- **Mismo login** para clientes y admins (role-based). Correo+contraseña **y** Google OAuth.
- **Registro = código OTP de 8 dígitos por correo** (no enlace). Requiere en Supabase: plantilla **"Confirm signup"** con `{{ .Token }}` + **Email OTP Length = 8**.
- **"¿Olvidaste tu contraseña?"** = OTP de recuperación. Requiere plantilla **"Reset Password"** con `{{ .Token }}`.
- **Correos por Resend** (SMTP de Supabase, `smtp.resend.com`). Dominio **mcds.ai VERIFICADO** → el sender debería ser `no-reply@mcds.ai` para enviar a cualquier correo (con `onboarding@resend.dev` solo llegaba a labmcds@gmail.com).
- Cuenta admin de prueba: `labmcds@gmail.com`. Para hacer admin a otro: la app lo hace en **Perfil → Administradores** (necesita que esa persona ya tenga cuenta).

## Experiencia por rol
- **Cliente:** tabs Inicio · Buscar · Reservas · Perfil. Busca, filtra, reserva, cancela.
- **Admin (admin-first):** al entrar va directo a `/admin`; tabs **Resumen · Flota · Reservas · Perfil**. Gestiona flota (agregar/editar/eliminar carros, fotos), ve TODAS las reservas y cambia su estado, gestiona otros admins. NO ve la tienda de cliente.

## Funciones construidas (todas pasan tsc + build)
- **Fase 1:** schema profiles/cars/bookings + RLS + trigger perfil, seed 8 carros, todas las pantallas cliente (Login, Home, Catalog con buscador/filtros/orden, CarDetail, Booking con calendario multi-mes + hora + extras, Success, Trips con cancelar, Profile, EditProfile).
- **Fase 2:** rol admin (columna `role`, `is_admin()`, RLS admin), navegación admin-first, AdminHome/AdminFleet/AdminBookings, CarForm (CRUD de carros + **eliminar con confirmación** + **editor de "Incluye"/features** con chips traducibles + **descripción propia BILINGÜE** (`description` = ES, `description_en` = EN; SQL `APLICAR_descripcion_color.sql` + `APLICAR_descripcion_en.sql`) y **color en palabras** (`color_name`); el color se mapea a un hex para el dibujo con `colorNameToHex`; CarDetail muestra la descripción del idioma del usuario → si falta, la del otro idioma → si no, la genérica traducida), cambio de estado de reservas.
- **Fase 3:** fotos reales de carros (bucket Storage `car-photos`, componente `CarImage`, subida con **validación de 50 MB**). **Varias fotos por carro:** columna `images text[]` (SQL `APLICAR_fotos_multiples.sql`); `image_url` = la principal (`images[0]`) para listados/miniaturas. CarForm sube/quita varias (tira de miniaturas, 1ª = "Principal"); CarDetail muestra un **carrusel** deslizable con puntitos.
- **Fase 4:** AdminTeam (`/admin/equipo`) — hacer/quitar admin con RPC `set_admin_role`.
- **Ajustes (`/ajustes`):** interruptor de notificaciones, idioma, tema claro/oscuro, **Cambiar contraseña** (sección Cuenta → `ChangePasswordSheet`, usa `updatePassword` de AuthContext, para clientes y admins sin tener que usar "olvidé mi contraseña"), **Términos y condiciones** / **Política de privacidad** (abren `/terminos` y `/privacidad`), info y **Eliminar cuenta**.
- **Legal:** `src/content/legal.ts` (textos TÉRMINOS + PRIVACIDAD, bilingües ES/EN) → `src/screens/Legal.tsx`, rutas **públicas** `/terminos` y `/privacidad` (fuera de `RequireAuth`, para poder enlazarlas desde tiendas/registro).
- **Fase 5 (PUSH NATIVO — parado para fase final):** Capacitor+FCM, tabla `device_tokens`, `src/lib/push.ts`, `PushRegistrar`, Edge Functions `send-push` + `send-reminders`, avisos cableados (nueva reserva→admins+cliente, cambio estado→cliente, recordatorio 1 día antes vía cron). Guía: **`PUSH_SETUP.md`**.
- **Eliminar cuenta:** Edge Function `delete-account` + UI en Ajustes.
- **Fase 6 (IDIOMA ES/EN — i18n):** toda la UI traducible español/inglés con cambio instantáneo. Sistema propio en `src/i18n/` (`I18nProvider` + hook `useI18n()` con `t(clave, vars?)` e interpolación `{var}`); diccionario plano `es`/`en` en `translations.ts` (claves por pantalla, centinelas `@keep-es-end`/`@keep-en-end` para agregar). Idioma guardado en `localStorage('tucarro_lang')`, **default `en`** (clientes de EE.UU.; se definía en `I18nContext.DEFAULT_LANG`, en `lib/format.activeLang()` y en `<html lang>` de `index.html`); actualiza `<html lang>`. El usuario puede cambiar a español con el toggle (se recuerda). **Toggle** en Ajustes (🇩🇴 Español / 🇺🇸 English, usa clase `.seg`) y en Login (píldora ES/EN arriba). Fechas conscientes del idioma en `lib/format.ts` (meses/días ES+EN según el idioma activo leído de localStorage; `money` usa `en-US`/`es-DO`). **No se traduce** lo que se guarda en BD (categorías `SUV`/`Sedán`, zonas, transmisión/combustible son canónicos en español y se traducen solo al mostrarse vía `t('cat.'+id)` etc.) ni las **notificaciones push** (se quedan en español porque van a destinatarios cuyo idioma no se conoce aquí). Pasa tsc+build y verificado en navegador.

## Estado de pasos de consola (Supabase/Firebase)
HECHO por el usuario: SQL Fases 1-5 aplicadas (tablas verificadas); Google OAuth; plantilla OTP + length 8; Resend SMTP; Firebase `tu-carro-en-rd` + google-services.json; **las 3 Edge Functions desplegadas** (send-push, send-reminders, delete-account); secreto **FCM_SERVICE_ACCOUNT**; **cron de recordatorios programado** (`recordatorios-recogida`, 13:00 UTC diario → send-reminders); **Sender SMTP cambiado a `no-reply@mcds.ai`** (los OTP llegan a cualquier correo).

PENDIENTE:
- [x] ~~Compilar el APK debug~~ — hecho (`app-debug.apk`, ver sección "APK / Android").
- [x] ~~APK de release firmado~~ — **hecho 2026-10-13**: keystore `android/tucarroenrd-release.jks` creado por el usuario (cert `CN=Miltron Contrera, OU=MC Digital Systems LLC, C=US`, PKCS12 → store y key con la misma contraseña), `keystore.properties` relleno, `./gradlew assembleRelease` → `app/build/outputs/apk/release/app-release.apk` (~4.6 MB, firma verificada con apksigner). Listo para distribuir / subir a Google Play.
- [x] ~~Instalar el APK en un teléfono real y probar push~~ — **hecho 2026-10-13**: el usuario instaló el `app-debug.apk` en su teléfono y confirmó que la app corre bien y **las notificaciones push funcionan**. Toda la cadena FCM validada (Firebase `tu-carro-en-rd`, `google-services.json`, `device_tokens`, Edge Functions `send-push`/`send-reminders`, secreto `FCM_SERVICE_ACCOUNT`).

**✅ No quedan pendientes técnicos bloqueantes — la app está funcionalmente completa y probada en dispositivo real.** Siguiente paso de negocio (cuando el usuario quiera): subir el `app-release.apk` (o generar un `.aab`) a Google Play Console.

## Archivos SQL (en `supabase/`)
**TODO el SQL está consolidado en un solo archivo: `SETUP_COMPLETO.sql`** (los `APLICAR_*.sql` y `CONVERTIR_A_USD.sql` sueltos se borraron). Pegarlo completo en el SQL Editor recrea la base de datos de cero: extensiones, tablas (profiles, cars, bookings, device_tokens, favorites, reviews, app_settings), `is_admin()`, RLS, bucket `car-photos`, funciones/triggers (perfil nuevo, set_admin_role, car_booked_ranges, apply_review, recount de rentas), ajustes (extras + zelle), seed de 8 carros, conversión a US$ y marca admin. Es idempotente (seguro re-ejecutarlo). La sección 11 marca admin a `labmcds@gmail.com` — cambiar por el correo real. (Las migraciones de Supabase CLI en `supabase/migrations/` solo cubren Fases 1-5 y quedaron como histórico.)

> **Nota:** si el proyecto Supabase ya estaba montado por fases, `SETUP_COMPLETO.sql` igual se puede correr (usa `if not exists` / `add column if not exists` / `drop policy if exists`). Si el admin no puede guardar un carro con error "Could not find the '<col>' column", correr `SETUP_COMPLETO.sql` para agregar las columnas que falten.

## Mapa de código (`src/`)
- **main.tsx** — árbol de providers: `ThemeProvider` > `I18nProvider` > `AuthProvider` > `UIProvider` > `CarsProvider` > `FavoritesProvider` > `AdminDataProvider`.
- **context/ThemeContext** — modo **claro/oscuro**. Guarda `tucarro_theme` en localStorage (default **dark**) y pone `data-theme` en `<html>`; un script inline en `index.html` lo aplica antes de pintar (sin parpadeo). La paleta clara está en `index.css` bajo `:root[data-theme="light"]` (la oscura es el `:root` base). Interruptor en Ajustes (🌙 Oscuro / ☀️ Claro).
- **App.tsx** — rutas + `<PushRegistrar/>`.
- **i18n/** — `I18nContext` (`I18nProvider` + `useI18n()`), `translations.ts` (diccionario es/en). Provider es el más externo en `main.tsx` (envuelve a Auth/UI/Cars/AdminData) para que incluso AuthContext pueda usar `t()`.
- **context/** — `AuthContext` (sesión, OTP registro/recuperación, updatePassword, deleteAccount, isAdmin, profileLoaded, signInWithGoogle; errores de Supabase traducidos con `t()`), `UIContext` (toast + bottom sheets), `CarsContext` (catálogo cliente; **siempre muestra todos los carros activos** — la disponibilidad es por fechas, ver abajo), `FavoritesContext` (favoritos del usuario en tabla `favorites`; `isFavorite`/`toggle`), `AdminDataContext` (carros+reservas admin; `reload()` hace **refresco silencioso** sin spinner — AdminHome/AdminFleet/AdminBookings lo llaman al montar para ver reservas nuevas sin recargar la app). La Flota marca con badge verde **"Reservado"** + 🔑 cliente y fechas los carros con reserva activa.
- **Disponibilidad POR FECHAS:** el carro siempre se ve; en la reserva (`Booking` + `DatePickerSheet`) se bloquean las fechas ya tomadas. La RPC **`car_booked_ranges(p_car_id)`** (SQL `APLICAR_disponibilidad_fechas.sql`) devuelve los rangos ocupados (sin exponer quién reservó); el calendario tacha esos días y los días pasados, y `confirm()` revalida solapamiento justo antes de guardar (`booking.datesTaken`). La RPC `booked_car_ids()` quedó sin uso (se puede ignorar).
- **Pago (Efectivo / Zelle — manual, Zelle no tiene API):** `bookings.payment_method` ('efectivo'|'zelle') + `payment_status` ('pendiente'|'pagado'); datos de Zelle en `app_settings` fila `zelle` ({name, handle}). SQL `APLICAR_pago_zelle.sql`. `lib/zelle.ts` lee/guarda. Booking tiene selector de método; si elige Zelle muestra los datos + instrucciones (pagar, poner código en la nota, mandar comprobante por WhatsApp). Success repite el recordatorio de Zelle. Admin configura su Zelle en **Perfil → Cobro / Zelle** (`/admin/pago`, `AdminPayment`) y marca cada reserva **Pagado/Pendiente** en AdminBookingCard. **Cada tarjeta de reserva** (cliente en Trips y admin en AdminBookingCard) muestra los **extras elegidos + la forma de pago** vía el componente compartido `BookingMeta` (helper `lib/bookingView.extraLabel`); el cliente además ve ahí la etiqueta Pagado/Pendiente.
- **Precios de extras editables:** tabla `app_settings` (clave-valor jsonb, fila `extras`; SQL `APLICAR_precios_extras.sql`). `lib/pricing.ts` lee/guarda; Booking carga los precios de ahí (seguro/día + aero Santiago/SDQ/PUJ) en vez del código. Admin los edita en **Perfil → Precios de extras** (`/admin/extras`, pantalla `AdminExtras`). Si la tabla no existe, usa `DEFAULT_PRICING`.
- **Reserva (reglas):** mínimo **5 días** (`MIN_RENTAL_DAYS`), hay que elegir **hora** de recogida y devolución, y **marcar los requisitos** ("Leí los requisitos y los cumplo") — hasta cumplir las 3 cosas, "Confirmar" está desactivado. La sección **Requerimientos** (debajo de Extras) muestra el texto de requisitos + botón de WhatsApp (`openWhatsApp()`) para enviar fotos de prueba. El extra **Entrega en aeropuerto** es un selector (`AIRPORT_DELIVERY`): Santiago gratis, Santo Domingo $150, Punta Cana $300.
- **Reseñas / rating:** tabla `reviews` (una por reserva, SQL `APLICAR_resenas.sql`). En "Mis reservas", una reserva **Completada** muestra "⭐ Califica este carro" → `RatingSheet` (1–5 estrellas + comentario) → inserta reseña; un trigger recalcula `cars.rating` = promedio de reseñas. Si ya calificó, muestra "★ N · Tu calificación".
- **Contador de rentas REAL:** `cars.trips_count` ("rentals") cuenta las reservas reales (no canceladas) vía triggers en `bookings` (SQL `APLICAR_rentas_reales.sql`, que también recalcula todos ahora reemplazando los números del seed). Sube/baja solo al crear/cancelar/borrar reservas. El front ya muestra `trips_count`, no hubo cambio de código. (Eventualmente consistente: el catálogo refresca el número al recargar.)
- **Auto-completar reservas vencidas:** `lib/derive.ts` → `effectiveStatus(b)` considera una reserva **Completada** en cuanto pasa su `return_date` (sin tocar la BD). Lo usan Trips, AdminBookings, AdminBookingCard y el badge "Reservado" de AdminFleet. Así la reserva pasa sola a Historial y el carro se libera visualmente. (La disponibilidad de fechas futuras ya funcionaba porque las fechas pasadas se bloquean.) Opcional para mantener la BD limpia: un cron diario `update bookings set status='past' where status='active' and return_date < current_date`.
- **screens/** — Login, Home (la "Recogida" muestra **Santiago fijo** — todos los carros se recogen ahí; `PICKUP_CITY` en constants; sin selector de zona ni filtro por zona, `ZONES`/`ADMIN_ZONES` = `['Santiago']`), Catalog (lee `?cat=`), CarDetail, Booking, Success, Trips, Profile, EditProfile, Settings, Legal (términos/privacidad); **admin/** — AdminHome, AdminFleet, AdminBookings (con **buscador** por código/cliente/teléfono/carro/matrícula), AdminTeam, AdminExtras, AdminPayment, AdminBookingCard.
- **components/** — AppShell (marco + sheets + toast + FAB), TabBar (cambia según rol), RequireAuth, Splash, CarCard, CarImage, CarArt (dibujo SVG), ChipRow, PushRegistrar, OtpInput, icons; **sheets/** — DatePickerSheet, FilterSheet (solo precio; sin chips de zona), SortSheet, CancelSheet, OtpSheet, ForgotPasswordSheet, ChangePasswordSheet, RatingSheet, CarForm, StatusSheet.
- **lib/** — supabase, format (fechas/moneda conscientes del idioma), filters, color (`colorNameToHex`/`DEFAULT_BODY_COLOR`), pricing (precios de extras desde `app_settings`), zelle (datos de Zelle), derive (`effectiveStatus`), push.
- **content/** — `legal.ts` (textos de términos + privacidad, bilingües).
- **data/** — constants.ts (categorías, extras, horas, `PICKUP_CITY`/`ZONES`=`['Santiago']`, `MIN_RENTAL_DAYS`=5, `WHATSAPP`/`WHATSAPP_URL`/`openWhatsApp()`, `AIRPORT_DELIVERY`, OTP_LENGTH=8, MAX_PHOTO_BYTES, `PRICE_MIN/MAX/STEP`).
- **supabase/functions/** — send-push, send-reminders, delete-account (Deno; NO entran al build web).

## Gotchas
- Código Capacitor/push está guardado con `isNative()` → en web no hace nada (la web sigue 100% funcional).
- `.vscode/settings.json` excluye `android/` de la extensión de Java (esos "problemas" de Java eran falsos, del proyecto Android).
- Al borrar un archivo con `npm run dev` corriendo, Vite puede quedar con un error viejo en caché → reiniciar el server.
- `bookings.car_id`/`user_id`, `profiles.id`, `device_tokens.user_id` tienen `on delete cascade` → borrar un carro con reservas falla (mensaje amable: "apágalo"); borrar una cuenta elimina sus datos en cascada.
- **`bookings` NO tiene FK directa a `profiles`** (solo a `auth.users`). Por eso en `AdminDataContext` NO se usa el embed `profile:profiles(...)` (rompía toda la consulta y el admin veía "No hay reservas"); el perfil del cliente se trae con una consulta aparte a `profiles` (requiere la policy `profiles_admin_select`) y se une en JS. No volver a poner ese embed.

## Próximas ideas (sin empezar)
Pago/seña, desplegar web en Vercel, más métricas en el panel admin, endurecer la disponibilidad con una constraint de exclusión en la BD (hoy el anti-solapamiento es del lado cliente + revalidación al guardar).
