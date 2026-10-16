import { supabase } from './supabase';

/** Precios de los extras (editables por el admin). seguro = por día; aero_* = una sola vez. */
export type ExtrasPricing = {
  seguro: number;
  aero_santiago: number;
  aero_sdq: number;
  aero_puj: number;
};

export const DEFAULT_PRICING: ExtrasPricing = {
  seguro: 15,
  aero_santiago: 0,
  aero_sdq: 150,
  aero_puj: 300,
};

/** Lee los precios desde app_settings; usa los valores por defecto si faltan o si la tabla no existe. */
export async function loadExtrasPricing(): Promise<ExtrasPricing> {
  const { data } = await supabase.from('app_settings').select('value').eq('key', 'extras').maybeSingle();
  return { ...DEFAULT_PRICING, ...((data?.value as Partial<ExtrasPricing> | undefined) ?? {}) };
}

/** Guarda los precios (solo admin, por RLS). */
export async function saveExtrasPricing(pricing: ExtrasPricing) {
  return supabase
    .from('app_settings')
    .upsert({ key: 'extras', value: pricing, updated_at: new Date().toISOString() }, { onConflict: 'key' });
}
