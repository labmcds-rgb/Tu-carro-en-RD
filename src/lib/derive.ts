import type { Booking, BookingStatus } from '../types/db';
import { parseISODate } from './format';

/**
 * Estado "efectivo" de una reserva: si está activa pero su fecha de devolución
 * ya pasó, se considera Completada (past) automáticamente, sin cambiar la BD.
 * Las canceladas y las ya completadas se devuelven tal cual.
 */
export function effectiveStatus(b: Pick<Booking, 'status' | 'return_date'>): BookingStatus {
  if (b.status !== 'active') return b.status;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return parseISODate(b.return_date).getTime() < today.getTime() ? 'past' : 'active';
}
