import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { useI18n } from '../../i18n/I18nContext';
import { loadExtrasPricing, saveExtrasPricing, DEFAULT_PRICING, type ExtrasPricing } from '../../lib/pricing';
import Splash from '../../components/Splash';
import { IcChevronLeft } from '../../components/icons';

export default function AdminExtras() {
  const nav = useNavigate();
  const { isAdmin, profileLoaded, session } = useAuth();
  const { toast } = useUI();
  const { t } = useI18n();
  const [p, setP] = useState<ExtrasPricing>(DEFAULT_PRICING);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void loadExtrasPricing().then(setP);
  }, []);

  if (session && !profileLoaded) return <Splash />;
  if (!isAdmin) return <Navigate to="/" replace />;

  const setField = (k: keyof ExtrasPricing, v: number) => setP((cur) => ({ ...cur, [k]: v }));

  async function save() {
    setSaving(true);
    const clean: ExtrasPricing = {
      seguro: Math.max(0, Math.round(p.seguro) || 0),
      aero_santiago: Math.max(0, Math.round(p.aero_santiago) || 0),
      aero_sdq: Math.max(0, Math.round(p.aero_sdq) || 0),
      aero_puj: Math.max(0, Math.round(p.aero_puj) || 0),
    };
    const { error } = await saveExtrasPricing(clean);
    setSaving(false);
    if (error) {
      toast(t('adminExtras.saveError') + error.message);
      return;
    }
    setP(clean);
    toast(t('adminExtras.saved'));
  }

  const field = (label: string, k: keyof ExtrasPricing) => (
    <div className="field">
      <label>{label}</label>
      <div className="inp" style={{ gap: 8 }}>
        <span style={{ color: 'var(--muted)', fontWeight: 800 }}>$</span>
        <input type="number" min={0} value={p[k]} onChange={(e) => setField(k, +e.target.value)} />
      </div>
    </div>
  );

  return (
    <section className="screen stack active">
      <div className="stackhead">
        <button className="back" onClick={() => nav('/perfil')} aria-label={t('common.back')}>
          <IcChevronLeft />
        </button>
        <div className="t">{t('adminExtras.title')}</div>
      </div>

      <div style={{ padding: '4px 20px 24px' }}>
        <div className="b-sec" style={{ padding: '6px 0' }}>
          <h3>{t('adminExtras.insuranceTitle')}</h3>
        </div>
        {field(t('adminExtras.insurance'), 'seguro')}

        <div className="b-sec" style={{ padding: '16px 0 6px' }}>
          <h3>{t('adminExtras.airportTitle')}</h3>
        </div>
        {field('Santiago', 'aero_santiago')}
        {field('Santo Domingo', 'aero_sdq')}
        {field('Punta Cana', 'aero_puj')}

        <button className="btn btn-primary" style={{ marginTop: 18 }} onClick={save} disabled={saving}>
          {saving ? t('booking.saving') : t('common.save')}
        </button>
      </div>
    </section>
  );
}
