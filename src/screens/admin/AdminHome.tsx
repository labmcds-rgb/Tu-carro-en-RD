import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAdminData } from '../../context/AdminDataContext';
import { useI18n } from '../../i18n/I18nContext';
import { useCarForm } from '../../hooks/useCarForm';
import { money } from '../../lib/format';
import Splash from '../../components/Splash';
import AdminBookingCard from './AdminBookingCard';

export default function AdminHome() {
  const nav = useNavigate();
  const { profile, isAdmin, profileLoaded, session } = useAuth();
  const { cars, bookings, loading, reload } = useAdminData();
  const { t } = useI18n();
  const openCarForm = useCarForm();

  // Refresca al abrir el panel, por si entraron reservas nuevas.
  useEffect(() => {
    void reload();
  }, [reload]);

  if (session && !profileLoaded) return <Splash />;
  if (!isAdmin) return <Navigate to="/" replace />;

  const name = (profile?.full_name ?? 'Admin').split(' ')[0];
  const initials = profile?.avatar_initials ?? (profile?.full_name ?? 'AD').slice(0, 2).toUpperCase();
  const activeCount = bookings.filter((b) => b.status === 'active').length;
  const revenue = bookings.filter((b) => b.status !== 'cancelled').reduce((s, b) => s + b.total, 0);
  const recent = bookings.slice(0, 4);

  return (
    <section className="screen active">
      <div className="home-top">
        <div className="greet">
          <div className="hi">{t('adminHome.title')}</div>
          <div className="nm">{t('adminHome.hello', { name })}</div>
        </div>
        <div className="avatar">
          {initials}
          <span className="ring" />
        </div>
      </div>

      <div className="prof-stats" style={{ paddingTop: 6 }}>
        <div className="pstat">
          <div className="pv">{cars.length}</div>
          <div className="pl">{t('adminHome.cars')}</div>
        </div>
        <div className="pstat">
          <div className="pv">{activeCount}</div>
          <div className="pl">{t('adminHome.active')}</div>
        </div>
        <div className="pstat">
          <div className="pv" style={{ fontSize: 15 }}>
            ${money(revenue)}
          </div>
          <div className="pl">{t('adminHome.revenue')}</div>
        </div>
      </div>

      <div style={{ padding: '14px 20px 2px' }}>
        <button className="btn btn-primary" onClick={() => openCarForm()}>
          {t('adminHome.addCarFleet')}
        </button>
      </div>

      <div className="sec-head">
        <h2>{t('adminHome.recentBookings')}</h2>
        <a onClick={() => nav('/admin/reservas')}>{t('adminHome.seeAll')}</a>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '30px 20px', fontWeight: 600 }}>
          {t('common.loading')}
        </div>
      ) : recent.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '30px 20px', fontWeight: 600 }}>
          {t('adminHome.noBookings')}
        </div>
      ) : (
        <div style={{ paddingBottom: 20 }}>
          {recent.map((b) => (
            <AdminBookingCard key={b.id} b={b} />
          ))}
        </div>
      )}
    </section>
  );
}
