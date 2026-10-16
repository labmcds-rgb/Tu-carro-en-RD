# 🔔 Notificaciones push (app nativa + Firebase FCM)

La app ya tiene todo el código. Faltan **pasos de consola** (los haces tú). Sigue el orden.

> **Importante:** las push **solo funcionan en la app instalada (APK) en un teléfono real**.
> En el navegador/emulador no hay token FCM, así que no llegan — es normal.

Datos del proyecto:
- **Package / App ID:** `com.mcdigital.tucarroenrd`
- **Supabase project ref:** `uxlcatzzzdxiowzqspqu`

---

## 1) Base de datos
Pega **`supabase/APLICAR_FASE5_notificaciones.sql`** en el SQL Editor de Supabase → **Run**.
(Crea la tabla `device_tokens`.)

## 2) Firebase
1. Entra a [console.firebase.google.com](https://console.firebase.google.com) → **crea un proyecto** (ej. "TU CARRO EN RD").
2. **Agrega una app Android** con el package **`com.mcdigital.tucarroenrd`**.
3. Descarga **`google-services.json`** y ponlo en **`android/app/google-services.json`**.
4. En Firebase → **Project Settings → Cloud Messaging**: asegúrate de que la **API de FCM (v1)** esté habilitada.

## 3) Cuenta de servicio (para que el servidor envíe)
1. Firebase → **Project Settings → Service accounts → Generate new private key** → descarga el JSON.
2. En Supabase, guarda **todo** ese JSON como un secreto (el JSON completo en una sola variable — evita problemas con los saltos de línea de la clave):

```bash
npx supabase login
npx supabase link --project-ref uxlcatzzzdxiowzqspqu
npx supabase secrets set FCM_SERVICE_ACCOUNT="$(cat ruta/al/serviceAccount.json)"
```

> O desde el Dashboard → **Edge Functions → Secrets** → agrega `FCM_SERVICE_ACCOUNT` y pega el JSON completo.

## 4) Desplegar las Edge Functions
```bash
npx supabase functions deploy send-push
npx supabase functions deploy send-reminders --no-verify-jwt
```
> `send-push` lo llama la app (con la sesión del usuario). `send-reminders` lo llama el cron,
> por eso va con `--no-verify-jwt`.

*(Si prefieres el Dashboard: Edge Functions → Create function → pega el contenido de
`supabase/functions/<nombre>/index.ts`.)*

## 5) Recordatorio diario (cron)
En el SQL Editor, pega esto (programa el aviso de recogida 1 día antes, 9:00 AM RD):

```sql
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'recordatorios-recogida',
  '0 13 * * *',  -- 13:00 UTC = 9:00 AM en RD (UTC-4)
  $$ select net.http_post(
       url := 'https://uxlcatzzzdxiowzqspqu.supabase.co/functions/v1/send-reminders',
       headers := '{"Content-Type":"application/json"}'::jsonb
     ); $$
);
```

## 6) Compilar e instalar el APK
```bash
npm run build
npx cap sync android
npx cap open android      # abre Android Studio
```
En Android Studio: **Build → Build APK(s)** (o conecta tu teléfono y dale ▶ Run).
Instala el APK en tu teléfono, inicia sesión, y en **Perfil → Configuración** activa **Notificaciones**
(acepta el permiso). Haz una reserva de prueba y verás llegar el aviso. ✅

---

## Qué avisos envía la app
- **Nueva reserva** → a todos los **administradores**.
- **Reserva confirmada** → al **cliente** que reservó.
- **Cambio de estado** (completada/cancelada) → al **cliente** de esa reserva.
- **Recordatorio de recogida** → al **cliente**, un día antes (vía el cron).

## Notas
- **iOS** va aparte: necesita Mac + cuenta Apple Developer + configurar APNs en Firebase. Android funciona con lo de arriba.
- Cada vez que cambies código web: `npm run build && npx cap sync android` antes de recompilar el APK.
