import type { BookingStatus } from '../../types/db';
import { useI18n } from '../../i18n/I18nContext';
import { IcCheck } from '../icons';

const OPTS: { k: BookingStatus; color: string }[] = [
  { k: 'active', color: 'var(--good)' },
  { k: 'past', color: 'var(--muted)' },
  { k: 'cancelled', color: 'var(--coral)' },
];

export default function StatusSheet({
  current,
  onSelect,
}: {
  current: BookingStatus;
  onSelect: (s: BookingStatus) => void;
}) {
  const { t } = useI18n();
  return (
    <>
      <div className="grabber" />
      <div className="sh-title">{t('statusSheet.title')}</div>
      <div className="sh-sub" style={{ marginBottom: 10 }}>
        {t('statusSheet.sub')}
      </div>
      {OPTS.map((o) => (
        <div key={o.k} className={'sortrow' + (current === o.k ? ' on' : '')} onClick={() => onSelect(o.k)}>
          <div className="mi" style={{ background: 'transparent', border: 'none' }}>
            <span style={{ width: 13, height: 13, borderRadius: '50%', background: o.color, display: 'block' }} />
          </div>
          <div className="ml">{t('status.' + o.k)}</div>
          {current === o.k ? (
            <IcCheck className="chk" />
          ) : (
            <span className="mc" style={{ color: 'var(--muted-2)' }}>
              ›
            </span>
          )}
        </div>
      ))}
    </>
  );
}
