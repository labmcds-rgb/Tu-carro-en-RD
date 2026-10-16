// Supabase Edge Function: elimina la cuenta del usuario que la llama (y sus datos en cascada).
//
// Desplegar:  supabase functions deploy delete-account
// (SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY se inyectan solos.)
//
// Seguridad: usa el JWT del usuario para saber QUIÉN es; solo puede borrarse a sí mismo.
// Al borrar el usuario de auth.users, se eliminan en cascada: profiles, bookings, device_tokens.
//
// NOTA: este archivo es Deno (corre en Supabase Edge).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const jwt = (req.headers.get('Authorization') ?? '').replace('Bearer ', '');
    if (!jwt) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // ¿Quién hace la petición? (según su propio token)
    const { data: userData, error: userErr } = await admin.auth.getUser(jwt);
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: 'Sesión inválida' }), {
        status: 401,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // Borra SOLO a ese usuario (en cascada se van su perfil, reservas y tokens).
    const { error } = await admin.auth.admin.deleteUser(userData.user.id);
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ deleted: true }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
