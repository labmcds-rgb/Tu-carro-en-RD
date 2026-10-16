import { supabase } from './supabase';

/** Datos de la cuenta Zelle del negocio (los edita el admin). */
export type ZelleInfo = {
  name: string; // nombre del titular
  handle: string; // correo o teléfono de Zelle
};

export const DEFAULT_ZELLE: ZelleInfo = { name: '', handle: '' };

/** Lee los datos de Zelle desde app_settings (vacíos si no están configurados). */
export async function loadZelle(): Promise<ZelleInfo> {
  const { data } = await supabase.from('app_settings').select('value').eq('key', 'zelle').maybeSingle();
  return { ...DEFAULT_ZELLE, ...((data?.value as Partial<ZelleInfo> | undefined) ?? {}) };
}

/** Guarda los datos de Zelle (solo admin, por RLS). */
export async function saveZelle(z: ZelleInfo) {
  return supabase
    .from('app_settings')
    .upsert({ key: 'zelle', value: z, updated_at: new Date().toISOString() }, { onConflict: 'key' });
}
