import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useUI } from '../context/UIContext';
import { useI18n } from '../i18n/I18nContext';
import { WHATSAPP, openWhatsApp } from '../data/constants';
import { money } from '../lib/format';
import { IcCheck, IcWhatsApp } from '../components/icons';

type State = { code?: string; carId?: string; method?: string; total?: number; zelleHandle?: string };

export default function Success() {
  const nav = useNavigate();
  const { state } = useLocation() as { state: State | null };
  const { toast } = useUI();
  const { t } = useI18n();

  if (!state?.code) return <Navigate to="/" replace />;

  const showZelle = state.method === 'zelle' && !!state.zelleHandle;

  return (
    <section className="screen stack active">
      <div className="success">
        <div className="succ-ic">
          <IcCheck style={{ width: 44, height: 44 }} />
        </div>
        <h1>{t('success.title')}</h1>
        <p>{t('success.text')}</p>
        <div className="succ-code">
          <div className="cl">{t('success.codeLabel')}</div>
          <div className="cv">{state.code}</div>
        </div>
        {showZelle && (
          <div
            className="pay-how"
            style={{
              maxWidth: '36ch',
              textAlign: 'center',
              color: 'var(--gold)',
              fontWeight: 700,
              margin: '0 0 18px',
            }}
          >
            🏦{' '}
            {t('success.payZelle', {
              amount: `$${money(state.total ?? 0)}`,
              handle: state.zelleHandle ?? '',
            })}
          </div>
        )}
        <div className="actions">
          <button
            className="btn btn-wa"
            onClick={() => {
              openWhatsApp();
              toast(t('common.openingWhatsApp') + WHATSAPP);
            }}
          >
            <IcWhatsApp style={{ width: 19, height: 19 }} />
            {t('success.waBtn')}
          </button>
          <button className="btn btn-ghost" onClick={() => nav('/reservas')}>
            {t('success.viewBookings')}
          </button>
        </div>
      </div>
    </section>
  );
}
