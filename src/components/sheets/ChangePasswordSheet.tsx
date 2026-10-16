import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { useI18n } from '../../i18n/I18nContext';
import { IcLock, IcEye, IcAlert } from '../icons';

export default function ChangePasswordSheet() {
  const { updatePassword } = useAuth();
  const { closeSheet, toast } = useUI();
  const { t } = useI18n();
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit() {
    setError('');
    if (pw.length < 6) {
      setError(t('forgot.pwShort'));
      return;
    }
    if (pw !== pw2) {
      setError(t('changePw.mismatch'));
      return;
    }
    setSaving(true);
    const { error } = await updatePassword(pw);
    setSaving(false);
    if (error) {
      setError(error);
      return;
    }
    closeSheet();
    toast(t('changePw.done'));
  }

  return (
    <>
      <div className="grabber" />
      <div className="otp-ic">
        <IcLock style={{ width: 24, height: 24 }} />
      </div>
      <div className="sh-title" style={{ textAlign: 'center' }}>
        {t('changePw.title')}
      </div>
      <div className="sh-sub" style={{ textAlign: 'center', margin: '6px auto 16px', maxWidth: '30ch' }}>
        {t('changePw.sub')}
      </div>

      <div className="field">
        <label>{t('forgot.newPassword')}</label>
        <div className="inp">
          <IcLock />
          <input
            type={show ? 'text' : 'password'}
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder={t('forgot.pwPh')}
            autoComplete="new-password"
          />
          <span className="eye" onClick={() => setShow((v) => !v)}>
            <IcEye />
          </span>
        </div>
      </div>

      <div className="field">
        <label>{t('changePw.confirm')}</label>
        <div className="inp">
          <IcLock />
          <input
            type={show ? 'text' : 'password'}
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            placeholder={t('changePw.confirmPh')}
            autoComplete="new-password"
          />
        </div>
      </div>

      {error && (
        <div className="auth-error show">
          <IcAlert />
          <span>{error}</span>
        </div>
      )}

      <div className="sheet-actions" style={{ marginTop: 14 }}>
        <button className="btn btn-primary" onClick={submit} disabled={saving}>
          {saving ? t('auth.submitLoading') : t('forgot.changePw')}
        </button>
      </div>
    </>
  );
}
