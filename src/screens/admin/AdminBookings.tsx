import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAdminData } from '../../context/AdminDataContext';
import { useI18n } from '../../i18n/I18nContext';
import Splash from '../../components/Splash';
import AdminBookingCard from './AdminBookingCard';
import { effectiveStatus } from '../../lib/derive';
import { IcSearch, IcX } from '../../components/icons';

type Filter = 'todas' | 'active' | 'past';

export default function AdminBookings() {
  const { isAdmin, profileLoaded, session } = useAuth();
  const { bookings, loading, reload } = useAdminData();
  const { t } = useI18n();
  const [filter, setFilter] = useState<Filter>('todas');
  const [q, setQ] = useState('');

  // Refresca al abrir la pantalla, por si entraron reservas nuevas.
  useEffect(() => {
    void reload();
  }, [reload]);

  if (session && !profileLoaded) return <Splash />;
  if (!isAdmin) return <Navigate to="/" replace />;

  const term = q.trim().toLowerCase();
  const items = bookings
    .filter((b) =>
      filter === 'todas' ? true : filter === 'active' ? effectiveStatus(b) === 'active' : effectiveStatus(b) !== 'active',
    )
    .filter((b) => {
      if (!term) return true;
      const haystack = [
        b.code,
        b.profile?.full_name ?? '',
        b.profile?.phone ?? '',
        b.car ? `${b.car.brand} ${b.car.model}` : '',
        b.car?.plate ?? '',
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });

  return (
    <section className="screen active">
      <div className="topbar">
        <h2>{t('nav.adminBookings')}</h2>
      </div>

      <div className="seg">
        <button className={filter === 'todas' ? 'on' : ''} onClick={() => setFilter('todas')}>
          {t('adminBookings.all')}
        </button>
        <button className={filter === 'active' ? 'on' : ''} onClick={() => setFilter('active')}>
          {t('trips.active')}
        </button>
        <button className={filter === 'past' ? 'on' : ''} onClick={() => setFilter('past')}>
          {t('trips.history')}
        </button>
      </div>

      <div className="searchbox">
        <IcSearch />
        <input
          type="text"
          placeholder={t('adminBookings.searchPh')}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoComplete="off"
        />
        {q && (
          <button className="search-clear" onClick={() => setQ('')} aria-label={t('common.clear')}>
            <IcX style={{ width: 12, height: 12 }} />
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px 20px', fontWeight: 600 }}>
          {t('common.loading')}
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '50px 20px', fontWeight: 600 }}>
          {term
            ? t('adminBookings.noResults')
            : filter === 'active'
              ? t('adminBookings.emptyActive')
              : filter === 'past'
                ? t('adminBookings.emptyPast')
                : t('adminBookings.emptyAll')}
        </div>
      ) : (
        <div style={{ paddingBottom: 20 }}>
          {items.map((b) => (
            <AdminBookingCard key={b.id} b={b} />
          ))}
        </div>
      )}
    </section>
  );
}
