import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { useI18n } from '../i18n/I18nContext';
import { supabase } from '../lib/supabase';
import { formatPhone } from '../lib/format';
import { IcChevronLeft, IcUser, IcPhone, IcMail } from '../components/icons';

function initialsOf(name: string) {
  return name.trim().replace(/\s+/g, '').slice(0, 2).toUpperCase() || 'TU';
}

export default function EditProfile() {
  const nav = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useUI();
  const { t } = useI18n();

  const [name, setName] = useState(profile?.full_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!user) return;
    if (!name.trim()) {
      toast(t('editProfile.nameRequired'));
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: name.trim(), phone: phone.trim(), avatar_initials: initialsOf(name) })
      .eq('id', user.id);
    setSaving(false);
    if (error) {
      toast(t('editProfile.saveError') + error.message);
      return;
    }
    await refreshProfile();
    toast(t('editProfile.savedToast'));
    nav('/perfil');
  }

  return (
    <section className="screen stack active">
      <div className="stackhead">
        <button className="back" onClick={() => nav('/perfil')} aria-label={t('common.back')}>
          <IcChevronLeft />
        </button>
        <div className="t">{t('profile.editProfile')}</div>
      </div>

      <div className="prof-head" style={{ paddingBottom: 8 }}>
        <div className="prof-av">
          {initialsOf(name)}
          <span className="ring" />
        </div>
      </div>

      <div style={{ padding: '4px 20px 20px' }}>
        <div className="field">
          <label>{t('auth.fullName')}</label>
          <div className="inp">
            <IcUser />
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('editProfile.namePh')} />
          </div>
        </div>
        <div className="field">
          <label>{t('auth.phone')}</label>
          <div className="inp">
            <IcPhone />
            <input
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              placeholder="809-000-0000"
            />
          </div>
        </div>
        <div className="field">
          <label>{t('editProfile.emailLabel')}</label>
          <div className="inp" style={{ opacity: 0.6 }}>
            <IcMail />
            <input value={profile?.email ?? user?.email ?? ''} disabled />
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--muted-2)', fontWeight: 600, marginTop: 6 }}>
            {t('editProfile.emailLocked')}
          </div>
        </div>

        <button className="btn btn-primary" style={{ marginTop: 10 }} onClick={save} disabled={saving}>
          {saving ? t('booking.saving') : t('editProfile.saveChanges')}
        </button>
      </div>
    </section>
  );
}
