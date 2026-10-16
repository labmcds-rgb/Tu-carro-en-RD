// Supabase Edge Function: recordatorio de recogida (se ejecuta 1 vez al día por cron).
// Busca las reservas activas cuya recogida es MAÑANA y le avisa al cliente por FCM.
//
// Desplegar:  supabase functions deploy send-reminders
// Secretos:   usa el mismo FCM_SERVICE_ACCOUNT que send-push.
//
// NOTA: este archivo es Deno (corre en Supabase Edge).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

function loadServiceAccount() {
  const raw = Deno.env.get('FCM_SERVICE_ACCOUNT');
  if (raw) {
    try {
      const sa = JSON.parse(raw);
      return {
        projectId: sa.project_id ?? '',
        clientEmail: sa.client_email ?? '',
        privateKey: (sa.private_key ?? '').replace(/\\n/g, '\n'),
      };
    } catch (_) { /* cae abajo */ }
  }
  return {
    projectId: Deno.env.get('FCM_PROJECT_ID') ?? '',
    clientEmail: Deno.env.get('FCM_CLIENT_EMAIL') ?? '',
    privateKey: (Deno.env.get('FCM_PRIVATE_KEY') ?? '').replace(/\\n/g, '\n'),
  };
}
const { projectId: PROJECT_ID, clientEmail: CLIENT_EMAIL, privateKey: PRIVATE_KEY } = loadServiceAccount();

function b64url(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
const b64urlStr = (str: string) => b64url(new TextEncoder().encode(str));
function pemToDer(pem: string): ArrayBuffer {
  const body = pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
  const bin = atob(body);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}
async function getAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = b64urlStr(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = b64urlStr(JSON.stringify({
    iss: CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now, exp: now + 3600,
  }));
  const toSign = `${header}.${claims}`;
  const key = await crypto.subtle.importKey('pkcs8', pemToDer(PRIVATE_KEY),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(toSign));
  const jwt = `${toSign}.${b64url(new Uint8Array(sig))}`;
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
  });
  return (await res.json()).access_token as string;
}
async function sendToToken(accessToken: string, token: string, title: string, body: string, data: Record<string, string>) {
  await fetch(`https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: { token, notification: { title, body }, data, android: { priority: 'HIGH' } } }),
  });
}

Deno.serve(async () => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    // Mañana en formato YYYY-MM-DD
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const { data: bookings } = await supabase
      .from('bookings')
      .select('user_id, code, pickup_time, car:cars(brand, model)')
      .eq('status', 'active')
      .eq('pickup_date', tomorrow);

    if (!bookings || bookings.length === 0) {
      return new Response(JSON.stringify({ reminders: 0 }), { headers: { 'Content-Type': 'application/json' } });
    }

    const accessToken = await getAccessToken();
    let sent = 0;

    for (const b of bookings as Array<{ user_id: string; code: string; pickup_time: string; car: { brand: string; model: string } | null }>) {
      const { data: rows } = await supabase.from('device_tokens').select('token').eq('user_id', b.user_id);
      const tokens = (rows ?? []).map((r: { token: string }) => r.token);
      const carName = b.car ? `${b.car.brand} ${b.car.model}` : 'tu carro';
      for (const t of tokens) {
        await sendToToken(accessToken, t,
          'Recordatorio de recogida 🚗',
          `Mañana recoges ${carName} a las ${b.pickup_time}. ¡Te esperamos!`,
          { screen: '/reservas' });
        sent++;
      }
    }

    return new Response(JSON.stringify({ reminders: bookings.length, sent }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
});
