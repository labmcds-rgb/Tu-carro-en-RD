import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { useI18n } from '../../i18n/I18nContext';
import { OTP_LENGTH } from '../../data/constants';
import OtpInput from '../OtpInput';
import { IcAlert, IcMail, IcLock, IcEye } from '../icons';

export default function ForgotPasswordSheet({ initialEmail }: { initialEmail: string }) {
  const { sendPasswordReset, verifyRecoveryOtp, updatePassword } = useAuth();
  const { closeSheet, toast } = useUI();
  const { t } = useI18n();
  const nav = useNavigate();

  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setInterval(() => setCooldown((c) => (c <= 1 ? 0 : c - 1)), 1000);
    return () => window.clearInterval(t);
  }, [cooldown]);

  async function send() {
    const mail = email.trim();
    if (!mail) {
      setError(t('forgot.emailRequired'));
      return;
    }
    setLoading(true);
    setError('');
    const { error } = await sendPasswordReset(mail);
    setLoading(false);
    if (error) {
      setError(error);
      return;
    }
    setStep('code');
    setCooldown(30);
  }

  async function resend() {
    if (cooldown > 0) return;
    const { error } = await sendPasswordReset(email.trim());
    if (error) setError(error);
    else {
      setCooldown(30);
      setError('');
    }
  }

  async function submit() {
    if (code.length !== OTP_LENGTH) {
      setError(t('forgot.codeLen', { n: OTP_LENGTH }));
      return;
    }
    if (pw.length < 6) {
      setError(t('forgot.pwShort'));
      return;
    }
    setLoading(true);
    setError('');
    const v = await verifyRecoveryOtp(email.trim(), code);
    if (v.error) {
      setLoading(false);
      setError(v.error);
      setCode('');
      return;
    }
    const u = await updatePassword(pw);
    setLoading(false);
    if (u.error) {
      setError(u.error);
      return;
    }
    closeSheet();
    toast(t('forgot.doneToast'));
    nav('/');
  }

  return (
    <>
      <div className="grabber" />
      <div className="otp-ic">
        <IcLock style={{ width: 24, height: 24 }} />
      </div>

      {step === 'email' ? (
        <>
          <div className="sh-title" style={{ textAlign: 'center' }}>
            {t('forgot.title')}
          </div>
          <div className="sh-sub" style={{ textAlign: 'center', margin: '6px auto 18px', maxWidth: '30ch' }}>
            {t('forgot.subEmail', { n: OTP_LENGTH })}
          </div>
          <div className="field">
            <label>{t('auth.email')}</label>
            <div className="inp">
              <IcMail />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.emailPh')}
              />
            </div>
          </div>
          {error && (
            <div className="auth-error show">
              <IcAlert />
              <span>{error}</span>
            </div>
          )}
          <div className="sheet-actions" style={{ marginTop: 16 }}>
            <button className="btn btn-primary" onClick={send} disabled={loading}>
              {loading ? t('forgot.sending') : t('forgot.sendCode')}
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="sh-title" style={{ textAlign: 'center' }}>
            {t('forgot.checkEmail')}
          </div>
          <div className="sh-sub" style={{ textAlign: 'center', margin: '6px auto 16px', maxWidth: '32ch' }}>
            {t('forgot.subCodeA')}
            <b style={{ color: 'var(--text)' }}>{email}</b>
            {t('forgot.subCodeB')}
          </div>
          <OtpInput value={code} onChange={setCode} />
          <div className="field" style={{ marginTop: 16 }}>
            <label>{t('forgot.newPassword')}</label>
            <div className="inp">
              <IcLock />
              <input
                type={showPw ? 'text' : 'password'}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder={t('forgot.pwPh')}
              />
              <span className="eye" onClick={() => setShowPw((v) => !v)}>
                <IcEye />
              </span>
            </div>
          </div>
          {error && (
            <div className="auth-error show">
              <IcAlert />
              <span>{error}</span>
            </div>
          )}
          <div className="sheet-actions" style={{ marginTop: 8 }}>
            <button className="btn btn-primary" onClick={submit} disabled={loading}>
              {loading ? t('auth.submitLoading') : t('forgot.changePw')}
            </button>
          </div>
          <div className="otp-resend">
            {t('otp.notArrived')}
            <a className={cooldown > 0 ? 'disabled' : ''} onClick={resend}>
              {cooldown > 0 ? t('otp.resendIn', { s: cooldown }) : t('otp.resend')}
            </a>
          </div>
        </>
      )}
    </>
  );
}
