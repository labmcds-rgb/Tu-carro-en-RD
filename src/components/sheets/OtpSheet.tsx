import { useEffect, useState } from 'react';
import { OTP_LENGTH } from '../../data/constants';
import { useI18n } from '../../i18n/I18nContext';
import OtpInput from '../OtpInput';
import { IcAlert, IcMail } from '../icons';

type Props = {
  email: string;
  onVerify: (code: string) => Promise<{ error: string | null }>;
  onResend: () => Promise<{ error: string | null }>;
};

export default function OtpSheet({ email, onVerify, onResend }: Props) {
  const { t } = useI18n();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setInterval(() => setCooldown((c) => (c <= 1 ? 0 : c - 1)), 1000);
    return () => window.clearInterval(t);
  }, [cooldown]);

  const complete = code.length === OTP_LENGTH;

  async function verify() {
    if (!complete || loading) return;
    setLoading(true);
    setError('');
    const res = await onVerify(code);
    setLoading(false);
    if (res.error) {
      setError(res.error);
      setCode('');
    }
  }

  async function resend() {
    if (cooldown > 0) return;
    const { error } = await onResend();
    if (error) setError(error);
    else {
      setCooldown(30);
      setError('');
    }
  }

  return (
    <>
      <div className="grabber" />
      <div className="otp-ic">
        <IcMail style={{ width: 26, height: 26 }} />
      </div>
      <div className="sh-title" style={{ textAlign: 'center' }}>
        {t('otp.title')}
      </div>
      <div className="sh-sub" style={{ textAlign: 'center', margin: '6px auto 18px', maxWidth: '30ch' }}>
        {t('otp.subA', { n: OTP_LENGTH })}
        <b style={{ color: 'var(--text)' }}>{email}</b>
      </div>

      <OtpInput value={code} onChange={setCode} />

      {error && (
        <div className="auth-error show" style={{ marginTop: 16 }}>
          <IcAlert />
          <span>{error}</span>
        </div>
      )}

      <div className="sheet-actions" style={{ marginTop: 20 }}>
        <button className="btn btn-primary" onClick={verify} disabled={!complete || loading}>
          {loading ? t('otp.verifying') : t('otp.verifyBtn')}
        </button>
      </div>

      <div className="otp-resend">
        {t('otp.notArrived')}
        <a className={cooldown > 0 ? 'disabled' : ''} onClick={resend}>
          {cooldown > 0 ? t('otp.resendIn', { s: cooldown }) : t('otp.resend')}
        </a>
      </div>
    </>
  );
}
