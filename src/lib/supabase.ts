import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const hasSupabaseConfig =
  !!url && !!anonKey && !url.includes('TU-PROYECTO') && !anonKey.includes('TU_ANON');

if (!hasSupabaseConfig) {
  // eslint-disable-next-line no-console
  console.warn(
    '[TU CARRO EN RD] Faltan credenciales de Supabase. Rellena VITE_SUPABASE_URL y ' +
      'VITE_SUPABASE_ANON_KEY en el archivo .env.local y reinicia el servidor.',
  );
}

export const supabase = createClient(url ?? 'http://localhost', anonKey ?? 'anon', {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});
