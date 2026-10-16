export const WHATSAPP = '+1 (484) 828-2792';

/** Enlace "click para chatear" del WhatsApp del negocio. */
export const WHATSAPP_URL = 'https://wa.me/message/QUBUIPLHYY2QG1';

/** Abre el chat de WhatsApp del negocio (nueva pestaña en web / app externa en móvil). */
export function openWhatsApp() {
  try {
    window.open(WHATSAPP_URL, '_blank', 'noopener,noreferrer');
  } catch {
    /* entorno sin window */
  }
}

/** Cantidad de dígitos del código de verificación por correo (debe coincidir
 *  con el "Email OTP Length" configurado en Supabase). */
export const OTP_LENGTH = 8;

/** Mínimo de días que se puede alquilar un carro. */
export const MIN_RENTAL_DAYS = 5;

/** Tamaño máximo de una foto de carro (50 MB). */
export const MAX_PHOTO_BYTES = 50 * 1024 * 1024;
export const CAR_PHOTOS_BUCKET = 'car-photos';

export const CATS = [
  { id: 'todos', name: 'Todos', ic: '🚗' },
  { id: 'SUV', name: 'SUV', ic: '🚙' },
  { id: 'Sedán', name: 'Sedán', ic: '🚗' },
  { id: 'Lujo', name: 'Lujo', ic: '✨' },
  { id: 'Pickup', name: 'Pickup', ic: '🛻' },
  { id: 'Eléctrico', name: 'Eléctrico', ic: '⚡' },
  { id: 'Económico', name: 'Económico', ic: '💰' },
];

// Todos los carros se recogen en Santiago.
export const PICKUP_CITY = 'Santiago';
export const ZONES = ['Santiago'];
export const ADMIN_ZONES = ['Santiago'];

// Opciones para el formulario de la flota (admin)
export const CAR_CATEGORIES = ['SUV', 'Sedán', 'Lujo', 'Pickup', 'Eléctrico', 'Económico'];
export const TRANSMISSIONS = ['Automática', 'Manual'];
export const FUELS = ['Gasolina', 'Diésel', 'Eléctrico', 'Híbrido'];

// Características ("Incluye") que el admin puede marcar por carro.
// Se guardan como estos ids; la etiqueta se traduce con t('feature.'+id).
export const CAR_FEATURES = [
  'ac',
  'bluetooth',
  'backup_cam',
  'unlimited_km',
  'usb',
  'basic_insurance',
  'carplay',
  'gps',
  'sunroof',
  'child_seat',
] as const;

// Features que trae un carro nuevo por defecto.
export const DEFAULT_FEATURES = ['ac', 'bluetooth', 'backup_cam', 'unlimited_km', 'usb', 'basic_insurance'];

// Mapa para pre-seleccionar features de carros viejos (guardadas como texto en español).
export const LEGACY_FEATURE_MAP: Record<string, string> = {
  'Aire acondicionado': 'ac',
  Bluetooth: 'bluetooth',
  'Cámara de reversa': 'backup_cam',
  'Kilometraje ilimitado': 'unlimited_km',
  'USB / Carga': 'usb',
  'Seguro básico incluido': 'basic_insurance',
};

// Escena (fondo) por categoría para el dibujo del carro
export const SCENE_PRESETS: Record<string, [string, string]> = {
  SUV: ['#122238', '#0b1526'],
  Sedán: ['#0f2b33', '#0a1922'],
  Lujo: ['#2a2410', '#191507'],
  Pickup: ['#2a1f12', '#1a1408'],
  Eléctrico: ['#0a2b30', '#07191d'],
  Económico: ['#151d2e', '#0c1320'],
  Híbrido: ['#12261f', '#0a1712'],
};

// Rango del filtro de precio en US$ (dólares por día).
export const PRICE_MIN = 20;
export const PRICE_MAX = 150;
export const PRICE_STEP = 5;

export type SortKey = 'recomendados' | 'precio_asc' | 'precio_desc' | 'rating';
export const SORT_LABELS: Record<SortKey, string> = {
  recomendados: 'Recomendados',
  precio_asc: 'Precio: menor a mayor',
  precio_desc: 'Precio: mayor a menor',
  rating: 'Mejor valorados',
};
export const SORT_SHORT: Record<SortKey, string> = {
  recomendados: 'Recomendados',
  precio_asc: 'Precio ↑',
  precio_desc: 'Precio ↓',
  rating: 'Mejor rating',
};

export type ExtraDef = {
  id: string;
  name: string;
  desc: string;
  price: number;
  per: boolean;
  icon: string;
};

// Precios de los extras en US$ (dólares). `per: true` = por día; `per: false` = una sola vez.
export const EXTRAS: ExtraDef[] = [
  {
    id: 'seguro',
    name: 'Seguro full cover',
    desc: 'Cobertura total contra daños',
    price: 15,
    per: true,
    icon: 'shield',
  },
  {
    id: 'aero',
    name: 'Entrega en aeropuerto',
    desc: 'Te esperamos al aterrizar',
    price: 0, // el precio real depende del aeropuerto elegido (ver AIRPORT_DELIVERY)
    per: false,
    icon: 'plane',
  },
];

// Opciones de entrega en aeropuerto (los carros están en Santiago, por eso es gratis ahí).
export type AirportOption = { id: string; zone: string; price: number };
export const AIRPORT_DELIVERY: AirportOption[] = [
  { id: 'santiago', zone: 'Santiago', price: 0 },
  { id: 'sdq', zone: 'Santo Domingo', price: 150 },
  { id: 'puj', zone: 'Punta Cana', price: 300 },
];

export const TIMES: string[] = (() => {
  const a: string[] = [];
  for (let h = 6; h <= 21; h++) {
    for (const m of [0, 30]) {
      let hh = h % 12;
      if (hh === 0) hh = 12;
      a.push(`${hh}:${m === 0 ? '00' : '30'} ${h < 12 ? 'AM' : 'PM'}`);
    }
  }
  return a;
})();

export function zoneOf(loc: string) {
  if (loc.includes('SD')) return 'Santo Domingo';
  if (loc.includes('Punta Cana')) return 'Punta Cana';
  if (loc.includes('Santiago')) return 'Santiago';
  return loc;
}
