import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { useI18n } from '../i18n/I18nContext';
import { formatPhone } from '../lib/format';
import { hasSupabaseConfig } from '../lib/supabase';
import { IcUser, IcMail, IcPhone, IcLock, IcEye, IcAlert, IcCheck, IcGoogle } from '../components/icons';
import OtpSheet from '../components/sheets/OtpSheet';
import ForgotPasswordSheet from '../components/sheets/ForgotPasswordSheet';

export default function Login() {
  const nav = useNavigate();
  const { session, signInWithPassword, signUp, signInWithGoogle, verifySignupOtp, resendSignup } = useAuth();
  const { toast, openSheet, closeSheet } = useUI();
  const { t, lang, setLang } = useI18n();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const reg = mode === 'register';

  if (session) return <Navigate to="/" replace />;

  function switchMode(m: 'login' | 'register') {
    setMode(m);
    setError('');
    setInfo('');
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setInfo('');
    if (!hasSupabaseConfig) {
      setError(t('auth.errNoConfig'));
      return;
    }
    const mail = email.trim();
    if (reg) {
      if (!name.trim() || !mail || !phone.trim() || !password) {
        setError(t('auth.errAllFields'));
        return;
      }
      if (password.length < 6) {
        setError(t('auth.errPwShort'));
        return;
      }
      setLoading(true);
      const { error, needsConfirmation, alreadyRegistered } = await signUp(mail, password, name.trim(), phone.trim());
      setLoading(false);
      if (error) return setError(error);
      if (alreadyRegistered) {
        setMode('login');
        setError(t('auth.errAlready'));
        return;
      }
      if (needsConfirmation) {
        openOtp(mail);
        return;
      }
      toast(t('auth.createdToast'));
      nav('/');
    } else {
      if (!mail || !password) {
        setError(t('auth.errLoginFields'));
        return;
      }
      setLoading(true);
      const { error } = await signInWithPassword(mail, password);
      setLoading(false);
      if (error) return setError(error);
      toast(t('auth.welcomeBackToast'));
      nav('/');
    }
  }

  async function onGoogle() {
    setError('');
    if (!hasSupabaseConfig) {
      setError(t('auth.errNoConfig'));
      return;
    }
    const { error } = await signInWithGoogle();
    if (error) setError(error);
  }

  function openOtp(mail: string) {
    openSheet(
      <OtpSheet
        email={mail}
        onVerify={async (code) => {
          const res = await verifySignupOtp(mail, code);
          if (!res.error) {
            closeSheet();
            toast(t('auth.verifiedToast'));
            nav('/');
          }
          return res;
        }}
        onResend={() => resendSignup(mail)}
      />,
    );
  }

  return (
    <div className="auth">
      <div className="auth-seg" style={{ maxWidth: 160, marginLeft: 'auto', marginBottom: 18 }}>
        <button type="button" className={lang === 'es' ? 'on' : ''} onClick={() => setLang('es')}>
          ES
        </button>
        <button type="button" className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en')}>
          EN
        </button>
      </div>
      <div className="auth-brand">
        <div className="auth-logo">
          <svg viewBox="0 0 32 32" fill="none">
            <path
              d="M4 20l2-6c.4-1.2 1.5-2 2.8-2h10.4c1.3 0 2.4.8 2.8 2l2 6"
              stroke="#3C7BFF"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M3 20h26v3a2 2 0 0 1-2 2h-1.5a2.5 2.5 0 0 1-5 0h-7a2.5 2.5 0 0 1-5 0H5a2 2 0 0 1-2-2v-3z"
              fill="#3C7BFF"
            />
            <circle cx="9.5" cy="24" r="2.4" fill="#0B1020" stroke="#22D3EE" strokeWidth="1.5" />
            <circle cx="22.5" cy="24" r="2.4" fill="#0B1020" stroke="#22D3EE" strokeWidth="1.5" />
          </svg>
        </div>
        <div className="auth-name">TU CARRO EN RD</div>
        <div className="auth-tag">{t('auth.tag')}</div>
      </div>

      <div className="auth-seg">
        <button type="button" className={mode === 'login' ? 'on' : ''} onClick={() => switchMode('login')}>
          {t('auth.login')}
        </button>
        <button type="button" className={reg ? 'on' : ''} onClick={() => switchMode('register')}>
          {t('auth.register')}
        </button>
      </div>

      <form onSubmit={onSubmit}>
        {reg && (
          <div className="field">
            <label>{t('auth.fullName')}</label>
            <div className="inp">
              <IcUser />
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('auth.fullNamePh')} />
            </div>
          </div>
        )}

        <div className="field">
          <label>{t('auth.email')}</label>
          <div className="inp">
            <IcMail />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.emailPh')}
              autoComplete="email"
            />
          </div>
        </div>

        {reg && (
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
        )}

        <div className="field">
          <label>{t('auth.password')}</label>
          <div className="inp">
            <IcLock />
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={reg ? 'new-password' : 'current-password'}
            />
            <span className="eye" onClick={() => setShowPw((v) => !v)}>
              <IcEye />
            </span>
          </div>
        </div>

        {!reg && (
          <div className="auth-forgot">
            <a onClick={() => openSheet(<ForgotPasswordSheet initialEmail={email} />)}>{t('auth.forgot')}</a>
          </div>
        )}

        {error && (
          <div className="auth-error show">
            <IcAlert />
            <span>{error}</span>
          </div>
        )}
        {info && (
          <div className="auth-error show" style={{ background: 'rgba(52,211,153,.1)', borderColor: 'rgba(52,211,153,.32)', color: '#8ef0c4' }}>
            <IcCheck style={{ color: 'var(--good)' }} />
            <span>{info}</span>
          </div>
        )}

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? t('auth.submitLoading') : reg ? t('auth.createBtn') : t('auth.loginBtn')}
        </button>
      </form>

      <div className="auth-divider">{t('auth.divider')}</div>
      <div className="auth-social">
        <button type="button" className="social-btn" onClick={onGoogle}>
          <IcGoogle />
          {t('auth.google')}
        </button>
      </div>

      <div className="auth-legal">
        {t('auth.legalA')}
        <a onClick={() => nav('/terminos')}>{t('auth.legalTerms')}</a>
        {t('auth.legalAnd')}
        <a onClick={() => nav('/privacidad')}>{t('auth.legalPrivacy')}</a>.
      </div>
    </div>
  );
}
