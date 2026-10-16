/** Color por defecto del carro cuando no se reconoce la palabra. */
export const DEFAULT_BODY_COLOR = '#2B6CB0';

/** Convierte una palabra de color (español/inglés) a un hex para el dibujo.
 *  Si no la reconoce, usa el color por defecto. */
export function colorNameToHex(name: string): string {
  const n = (name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quita acentos
    .trim();
  if (!n) return DEFAULT_BODY_COLOR;
  const map: { keys: string[]; hex: string }[] = [
    { keys: ['blanco', 'white', 'perla'], hex: '#E6E8EC' },
    { keys: ['negro', 'black'], hex: '#23272F' },
    { keys: ['gris', 'gray', 'grey', 'plata', 'plateado', 'silver'], hex: '#99A2AD' },
    { keys: ['rojo', 'red', 'vino', 'burgundy', 'bordo'], hex: '#E23744' },
    { keys: ['azul', 'blue', 'celeste', 'navy'], hex: '#2B6CB0' },
    { keys: ['verde', 'green'], hex: '#2E9E6B' },
    { keys: ['amarillo', 'yellow'], hex: '#F2C14E' },
    { keys: ['naranja', 'orange'], hex: '#E8863B' },
    { keys: ['marron', 'cafe', 'brown', 'chocolate'], hex: '#7A5230' },
    { keys: ['dorado', 'oro', 'gold', 'champagne'], hex: '#CBA14A' },
    { keys: ['morado', 'purpura', 'purple', 'violeta', 'violet', 'lila'], hex: '#7A5CC0' },
    { keys: ['beige', 'crema', 'cream', 'arena'], hex: '#D8CBB0' },
  ];
  for (const { keys, hex } of map) if (keys.some((k) => n.includes(k))) return hex;
  return DEFAULT_BODY_COLOR;
}

/** Oscurece un color hex por un factor (0–1). Útil para derivar el tono
 *  inferior del carro a partir del color principal. */
export function darken(hex: string, amount = 0.28): string {
  const m = hex.replace('#', '');
  const full = m.length === 3 ? m.split('').map((c) => c + c).join('') : m;
  const num = parseInt(full, 16);
  if (Number.isNaN(num)) return hex;
  const r = Math.max(0, Math.round(((num >> 16) & 255) * (1 - amount)));
  const g = Math.max(0, Math.round(((num >> 8) & 255) * (1 - amount)));
  const b = Math.max(0, Math.round((num & 255) * (1 - amount)));
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}
