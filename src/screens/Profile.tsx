import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { useI18n } from '../i18n/I18nContext';
import { WHATSAPP, openWhatsApp } from '../data/constants';
import { IcSettings, IcCarFront, IcChat, IcLogout, IcUser, IcUserPlus, IcHeart } from '../components/icons';

export default function Profile() {
  const nav = useNavigate();
  const { profile, user, isAdmin, signOut } = useAuth();
  const { toast } = useUI();
  const { t } = useI18n();

  const name = profile?.full_name ?? t('common.user');
  const initials = profile?.avatar_initials ?? name.slice(0, 2).toUpperCase();
  const phone = profile?.phone ?? user?.email ?? '';

  async function logout() {
    await signOut();
    toast(t('profile.loggedOutToast'));
    nav('/login');
  }

  return (
    <section className="screen active">
      <div className="topbar">
        <h2>{t('nav.profile')}</h2>
      </div>

      <div className="prof-head">
        <div className="prof-av">
          {initials}
          <span className="ring" />
        </div>
        <h1>{name}</h1>
        <div className="pe">
          {phone}
          {isAdmin ? ` · ${t('profile.admin')}` : ''}
        </div>
      </div>

      <div className="menu">
        <div className="mrow" onClick={() => nav('/perfil/editar')}>
          <div className="mi">
            <IcUser />
          </div>
          <div className="ml">{t('profile.editProfile')}</div>
          <div className="mc">›</div>
        </div>
        {isAdmin && (
          <div className="mrow" onClick={() => nav('/admin/equipo')}>
            <div className="mi">
              <IcUserPlus />
            </div>
            <div className="ml">{t('profile.admins')}</div>
            <div className="mc">›</div>
          </div>
        )}
        {isAdmin && (
          <div className="mrow" onClick={() => nav('/admin/extras')}>
            <div className="mi">
              <IcCarFront />
            </div>
            <div className="ml">{t('profile.extrasPricing')}</div>
            <div className="mc">›</div>
          </div>
        )}
        {isAdmin && (
          <div className="mrow" onClick={() => nav('/admin/pago')}>
            <div className="mi">
              <IcChat />
            </div>
            <div className="ml">{t('profile.payment')}</div>
            <div className="mc">›</div>
          </div>
        )}
        {!isAdmin && (
          <div className="mrow" onClick={() => nav('/reservas')}>
            <div className="mi">
              <IcCarFront />
            </div>
            <div className="ml">{t('trips.title')}</div>
            <div className="mc">›</div>
          </div>
        )}
        {!isAdmin && (
          <div className="mrow" onClick={() => nav('/favoritos')}>
            <div className="mi">
              <IcHeart />
            </div>
            <div className="ml">{t('profile.favorites')}</div>
            <div className="mc">›</div>
          </div>
        )}
        <div className="mrow" onClick={() => nav('/ajustes')}>
          <div className="mi">
            <IcSettings />
          </div>
          <div className="ml">{t('profile.settings')}</div>
          <div className="mc">›</div>
        </div>
        <div
          className="mrow"
          onClick={() => {
            openWhatsApp();
            toast(t('common.openingWhatsApp') + WHATSAPP);
          }}
        >
          <div className="mi">
            <IcChat />
          </div>
          <div className="ml">{t('profile.support')}</div>
          <div className="mc">›</div>
        </div>
        <div className="mrow danger" onClick={logout}>
          <div className="mi">
            <IcLogout />
          </div>
          <div className="ml">{t('profile.logout')}</div>
        </div>
      </div>
    </section>
  );
}
