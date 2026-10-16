import { useState } from 'react';
import { monthsFor, DAY_MS, fmtDay } from '../../lib/format';
import { TIMES, MIN_RENTAL_DAYS } from '../../data/constants';
import { useI18n } from '../../i18n/I18nContext';

type Props = {
  pickupDate: Date;
  returnDate: Date;
  pickupTime: string;
  returnTime: string;
  /** Rangos ya tomados del carro (timestamps a medianoche, inclusivos). */
  bookedRanges?: { start: number; end: number }[];
  onConfirm: (pickup: Date, ret: Date, pickupTime: string, returnTime: string) => void;
};

const today = new Date();
today.setHours(0, 0, 0, 0);
const MIN = { y: today.getFullYear(), m: today.getMonth() };
const TODAY_MS = today.getTime();

export default function DatePickerSheet({
  pickupDate,
  returnDate,
  pickupTime,
  returnTime,
  bookedRanges = [],
  onConfirm,
}: Props) {
  const { t, lang } = useI18n();
  const months = monthsFor(lang);
  const [start, setStart] = useState<Date | null>(pickupDate);
  const [end, setEnd] = useState<Date | null>(returnDate);
  const [viewY, setViewY] = useState(pickupDate.getFullYear());
  const [viewM, setViewM] = useState(pickupDate.getMonth());
  const [pTime, setPTime] = useState(pickupTime);
  const [rTime, setRTime] = useState(returnTime);

  const occupied = (ms: number) => bookedRanges.some((r) => ms >= r.start && ms <= r.end);
  const isBlocked = (ms: number) => ms < TODAY_MS || occupied(ms);
  const spanHasOccupied = (a: Date, b: Date) => {
    for (let ms = a.getTime(); ms <= b.getTime(); ms += DAY_MS) if (occupied(ms)) return true;
    return false;
  };

  const dim = new Date(viewY, viewM + 1, 0).getDate();
  const firstOffset = (new Date(viewY, viewM, 1).getDay() + 6) % 7;
  const ts = start ? start.getTime() : null;
  const te = end ? end.getTime() : null;
  const atMin = viewY === MIN.y && viewM === MIN.m;
  const ready = !!(start && end && end.getTime() > start.getTime());
  const nights = ready ? Math.round((end!.getTime() - start!.getTime()) / DAY_MS) : 0;
  const tooShort = ready && nights < MIN_RENTAL_DAYS;
  const needsTimes = !pTime || !rTime;
  const valid = ready && !spanHasOccupied(start!, end!) && nights >= MIN_RENTAL_DAYS && !needsTimes;

  function navMonth(delta: number) {
    let m = viewM + delta;
    let y = viewY;
    if (m < 0) {
      m = 11;
      y--;
    } else if (m > 11) {
      m = 0;
      y++;
    }
    if (y < MIN.y || (y === MIN.y && m < MIN.m)) return;
    setViewY(y);
    setViewM(m);
  }

  function pickDay(d: number) {
    const dd = new Date(viewY, viewM, d);
    if (isBlocked(dd.getTime())) return; // día pasado u ocupado: no seleccionable
    if (!start || (start && end)) {
      setStart(dd);
      setEnd(null);
    } else if (dd.getTime() > start.getTime()) {
      // No permitir que el rango abarque fechas ya ocupadas.
      if (spanHasOccupied(start, dd)) {
        setStart(dd);
        setEnd(null);
        return;
      }
      setEnd(dd);
    } else {
      setStart(dd);
    }
  }

  const cells: React.ReactNode[] = [];
  for (let i = 0; i < firstOffset; i++) cells.push(<span key={`e${i}`} />);
  for (let d = 1; d <= dim; d++) {
    const g = new Date(viewY, viewM, d).getTime();
    if (isBlocked(g)) {
      cells.push(
        <button key={d} className="occ" disabled>
          {d}
        </button>,
      );
      continue;
    }
    let cls = '';
    if (ts && te) {
      if (g === ts) cls = 'edge start';
      else if (g === te) cls = 'edge end';
      else if (g > ts && g < te) cls = 'inrange';
    } else if (ts && g === ts) cls = 'edge single';
    cells.push(
      <button key={d} className={cls} onClick={() => pickDay(d)}>
        {d}
      </button>,
    );
  }

  const timeRow = (sel: string, set: (t: string) => void) => (
    <div className="tchips">
      {TIMES.map((t) => (
        <button key={t} className={'chip tchip' + (t === sel ? ' active' : '')} onClick={() => set(t)}>
          {t}
        </button>
      ))}
    </div>
  );

  return (
    <>
      <div className="grabber" />
      <div className="sh-title">{t('datepicker.title')}</div>
      <div className="sh-sub">{t('datepicker.sub')}</div>

      <div className="cal-head">
        <button className="cal-nav" disabled={atMin} onClick={() => navMonth(-1)} aria-label={t('datepicker.prevMonth')}>
          ‹
        </button>
        <div className="cal-month">
          {months[viewM]} {viewY}
        </div>
        <button className="cal-nav" onClick={() => navMonth(1)} aria-label={t('datepicker.nextMonth')}>
          ›
        </button>
      </div>

      <div className="cal-wd">
        <span>{t('cal.mon')}</span>
        <span>{t('cal.tue')}</span>
        <span>{t('cal.wed')}</span>
        <span>{t('cal.thu')}</span>
        <span>{t('cal.fri')}</span>
        <span>{t('cal.sat')}</span>
        <span>{t('cal.sun')}</span>
      </div>
      <div className="cal">{cells}</div>

      <div className="time-sec">
        <div className="time-lab">{t('datepicker.pickupTime')}</div>
        {timeRow(pTime, setPTime)}
      </div>
      <div className="time-sec">
        <div className="time-lab">{t('datepicker.returnTime')}</div>
        {timeRow(rTime, setRTime)}
      </div>

      <div className="cal-foot">
        <div className="nights">
          {ready ? `${nights} ${nights === 1 ? t('common.day') : t('common.days')}` : t('datepicker.select')}
          <small style={tooShort || (ready && needsTimes) ? { color: 'var(--coral)' } : undefined}>
            {tooShort
              ? t('booking.minDays', { n: MIN_RENTAL_DAYS })
              : ready && needsTimes
                ? t('booking.pickTimes')
                : ready
                  ? `${fmtDay(start!)} → ${fmtDay(end!)}`
                  : t('datepicker.tapTwo')}
          </small>
        </div>
        <button
          className="btn btn-primary"
          style={{ width: 'auto', padding: '14px 26px', ...(valid ? {} : { opacity: 0.38, pointerEvents: 'none' }) }}
          onClick={() => valid && onConfirm(start!, end!, pTime, rTime)}
        >
          {t('booking.confirm')}
        </button>
      </div>
    </>
  );
}
