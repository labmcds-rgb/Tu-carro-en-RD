import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCars } from '../context/CarsContext';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { useI18n } from '../i18n/I18nContext';
import { supabase } from '../lib/supabase';
import { EXTRAS, AIRPORT_DELIVERY, MIN_RENTAL_DAYS, openWhatsApp } from '../data/constants';
import { loadExtrasPricing, DEFAULT_PRICING, type ExtrasPricing } from '../lib/pricing';
import { loadZelle, DEFAULT_ZELLE, type ZelleInfo } from '../lib/zelle';
import { addDays, daysBetween, fmtDay, fmtDayW, money, parseISODate, toISODate } from '../lib/format';
import { notifyPush } from '../lib/push';
import DatePickerSheet from '../components/sheets/DatePickerSheet';
import { IcChevronLeft, IcShield, IcPin, IcPlane, IcUserPlus, IcCheck, IcDoc, IcWhatsApp } from '../components/icons';
import CarImage from '../components/CarImage';

const EXTRA_ICONS: Record<string, ReactNode> = {
  shield: <IcShield />,
  pin: <IcPin />,
  plane: <IcPlane />,
  userplus: <IcUserPlus />,
};

function initToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function Booking() {
  const { id } = useParams();
  const nav = useNavigate();
  const { byId } = useCars();
  const { user, profile } = useAuth();
  const { openSheet, closeSheet, toast } = useUI();
  const { t } = useI18n();

  const car = id ? byId(id) : undefined;

  const [pickup, setPickup] = useState<Date>(initToday);
  const [ret, setRet] = useState<Date>(() => addDays(initToday(), MIN_RENTAL_DAYS));
  const [pickupTime, setPickupTime] = useState(''); // vacío = el cliente aún no eligió hora
  const [returnTime, setReturnTime] = useState('');
  const [on, setOn] = useState<Record<string, boolean>>({ seguro: true, aero: false });
  const [airport, setAirport] = useState('santiago'); // aeropuerto de entrega elegido
  const [agreed, setAgreed] = useState(false); // aceptó los requisitos
  const [saving, setSaving] = useState(false);
  const [bookedRanges, setBookedRanges] = useState<{ start: number; end: number }[]>([]);
  const [pricing, setPricing] = useState<ExtrasPricing>(DEFAULT_PRICING);
  const [method, setMethod] = useState<'efectivo' | 'zelle'>('efectivo');
  const [zelle, setZelle] = useState<ZelleInfo>(DEFAULT_ZELLE);

  useEffect(() => {
    void loadExtrasPricing().then(setPricing);
    void loadZelle().then(setZelle);
  }, []);

  // Trae las fechas ya ocupadas de este carro (reservas activas) para bloquearlas.
  const loadRanges = useCallback(async () => {
    if (!id) return [] as { start: number; end: number }[];
    const { data } = await supabase.rpc('car_booked_ranges', { p_car_id: id });
    const ranges = ((data as { pickup_date: string; return_date: string }[]) ?? []).map((r) => ({
      start: parseISODate(r.pickup_date).getTime(),
      end: parseISODate(r.return_date).getTime(),
    }));
    setBookedRanges(ranges);
    return ranges;
  }, [id]);

  useEffect(() => {
    void loadRanges();
  }, [loadRanges]);

  if (!car) {
    return (
      <section className="screen stack active">
        <div className="stackhead">
          <button className="back" onClick={() => nav(-1)} aria-label={t('common.back')}>
            <IcChevronLeft />
          </button>
          <div className="t">{t('booking.titleShort')}</div>
        </div>
        <div style={{ textAlign: 'center', color: 'var(--muted)', padding: 40, fontWeight: 600 }}>
          {t('detail.notFound')}
        </div>
      </section>
    );
  }

  const days = daysBetween(pickup, ret);
  const selectedAirport = AIRPORT_DELIVERY.find((a) => a.id === airport) ?? AIRPORT_DELIVERY[0];
  // Precios desde la configuración del admin (app_settings).
  const airportPrice = (id: string) => pricing[('aero_' + id) as keyof ExtrasPricing] ?? 0;
  const selectedAirportPrice = airportPrice(airport);
  // Precio unitario de un extra (el seguro viene de la config; los demás, su precio fijo).
  const extraUnitPrice = (e: (typeof EXTRAS)[number]) => (e.id === 'seguro' ? pricing.seguro : e.price);
  // Costo total de un extra: 'aero' = precio del aeropuerto; 'seguro'/otros = unitario (× días si es por día).
  const extraCost = (e: (typeof EXTRAS)[number]) =>
    e.id === 'aero' ? selectedAirportPrice : e.per ? extraUnitPrice(e) * days : extraUnitPrice(e);
  const activeExtras = EXTRAS.filter((e) => on[e.id]);
  const extrasCost = activeExtras.reduce((s, e) => s + extraCost(e), 0);
  const subtotal = car.price_per_day * days;
  const total = subtotal + extrasCost;
  // Se puede reservar solo con mínimo de días, ambas horas elegidas y requisitos aceptados.
  const canBook = days >= MIN_RENTAL_DAYS && !!pickupTime && !!returnTime && agreed;

  function setStepDays(delta: number) {
    const n = Math.max(MIN_RENTAL_DAYS, days + delta);
    setRet(addDays(pickup, n));
  }

  function openDates() {
    openSheet(
      <DatePickerSheet
        pickupDate={pickup}
        returnDate={ret}
        pickupTime={pickupTime}
        returnTime={returnTime}
        bookedRanges={bookedRanges}
        onConfirm={(p, r, pt, rt) => {
          setPickup(p);
          setRet(r);
          setPickupTime(pt);
          setReturnTime(rt);
          closeSheet();
        }}
      />,
    );
  }

  async function confirm() {
    if (!user) return;
    if (days < MIN_RENTAL_DAYS) {
      toast(t('booking.minDays', { n: MIN_RENTAL_DAYS }));
      return;
    }
    if (!pickupTime || !returnTime) {
      toast(t('booking.pickTimes'));
      return;
    }
    if (!agreed) return;
    setSaving(true);
    // Revalida disponibilidad justo antes de guardar (evita choques entre clientes).
    const fresh = await loadRanges();
    const ps = pickup.getTime();
    const rs = ret.getTime();
    const overlap = fresh.some((r) => ps <= r.end && r.start <= rs);
    if (overlap) {
      setSaving(false);
      toast(t('booking.datesTaken'));
      return;
    }
    // Código de referencia aleatorio de la reserva (6 dígitos, para evitar repetidos).
    const code = 'TCR-' + Math.floor(100000 + Math.random() * 900000);
    const { error } = await supabase.from('bookings').insert({
      code,
      user_id: user.id,
      car_id: car!.id,
      pickup_date: toISODate(pickup),
      return_date: toISODate(ret),
      pickup_time: pickupTime,
      return_time: returnTime,
      days,
      price_per_day: car!.price_per_day,
      extras: activeExtras.map((e) =>
        e.id === 'aero'
          ? { id: e.id, name: `${e.name} — ${selectedAirport.zone}`, price: selectedAirportPrice, per: false }
          : { id: e.id, name: e.name, price: extraUnitPrice(e), per: e.per },
      ),
      subtotal,
      total,
      location: car!.location,
      status: 'active',
      payment_method: method,
      payment_status: 'pendiente',
    });
    setSaving(false);
    if (error) {
      toast(t('booking.saveError') + error.message);
      return;
    }
    const carName = `${car!.brand} ${car!.model}`;
    const rango = `${fmtDay(pickup)} – ${fmtDay(ret)}`;
    // Avisa a los administradores de la nueva reserva…
    void notifyPush({
      role: 'admin',
      title: 'Nueva reserva 🚗',
      body: `${carName} · ${profile?.full_name ?? 'Cliente'} · ${rango}`,
      data: { screen: '/admin/reservas' },
    });
    // …y confirma al cliente.
    void notifyPush({
      userId: user.id,
      title: '¡Reserva confirmada! 🚗',
      body: `${carName} · ${rango}`,
      data: { screen: '/reservas' },
    });
    nav('/reserva-exitosa', {
      state: {
        code,
        carId: car!.id,
        method,
        total,
        zelleHandle: method === 'zelle' ? zelle.handle : '',
      },
    });
  }

  return (
    <section className="screen stack active">
      <div className="stackhead">
        <button className="back" onClick={() => nav(-1)} aria-label={t('common.back')}>
          <IcChevronLeft />
        </button>
        <div className="t">{t('booking.title')}</div>
      </div>

      <div className="minicar">
        <div className="mthumb">
          <CarImage car={car} />
        </div>
        <div style={{ flex: 1 }}>
          <div className="mn">
            {car.brand} {car.model}
          </div>
          <div className="ms">
            {car.year} · {t('cat.' + car.category)} · <span style={{ color: 'var(--gold)' }}>★ {car.rating}</span>
          </div>
        </div>
      </div>

      <div className="b-sec">
        <h3>{t('booking.dates')}</h3>
      </div>
      <div className="daterow">
        <div className="datebox" style={{ cursor: 'pointer' }} onClick={openDates}>
          <div className="dl">{t('home.pickup')}</div>
          <div className="dv">{fmtDayW(pickup)}</div>
          <div className="dd" style={pickupTime ? undefined : { color: 'var(--coral)' }}>
            {pickupTime ? `${pickupTime} · ${t('booking.edit')}` : t('booking.pickTime')}
          </div>
        </div>
        <div className="datebox" style={{ cursor: 'pointer' }} onClick={openDates}>
          <div className="dl">{t('booking.return')}</div>
          <div className="dv">{fmtDayW(ret)}</div>
          <div className="dd" style={returnTime ? undefined : { color: 'var(--coral)' }}>
            {returnTime ? `${returnTime} · ${t('booking.edit')}` : t('booking.pickTime')}
          </div>
        </div>
      </div>

      <div className="b-sec">
        <h3>{t('booking.duration')}</h3>
      </div>
      <div className="stepper">
        <div className="sl">
          {t('booking.rentalDays')}{' '}
          <small>
            ${money(car.price_per_day)} {t('booking.perDayUnit')}
          </small>
        </div>
        <div className="ctrl">
          <button onClick={() => setStepDays(-1)} aria-label={t('booking.lessDays')}>
            –
          </button>
          <span className="num">{days}</span>
          <button onClick={() => setStepDays(1)} aria-label={t('booking.moreDays')}>
            +
          </button>
        </div>
      </div>

      <div className="b-sec">
        <h3>{t('booking.extras')}</h3>
      </div>
      {EXTRAS.map((e) => (
        <div key={e.id}>
          <div
            className={'extra' + (on[e.id] ? ' on' : '')}
            onClick={() => setOn((s) => ({ ...s, [e.id]: !s[e.id] }))}
          >
            <div className="ei">{EXTRA_ICONS[e.icon]}</div>
            <div className="en">
              {t('extra.' + e.id + '.name')}
              <small>{t('extra.' + e.id + '.desc')}</small>
            </div>
            <div className="ep">
              {e.id === 'aero'
                ? selectedAirportPrice > 0
                  ? `+$${money(selectedAirportPrice)}`
                  : t('common.free')
                : `+$${money(extraUnitPrice(e))}${e.per ? t('booking.perDaySuffix') : ''}`}
            </div>
            <div className="check">
              <IcCheck style={{ opacity: on[e.id] ? 1 : 0, color: '#fff' }} />
            </div>
          </div>

          {e.id === 'aero' && on.aero && (
            <div style={{ margin: '-2px 20px 10px' }}>
              <div className="time-lab">{t('booking.airportPick')}</div>
              <div className="tchips">
                {AIRPORT_DELIVERY.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    className={'chip tchip' + (airport === a.id ? ' active' : '')}
                    onClick={() => setAirport(a.id)}
                  >
                    {a.zone} · {airportPrice(a.id) > 0 ? `$${money(airportPrice(a.id))}` : t('common.free')}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      <div className="b-sec">
        <h3>{t('booking.requirements')}</h3>
      </div>
      <div className="reqs">
        <div className="reqs-head">
          <div className="reqs-ic">
            <IcDoc />
          </div>
          <div className="ht">
            <div className="reqs-title">{t('req.title')}</div>
            <div className="reqs-sub">{t('req.subtitle')}</div>
          </div>
          <span className="reqs-badge">{t('req.badge')}</span>
        </div>

        <div className="reqs-intro">{t('req.intro')}</div>
        <div className="reqs-list">
          <div className="reqs-item">
            <b>1.</b> {t('req.item1')}
          </div>
          <div className="reqs-item">
            <b>2.</b> {t('req.item2')}
          </div>
          <div className="reqs-item">
            <b>3.</b> {t('req.item3')}
          </div>
        </div>

        <div className="reqs-note">
          <div className="nt">{t('req.importantLabel')}</div>
          <p>{t('req.importantText')}</p>
        </div>

        <button className="btn btn-wa" onClick={openWhatsApp}>
          <IcWhatsApp style={{ width: 19, height: 19 }} />
          {t('req.whatsapp')}
        </button>

        <div
          className={'reqs-check' + (agreed ? ' on' : '')}
          onClick={() => setAgreed((v) => !v)}
          role="checkbox"
          aria-checked={agreed}
        >
          <div className="reqs-box">
            <IcCheck />
          </div>
          <div className="lbl">{t('req.agree')}</div>
        </div>
      </div>

      <div className="b-sec">
        <h3>{t('booking.summary')}</h3>
      </div>
      <div className="summary">
        <div className="sline">
          ${money(car.price_per_day)} × {days} {days === 1 ? t('common.day') : t('common.days')}{' '}
          <b>${money(subtotal)}</b>
        </div>
        {activeExtras.map((e) => (
          <div className="sline" key={e.id}>
            {e.id === 'aero' ? `${t('extra.aero.name')} · ${selectedAirport.zone}` : t('extra.' + e.id + '.name')}{' '}
            <b>{e.id === 'aero' && selectedAirportPrice === 0 ? t('common.free') : `$${money(extraCost(e))}`}</b>
          </div>
        ))}
        <div className="sline total">
          {t('booking.totalToPay')} <b>${money(total)}</b>
        </div>
      </div>

      <div className="b-sec">
        <h3>{t('booking.payment')}</h3>
      </div>
      <div className="seg" role="group" aria-label={t('booking.payment')}>
        <button className={method === 'efectivo' ? 'on' : ''} onClick={() => setMethod('efectivo')}>
          💵 {t('pay.cash')}
        </button>
        <button className={method === 'zelle' ? 'on' : ''} onClick={() => setMethod('zelle')}>
          🏦 {t('pay.zelle')}
        </button>
      </div>
      {method === 'zelle' &&
        (zelle.handle ? (
          <div className="paybox">
            <div className="pay-how">{t('pay.zelleHow', { amount: `$${money(total)}` })}</div>
            <div className="pay-row">
              <span className="pl">{t('pay.zelleHandle')}</span>
              <span className="pv">{zelle.handle}</span>
            </div>
            {zelle.name && (
              <div className="pay-row">
                <span className="pl">{t('pay.zelleName')}</span>
                <span className="pv">{zelle.name}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="pay-warn">⚠️ {t('pay.zelleNotConfigured')}</div>
        ))}
      <div style={{ height: 12 }} />

      <div className="footer-cta">
        <div className="fc-price">
          <div className="amt">
            <span className="rd">$</span>
            <b>{money(total)}</b>
          </div>
          <div className="per">
            {t('booking.totalWord')} · {days} {days === 1 ? t('common.day') : t('common.days')}
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={confirm}
          disabled={saving || !canBook}
          style={!saving && !canBook ? { opacity: 0.45 } : undefined}
        >
          {saving ? t('booking.saving') : t('booking.confirm')}
        </button>
      </div>
    </section>
  );
}
