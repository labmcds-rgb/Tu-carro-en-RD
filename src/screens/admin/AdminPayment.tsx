import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { useI18n } from '../../i18n/I18nContext';
import { loadZelle, saveZelle, DEFAULT_ZELLE, type ZelleInfo } from '../../lib/zelle';
import Splash from '../../components/Splash';
import { IcChevronLeft } from '../../components/icons';

export default function AdminPayment() {
  const nav = useNavigate();
  const { isAdmin, profileLoaded, session } = useAuth();
  const { toast } = useUI();
  const { t } = useI18n();
  const [z, setZ] = useState<ZelleInfo>(DEFAULT_ZELLE);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void loadZelle().then(setZ);
  }, []);

  if (session && !profileLoaded) return <Splash />;
  if (!isAdmin) return <Navigate to="/" replace />;

  async function save() {
    setSaving(true);
    const clean: ZelleInfo = { name: z.name.trim(), handle: z.handle.trim() };
    const { error } = await saveZelle(clean);
    setSaving(false);
    if (error) {
      toast(t('adminPay.saveError') + error.message);
      return;
    }
    setZ(clean);
    toast(t('adminPay.saved'));
  }

  return (
    <section className="screen stack active">
      <div className="stackhead">
        <button className="back" onClick={() => nav('/perfil')} aria-label={t('common.back')}>
          <IcChevronLeft />
        </button>
        <div className="t">{t('adminPay.title')}</div>
      </div>

      <div style={{ padding: '4px 20px 24px' }}>
        <div className="sh-sub" style={{ margin: '2px 0 14px' }}>
          {t('adminPay.intro')}
        </div>

        <div className="field">
          <label>{t('adminPay.handle')}</label>
          <div className="inp">
            <input
              value={z.handle}
              onChange={(e) => setZ((c) => ({ ...c, handle: e.target.value }))}
              placeholder={t('adminPay.handlePh')}
            />
          </div>
        </div>

        <div className="field">
          <label>{t('adminPay.name')}</label>
          <div className="inp">
            <input
              value={z.name}
              onChange={(e) => setZ((c) => ({ ...c, name: e.target.value }))}
              placeholder={t('adminPay.namePh')}
            />
          </div>
        </div>

        <button className="btn btn-primary" style={{ marginTop: 18 }} onClick={save} disabled={saving}>
          {saving ? t('booking.saving') : t('common.save')}
        </button>
      </div>
    </section>
  );
}
