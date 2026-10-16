import type { Booking } from '../../types/db';
import { useI18n } from '../../i18n/I18nContext';
import { IcX } from '../icons';

export default function CancelSheet({
  booking,
  onConfirm,
  onBack,
}: {
  booking: Booking;
  onConfirm: () => void;
  onBack: () => void;
}) {
  const { t } = useI18n();
  const carName = booking.car ? `${booking.car.brand} ${booking.car.model}` : t('cancel.thisCar');
  return (
    <>
      <div className="grabber" />
      <div className="cancel-body">
        <div className="cancel-ic">
          <IcX style={{ width: 30, height: 30 }} />
        </div>
        <div className="sh-title">{t('cancel.title')}</div>
        <p className="sh-sub" style={{ margin: '8px auto 0', maxWidth: '27ch' }}>
          {t('cancel.bodyA')}
          <b style={{ color: 'var(--text)' }}>{carName}</b>
          {t('cancel.bodyB', { code: booking.code, pickup: booking.pickup_date, return: booking.return_date })}
        </p>
      </div>
      <div className="sheet-actions">
        <button className="btn btn-danger" onClick={onConfirm}>
          {t('cancel.confirm')}
        </button>
        <button className="btn btn-ghost" onClick={onBack}>
          {t('common.goBack')}
        </button>
      </div>
    </>
  );
}
