import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAdminData } from '../../context/AdminDataContext';
import { useI18n } from '../../i18n/I18nContext';
import { useCarForm } from '../../hooks/useCarForm';
import { money, fmtDay, parseISODate } from '../../lib/format';
import { effectiveStatus } from '../../lib/derive';
import Splash from '../../components/Splash';
import CarImage from '../../components/CarImage';
import { IcStar } from '../../components/icons';

export default function AdminFleet() {
  const { isAdmin, profileLoaded, session } = useAuth();
  const { cars, bookings, loading, reload } = useAdminData();
  const { t } = useI18n();
  const openCarForm = useCarForm();

  // Refresca al abrir la Flota, para ver reservas recién hechas.
  useEffect(() => {
    void reload();
  }, [reload]);

  if (session && !profileLoaded) return <Splash />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <section className="screen active">
      <div className="topbar">
        <h2>{t('nav.adminFleet')}</h2>
      </div>

      <div style={{ padding: '4px 20px 4px' }}>
        <button className="btn btn-primary" onClick={() => openCarForm()}>
          {t('adminFleet.addCar')}
        </button>
      </div>

      <div className="countline" style={{ padding: '10px 20px 2px' }}>
        <b>{cars.length}</b> {t('adminFleet.inFleet')}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px 20px', fontWeight: 600 }}>
          {t('common.loading')}
        </div>
      ) : (
        <div className="list">
          {cars.map((c) => {
            // Reservas vigentes de este carro (activas y cuya devolución no ha pasado).
            const active = bookings.filter((b) => b.car_id === c.id && effectiveStatus(b) === 'active');
            const first = active[0];
            return (
              <div className="lcard" key={c.id} onClick={() => openCarForm(c)}>
                <div className="lthumb" style={c.is_active ? undefined : { opacity: 0.5 }}>
                  <CarImage car={c} />
                  <div className="lcat">{t('cat.' + c.category)}</div>
                </div>
                <div className="linfo">
                  <div className="fname">
                    {c.brand} {c.model}
                  </div>
                  <div className="lrate">
                    <IcStar /> {c.rating} <span style={{ color: 'var(--muted-2)' }}>· {c.year}</span>
                    {active.length > 0 && (
                      <span
                        className="tag-off"
                        style={{ background: 'rgba(52,211,153,.14)', color: 'var(--good)' }}
                      >
                        {t('adminFleet.reserved')}
                        {active.length > 1 ? ` ×${active.length}` : ''}
                      </span>
                    )}
                    {!c.is_active && <span className="tag-off">{t('adminFleet.hidden')}</span>}
                  </div>
                  {first && (
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--good)',
                        margin: '2px 0 2px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      🔑 {first.profile?.full_name ?? t('common.client')} ·{' '}
                      {fmtDay(parseISODate(first.pickup_date))} – {fmtDay(parseISODate(first.return_date))}
                    </div>
                  )}
                  <div className="lbot">
                    <div className="spec">
                      {c.zone}
                      {c.plate ? ` · ${c.plate}` : ''}
                    </div>
                    <span className="price">
                      <span className="rd">$</span>
                      <span className="amt">{money(c.price_per_day)}</span>
                      <span className="per">{t('booking.perDaySuffix')}</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
