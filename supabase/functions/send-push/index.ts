// Supabase Edge Function: envía una notificación push por Firebase Cloud Messaging (FCM HTTP v1).
//
// Desplegar:  supabase functions deploy send-push
// Secretos:   supabase secrets set FCM_SERVICE_ACCOUNT='{ ...todo el JSON de la cuenta de servicio... }'
//             (SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY se inyectan solos.)
//
// Body: { userId?: string, role?: 'admin'|'customer', title: string, body: string,
//         data?: Record<string,string> }
//
// NOTA: este archivo es Deno (corre en Supabase Edge), no es parte del build de la app.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Credenciales de Firebase. Preferido: FCM_SERVICE_ACCOUNT = el JSON completo de la
// cuenta de servicio (pega el archivo entero) — JSON.parse maneja los saltos de línea
// de la clave privada correctamente, evitando los problemas de escapar \n a mano.
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
    } catch (_) {
      /* JSON mal formado — cae a las variables individuales */
    }
  }
  return {
    projectId: Deno.env.get('FCM_PROJECT_ID') ?? '',
    clientEmail: Deno.env.get('FCM_CLIENT_EMAIL') ?? '',
    privateKey: (Deno.env.get('FCM_PRIVATE_KEY') ?? '').replace(/\\n/g, '\n'),
  };
}

const { projectId: PROJECT_ID, clientEmail: CLIENT_EMAIL, privateKey: PRIVATE_KEY } = loadServiceAccount();

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

// Genera un token de acceso OAuth de corta duración desde la cuenta de servicio.
async function getAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = b64urlStr(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = b64urlStr(
    JSON.stringify({
      iss: CLIENT_EMAIL,
      scope: 'https://www.googleapis.com/auth/firebase.messaging',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    }),
  );
  const toSign = `${header}.${claims}`;
  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToDer(PRIVATE_KEY),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(toSign));
  const jwt = `${toSign}.${b64url(new Uint8Array(sig))}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  const json = await res.json();
  return json.access_token as string;
}

async function sendToToken(
  accessToken: string,
  token: string,
  title: string,
  body: string,
  data: Record<string, string>,
) {
  await fetch(`https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: {
        token,
        notification: { title, body },
        data: data ?? {},
        android: { priority: 'HIGH', notification: { sound: 'default' } },
      },
    }),
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const { userId, role, title, body, data } = await req.json();
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    let tokens: string[] = [];
    if (userId) {
      const { data: rows } = await supabase.from('device_tokens').select('token').eq('user_id', userId);
      tokens = (rows ?? []).map((r: { token: string }) => r.token);
    } else if (role) {
      const { data: rows } = await supabase
        .from('device_tokens')
        .select('token, profiles!inner(role)')
        .eq('profiles.role', role);
      tokens = (rows ?? []).map((r: { token: string }) => r.token);
    }

    if (tokens.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    if (!PROJECT_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
      return new Response(
        JSON.stringify({ error: 'Falta configurar FCM (define el secreto FCM_SERVICE_ACCOUNT con el JSON completo).' }),
        { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } },
      );
    }

    const accessToken = await getAccessToken();
    await Promise.all(tokens.map((t) => sendToToken(accessToken, t, title, body, data ?? {})));

    return new Response(JSON.stringify({ sent: tokens.length }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
