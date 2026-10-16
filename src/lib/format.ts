type DateLang = 'es' | 'en';

const NAMES: Record<DateLang, { wd: string[]; months: string[]; monthsAbbr: string[] }> = {
  es: {
    wd: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    months: [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ],
    monthsAbbr: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  },
  en: {
    wd: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    months: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ],
    monthsAbbr: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  },
};

/** Idioma activo leído de localStorage (los componentes que formatean fechas
 *  consumen useI18n, así que se re-renderizan al cambiar idioma). */
function activeLang(): DateLang {
  try {
    // Inglés por defecto (clientes de EE.UU.); solo español si se eligió explícitamente.
    return localStorage.getItem('tucarro_lang') === 'es' ? 'es' : 'en';
  } catch {
    return 'en';
  }
}

/** Nombres completos de meses para el idioma dado (para el calendario). */
export const monthsFor = (lang: DateLang) => NAMES[lang].months;

export const DAY_MS = 86400000;

export const money = (n: number) => n.toLocaleString(activeLang() === 'en' ? 'en-US' : 'es-DO');

export const fmtDay = (d: Date) => `${d.getDate()} ${NAMES[activeLang()].monthsAbbr[d.getMonth()]}`;
export const fmtDayW = (d: Date) => `${NAMES[activeLang()].wd[d.getDay()]}, ${fmtDay(d)}`;

export function daysBetween(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / DAY_MS);
}

export function addDays(date: Date, n: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export function fmtRange(from: Date, to: Date) {
  if (from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear())
    return `${from.getDate()}–${to.getDate()} ${NAMES[activeLang()].monthsAbbr[from.getMonth()]}`;
  return `${fmtDay(from)} – ${fmtDay(to)}`;
}

/** Auto-formatea un teléfono local RD mientras se escribe: 809-555-0142 */
export function formatPhone(digits: string) {
  const d = digits.replace(/\D/g, '').slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
}

/** Convierte una fecha a 'YYYY-MM-DD' local (para columnas date de Postgres) */
export function toISODate(d: Date) {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Parsea 'YYYY-MM-DD' como fecha local (evita el corrimiento de zona horaria) */
export function parseISODate(s: string) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}
