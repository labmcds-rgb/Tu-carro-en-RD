import type { Booking } from '../types/db';
import { useI18n } from '../i18n/I18nContext';
import { extraLabel } from '../lib/bookingView';

/**
 * Fila de detalle que muestra los extras elegidos y la forma de pago de una reserva.
 * La usan la tarjeta del cliente (Trips) y la del admin (AdminBookingCard).
 * `showPayStatus` agrega la etiqueta Pagado/Pendiente (útil para el cliente, que no la ve en otro lugar).
 */
export default function BookingMeta({ b, showPayStatus = false }: { b: Booking; showPayStatus?: boolean }) {
  const { t } = useI18n();
  const extras = Array.isArray(b.extras) ? b.extras : [];
  const method = b.payment_method ? t(b.payment_method === 'zelle' ? 'pay.zelle' : 'pay.cash') : '—';

  return (
    <div className="tmeta">
      <div className="tmeta-row">
        <span className="k">{t('booking.extras')}</span>
        <span className="v">
          {extras.length ? extras.map((e) => extraLabel(e, t)).join(' · ') : t('booking.noExtras')}
        </span>
      </div>
      <div className="tmeta-row">
        <span className="k">{t('booking.paymentShort')}</span>
        <span className="v">
          {method}
          {showPayStatus && b.payment_method && (
            <span className={'paytag ' + b.payment_status} style={{ marginLeft: 8 }}>
              {t('pay.status.' + b.payment_status)}
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
