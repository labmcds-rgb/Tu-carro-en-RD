import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { useI18n } from '../i18n/I18nContext';
import { WHATSAPP, openWhatsApp } from '../data/constants';
import { fmtDay, money, parseISODate } from '../lib/format';
import { effectiveStatus } from '../lib/derive';
import type { Booking, BookingStatus } from '../types/db';
import CarImage from '../components/CarImage';
import BookingMeta from '../components/BookingMeta';
import CancelSheet from '../components/sheets/CancelSheet';
import RatingSheet from '../components/sheets/RatingSheet';
import { IcCalendar, IcPin, IcStar } from '../components/icons';

const STAT: Record<BookingStatus, { cls: string; key: string }> = {
  active: { cls: 'active', key: 'status.active' },
  past: { cls: 'done', key: 'status.past' },
  cancelled: { cls: 'cancel', key: 'status.cancelled' },
};

export default function Trips() {
  const nav = useNavigate();
  const { user } = useAuth();
  const { openSheet, closeSheet, toast } = useUI();
  const { t } = useI18n();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Map<string, number>>(new Map()); // booking_id → estrellas
  const [seg, setSeg] = useState<'active' | 'past'>('active');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [bRes, rRes] = await Promise.all([
      supabase
        .from('bookings')
        .select('*, car:cars(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase.from('reviews').select('booking_id, rating').eq('user_id', user.id),
    ]);
    setBookings((bRes.data as Booking[]) ?? []);
    setReviews(
      new Map(((rRes.data as { booking_id: string; rating: number }[]) ?? []).map((r) => [r.booking_id, r.rating])),
    );
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  async function doCancel(b: Booking) {
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', b.id);
    closeSheet();
    toast(t('trips.cancelledToast', { code: b.code }));
    void load();
  }

  function askCancel(b: Booking) {
    openSheet(<CancelSheet booking={b} onConfirm={() => doCancel(b)} onBack={closeSheet} />);
  }

  function openRating(b: Booking) {
    const carName = b.car ? `${b.car.brand} ${b.car.model}` : t('common.car');
    openSheet(
      <RatingSheet
        carName={carName}
        onSubmit={async (rating, comment) => {
          if (!user) return;
          const { error } = await supabase.from('reviews').insert({
            booking_id: b.id,
            car_id: b.car_id,
            user_id: user.id,
            rating,
            comment: comment || null,
          });
          closeSheet();
          if (error) {
            toast(t('rate.error') + error.message);
            return;
          }
          toast(t('rate.thanks'));
          void load();
        }}
      />,
    );
  }

  const items = bookings.filter((b) =>
    seg === 'active' ? effectiveStatus(b) === 'active' : effectiveStatus(b) !== 'active',
  );

  return (
    <section className="screen active">
      <div className="topbar">
        <h2>{t('trips.title')}</h2>
      </div>
      <div className="seg">
        <button className={seg === 'active' ? 'on' : ''} onClick={() => setSeg('active')}>
          {t('trips.active')}
        </button>
        <button className={seg === 'past' ? 'on' : ''} onClick={() => setSeg('past')}>
          {t('trips.history')}
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '50px 20px', fontWeight: 600 }}>
          {t('trips.loading')}
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '50px 20px', fontWeight: 600 }}>
          {seg === 'active' ? t('trips.emptyActive') : t('trips.emptyHistory')}
        </div>
      ) : (
        items.map((b) => {
          const es = effectiveStatus(b);
          const st = STAT[es];
          const car = b.car;
          return (
            <div className="tcard" key={b.id}>
              <div className="thead">
                <div className="tthumb" style={b.status === 'cancelled' ? { opacity: 0.55 } : undefined}>
                  {car && <CarImage car={car} />}
                </div>
                <div style={{ flex: 1 }}>
                  <span className={'tstat ' + st.cls}>
                    <span className="d" />
                    {t(st.key)}
                  </span>
                  <div className="tn">{car ? `${car.brand} ${car.model}` : t('common.car')}</div>
                  <div className="td">
                    <IcCalendar />
                    {fmtDay(parseISODate(b.pickup_date))} – {fmtDay(parseISODate(b.return_date))} · {b.days}{' '}
                    {b.days === 1 ? t('common.day') : t('common.days')}
                  </div>
                  <div className="td">
                    <IcPin />
                    {b.location ?? '—'}
                  </div>
                </div>
              </div>
              <BookingMeta b={b} showPayStatus />
              <div className="tfoot">
                <div className="tp">
                  <span style={{ color: 'var(--muted)', fontWeight: 600, fontSize: 12 }}>{b.code}</span> ·{' '}
                  <b style={b.status === 'cancelled' ? { textDecoration: 'line-through', color: 'var(--muted)' } : undefined}>
                    ${money(b.total)}
                  </b>
                </div>
                {es === 'active' ? (
                  <div className="tacts">
                    <a className="tcancel" onClick={() => askCancel(b)}>
                      {t('common.cancel')}
                    </a>
                    <a
                      onClick={() => {
                        openWhatsApp();
                        toast(t('common.openingWhatsApp') + WHATSAPP);
                      }}
                    >
                      {t('trips.contact')}
                    </a>
                  </div>
                ) : (
                  <div className="tacts">
                    {es === 'past' &&
                      (reviews.has(b.id) ? (
                        <span className="trate">
                          <IcStar /> {reviews.get(b.id)} · {t('trips.yourRating')}
                        </span>
                      ) : (
                        <a className="trate" style={{ cursor: 'pointer' }} onClick={() => openRating(b)}>
                          {t('trips.rateCta')}
                        </a>
                      ))}
                    <a onClick={() => car && nav(`/carro/${car.id}`)}>{t('trips.rentAgain')}</a>
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </section>
  );
}
