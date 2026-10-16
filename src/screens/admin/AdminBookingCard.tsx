import CarImage from '../../components/CarImage';
import BookingMeta from '../../components/BookingMeta';
import { fmtDay, money, parseISODate } from '../../lib/format';
import type { Booking, BookingStatus } from '../../types/db';
import { supabase } from '../../lib/supabase';
import { notifyPush } from '../../lib/push';
import { useUI } from '../../context/UIContext';
import { useI18n } from '../../i18n/I18nContext';
import { useAdminData } from '../../context/AdminDataContext';
import { effectiveStatus } from '../../lib/derive';
import StatusSheet from '../../components/sheets/StatusSheet';

const STAT_CLS: Record<BookingStatus, string> = {
  active: 'active',
  past: 'done',
  cancelled: 'cancel',
};

// Etiquetas en español para la notificación push (va al cliente, no al admin).
const STAT_ES: Record<BookingStatus, string> = {
  active: 'En curso',
  past: 'Completada',
  cancelled: 'Cancelada',
};

export default function AdminBookingCard({ b }: { b: Booking }) {
  const { openSheet, closeSheet, toast } = useUI();
  const { t } = useI18n();
  const { reload } = useAdminData();

  async function togglePaid() {
    const next = b.payment_status === 'pagado' ? 'pendiente' : 'pagado';
    const { error } = await supabase.from('bookings').update({ payment_status: next }).eq('id', b.id);
    if (error) {
      toast(t('admin.updateError') + error.message);
      return;
    }
    void reload();
  }

  async function setStatus(s: BookingStatus) {
    closeSheet();
    if (s === b.status) return;
    const { error } = await supabase.from('bookings').update({ status: s }).eq('id', b.id);
    if (error) {
      toast(t('admin.updateError') + error.message);
      return;
    }
    toast(t('admin.statusChanged', { code: b.code, status: t('status.' + s) }));
    const carName = b.car ? `${b.car.brand} ${b.car.model}` : 'Tu carro';
    void notifyPush({
      userId: b.user_id,
      title: 'Tu reserva se actualizó',
      body: `${carName} · ${b.code} ahora está ${STAT_ES[s]}`,
      data: { screen: '/reservas' },
    });
    void reload();
  }

  return (
    <div className="tcard">
      <div className="thead">
        <div className="tthumb" style={b.status === 'cancelled' ? { opacity: 0.55 } : undefined}>
          {b.car && <CarImage car={b.car} />}
        </div>
        <div style={{ flex: 1 }}>
          <span className={'tstat ' + STAT_CLS[effectiveStatus(b)]}>
            <span className="d" />
            {t('status.' + effectiveStatus(b))}
          </span>
          <div className="tn">{b.car ? `${b.car.brand} ${b.car.model}` : t('common.car')}</div>
          <div className="td" style={{ color: 'var(--text)', fontWeight: 700 }}>
            {b.profile?.full_name ?? t('common.client')} · {b.profile?.phone ?? '—'}
          </div>
          <div className="td">
            {fmtDay(parseISODate(b.pickup_date))} – {fmtDay(parseISODate(b.return_date))} · {b.days}{' '}
            {b.days === 1 ? t('common.day') : t('common.days')}
          </div>
        </div>
      </div>
      <BookingMeta b={b} />
      <div className="tfoot">
        <div className="tp">
          <span style={{ color: 'var(--muted)', fontWeight: 600, fontSize: 12 }}>{b.code}</span> ·{' '}
          <b style={b.status === 'cancelled' ? { textDecoration: 'line-through', color: 'var(--muted)' } : undefined}>
            ${money(b.total)}
          </b>{' '}
          <span className={'paytag ' + b.payment_status}>{t('pay.status.' + b.payment_status)}</span>
        </div>
        <div className="tacts">
          <a onClick={togglePaid}>
            {b.payment_status === 'pagado' ? t('admin.markPending') : t('admin.markPaid')}
          </a>
          <a onClick={() => openSheet(<StatusSheet current={b.status} onSelect={setStatus} />)}>
            {t('admin.changeStatus')}
          </a>
        </div>
      </div>
    </div>
  );
}
