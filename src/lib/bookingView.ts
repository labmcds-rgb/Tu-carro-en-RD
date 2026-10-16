import type { BookingExtra } from '../types/db';

type T = (key: string, vars?: Record<string, string | number>) => string;

/**
 * Etiqueta legible (y traducida cuando se puede) de un extra guardado en una reserva.
 * El nombre de 'aero' se guardó como "Entrega en aeropuerto — Zona"; recuperamos la zona
 * y traducimos el nombre base por su id. Para ids sin traducción, se usa el nombre guardado.
 */
export function extraLabel(e: BookingExtra, t: T): string {
  if (e.id === 'aero') {
    const zone = e.name.includes('—') ? e.name.split('—').pop()!.trim() : '';
    const base = t('extra.aero.name');
    return zone ? `${base} · ${zone}` : base;
  }
  const key = 'extra.' + e.id + '.name';
  const label = t(key);
  // Si no hay traducción para ese id, t() devuelve la clave → usamos el nombre guardado.
  return label === key ? e.name : label;
}
