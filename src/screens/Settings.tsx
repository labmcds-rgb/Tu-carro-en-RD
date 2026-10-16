import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../i18n/I18nContext';
import { enablePush, disablePush, isNative } from '../lib/push';
import ChangePasswordSheet from '../components/sheets/ChangePasswordSheet';
import { IcChevronLeft, IcDoc, IcCarFront, IcX, IcLock } from '../components/icons';

function readBool(key: string, def: boolean) {
  try {
    const v = localStorage.getItem(key);
    return v === null ? def : v === '1';
  } catch {
    return def;
  }
}
function writeBool(key: string, val: boolean) {
  try {
    localStorage.setItem(key, val ? '1' : '0');
  } catch {
    /* almacenamiento no disponible: se ignora */
  }
}

export default function Settings() {
  const nav = useNavigate();
  const { toast, openSheet, closeSheet } = useUI();
  const { user, deleteAccount } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t, lang, setLang } = useI18n();
  const [notif, setNotif] = useState(() => readBool('tucarro_notif', true));

  async function toggleNotif() {
    const v = !notif;
    if (v && isNative() && user) {
      const ok = await enablePush(user.id);
      if (!ok) {
        toast(t('settings.notifPermToast'));
        return;
      }
    }
    if (!v && isNative() && user) {
      await disablePush(user.id);
    }
    setNotif(v);
    writeBool('tucarro_notif', v);
    toast(v ? t('settings.notifOnToast') : t('settings.notifOffToast'));
  }

  async function doDeleteAccount() {
    closeSheet();
    toast(t('settings.deletingToast'));
    const { error } = await deleteAccount();
    if (error) {
      toast(error);
      return;
    }
    toast(t('settings.deletedToast'));
    nav('/login');
  }

  function askDeleteAccount() {
    openSheet(
      <>
        <div className="grabber" />
        <div className="cancel-body">
          <div className="cancel-ic">
            <IcX style={{ width: 30, height: 30 }} />
          </div>
          <div className="sh-title">{t('settings.deleteTitle')}</div>
          <p className="sh-sub" style={{ margin: '8px auto 0', maxWidth: '28ch' }}>
            {t('settings.deleteBodyA')}
            <b style={{ color: 'var(--text)' }}>{t('settings.deleteBodyBold')}</b>
            {t('settings.deleteBodyB')}
          </p>
        </div>
        <div className="sheet-actions">
          <button className="btn btn-danger" onClick={doDeleteAccount}>
            {t('settings.deleteConfirm')}
          </button>
          <button className="btn btn-ghost" onClick={closeSheet}>
            {t('common.cancel')}
          </button>
        </div>
      </>,
    );
  }

  return (
    <section className="screen stack active">
      <div className="stackhead">
        <button className="back" onClick={() => nav('/perfil')} aria-label={t('common.back')}>
          <IcChevronLeft />
        </button>
        <div className="t">{t('settings.title')}</div>
      </div>

      <div className="b-sec">
        <h3>{t('settings.language')}</h3>
      </div>
      <div className="seg" role="group" aria-label={t('settings.language')}>
        <button className={lang === 'es' ? 'on' : ''} onClick={() => setLang('es')} aria-pressed={lang === 'es'}>
          🇩🇴 Español
        </button>
        <button className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en')} aria-pressed={lang === 'en'}>
          🇺🇸 English
        </button>
      </div>

      <div className="b-sec">
        <h3>{t('settings.theme')}</h3>
      </div>
      <div className="seg" role="group" aria-label={t('settings.theme')}>
        <button
          className={theme === 'dark' ? 'on' : ''}
          onClick={() => setTheme('dark')}
          aria-pressed={theme === 'dark'}
        >
          🌙 {t('settings.themeDark')}
        </button>
        <button
          className={theme === 'light' ? 'on' : ''}
          onClick={() => setTheme('light')}
          aria-pressed={theme === 'light'}
        >
          ☀️ {t('settings.themeLight')}
        </button>
      </div>

      <div className="b-sec">
        <h3>{t('settings.notifications')}</h3>
      </div>
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="extra" style={{ margin: 0 }}>
          <div className="en">
            {t('settings.notifTitle')}
            <small>{t('settings.notifDesc')}</small>
          </div>
          <div className={'switch' + (notif ? ' on' : '')} onClick={toggleNotif} role="switch" aria-checked={notif}>
            <span className="knob" />
          </div>
        </div>
      </div>

      <div className="b-sec">
        <h3>{t('settings.info')}</h3>
      </div>
      <div className="menu" style={{ paddingTop: 0 }}>
        <div className="mrow" onClick={() => nav('/terminos')}>
          <div className="mi">
            <IcDoc />
          </div>
          <div className="ml">{t('settings.terms')}</div>
          <div className="mc">›</div>
        </div>
        <div className="mrow" onClick={() => nav('/privacidad')}>
          <div className="mi">
            <IcDoc />
          </div>
          <div className="ml">{t('settings.privacy')}</div>
          <div className="mc">›</div>
        </div>
      </div>

      <div className="b-sec">
        <h3>{t('settings.account')}</h3>
      </div>
      <div className="menu" style={{ paddingTop: 0 }}>
        <div className="mrow" onClick={() => openSheet(<ChangePasswordSheet />)}>
          <div className="mi">
            <IcLock />
          </div>
          <div className="ml">{t('settings.changePassword')}</div>
          <div className="mc">›</div>
        </div>
        <div className="mrow danger" onClick={askDeleteAccount}>
          <div className="mi">
            <IcX />
          </div>
          <div className="ml">{t('settings.deleteAccount')}</div>
          <div className="mc">›</div>
        </div>
      </div>

      <div className="about">
        <div className="about-logo">
          <IcCarFront style={{ width: 22, height: 22 }} />
        </div>
        <div className="about-name">TU CARRO EN RD</div>
        <div className="about-ver">{t('settings.versionLabel')} 1.0.0</div>
      </div>
    </section>
  );
}
