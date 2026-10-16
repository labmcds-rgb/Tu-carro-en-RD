import { useState } from 'react';
import type { Car } from '../../types/db';
import { PRICE_MIN, PRICE_MAX, PRICE_STEP } from '../../data/constants';
import { matchesFilters } from '../../lib/filters';
import { money } from '../../lib/format';
import { useI18n } from '../../i18n/I18nContext';

type Props = {
  cars: Car[];
  activeCat: string;
  search: string;
  zone: string;
  max: number;
  onApply: (zone: string, max: number) => void;
};

export default function FilterSheet({ cars, activeCat, search, zone, max, onApply }: Props) {
  const { t } = useI18n();
  const [m, setM] = useState(max);

  const count = cars.filter((c) => matchesFilters(c, { activeCat, search, zone, max: m })).length;
  const pct = ((m - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;

  return (
    <>
      <div className="grabber" />
      <div className="sh-title">{t('catalog.filtersAria')}</div>
      <div className="sh-sub">{t('filter.sub')}</div>

      <div className="time-lab" style={{ marginTop: 6 }}>
        {t('filter.maxPrice')}
      </div>
      <div className="price-val">
        {t('filter.upTo')} <b>${money(m)}</b> <span>{t('filter.perDay')}</span>
      </div>
      <input
        type="range"
        min={PRICE_MIN}
        max={PRICE_MAX}
        step={PRICE_STEP}
        value={m}
        onChange={(e) => setM(+e.target.value)}
        style={{ background: `linear-gradient(90deg, var(--primary) ${pct}%, var(--surface-3) ${pct}%)` }}
      />
      <div className="range-ends">
        <span>${money(PRICE_MIN)}</span>
        <span>${money(PRICE_MAX)}+</span>
      </div>

      <div className="sheet-actions" style={{ marginTop: 24 }}>
        <button className="btn btn-primary" onClick={() => onApply(zone, m)}>
          {t('filter.showCars', { count })}
        </button>
        <button className="btn btn-ghost" onClick={() => setM(PRICE_MAX)}>
          {t('filter.clearFilters')}
        </button>
      </div>
    </>
  );
}
