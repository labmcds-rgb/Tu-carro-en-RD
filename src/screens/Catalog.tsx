import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCars } from '../context/CarsContext';
import { useUI } from '../context/UIContext';
import { useI18n } from '../i18n/I18nContext';
import { CATS, PRICE_MAX, type SortKey } from '../data/constants';
import { matchesFilters, sortCars } from '../lib/filters';
import ChipRow from '../components/ChipRow';
import { ListCard } from '../components/CarCard';
import { IcFilter, IcSearch, IcSort, IcX } from '../components/icons';
import FilterSheet from '../components/sheets/FilterSheet';
import SortSheet from '../components/sheets/SortSheet';

export default function Catalog() {
  const { cars, loading } = useCars();
  const { openSheet, closeSheet, toast } = useUI();
  const { t } = useI18n();
  const [params] = useSearchParams();

  const [activeCat, setActiveCat] = useState('todos');
  const [search, setSearch] = useState('');
  const [zone, setZone] = useState('Todas');
  const [max, setMax] = useState(PRICE_MAX);
  const [sortBy, setSortBy] = useState<SortKey>('recomendados');

  useEffect(() => {
    const cat = params.get('cat');
    if (cat) setActiveCat(cat);
  }, [params]);

  const filtered = useMemo(
    () => sortCars(cars.filter((c) => matchesFilters(c, { activeCat, search, zone, max })), sortBy),
    [cars, activeCat, search, zone, max, sortBy],
  );

  const filtersActive = max < PRICE_MAX || zone !== 'Todas';

  const openFilters = () =>
    openSheet(
      <FilterSheet
        cars={cars}
        activeCat={activeCat}
        search={search}
        zone={zone}
        max={max}
        onApply={(z, m) => {
          setZone(z);
          setMax(m);
          closeSheet();
          toast(
            t('catalog.filterToast', {
              n: cars.filter((c) => matchesFilters(c, { activeCat, search, zone: z, max: m })).length,
            }),
          );
        }}
      />,
    );

  const openSort = () =>
    openSheet(
      <SortSheet
        current={sortBy}
        onSelect={(k) => {
          setSortBy(k);
          closeSheet();
        }}
      />,
    );

  return (
    <section className="screen active">
      <div className="topbar">
        <h2>{t('catalog.title')}</h2>
        <button
          className={'icon-btn' + (filtersActive ? ' filtered' : '')}
          onClick={openFilters}
          aria-label={t('catalog.filtersAria')}
        >
          <IcFilter />
        </button>
      </div>

      <div className="searchbox">
        <IcSearch />
        <input
          type="text"
          placeholder={t('catalog.searchPh')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoComplete="off"
        />
        {search && (
          <button className="search-clear" onClick={() => setSearch('')} aria-label={t('common.clear')}>
            <IcX style={{ width: 12, height: 12 }} />
          </button>
        )}
      </div>

      <ChipRow>
        {CATS.map((c) => (
          <button
            key={c.id}
            className={'chip' + (c.id === activeCat ? ' active' : '')}
            onClick={() => setActiveCat(c.id)}
          >
            <span className="ci">{c.ic}</span>
            {t('cat.' + c.id)}
          </button>
        ))}
      </ChipRow>

      <div className="listbar">
        <div className="countline">
          <b>{filtered.length}</b> {filtered.length === 1 ? t('catalog.carOne') : t('catalog.carMany')}
        </div>
        <button className="sortbtn" onClick={openSort} aria-label={t('catalog.sortAria')}>
          <IcSort />
          <span>{t('sortShort.' + sortBy)}</span>
        </button>
      </div>

      {loading ? (
        <div className="list">
          <div className="skel-row" />
          <div className="skel-row" />
          <div className="skel-row" />
        </div>
      ) : filtered.length ? (
        <div className="list">
          {filtered.map((car) => (
            <ListCard key={car.id} car={car} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px 20px', fontWeight: 600 }}>
          {t('catalog.emptyA')}
          <br />
          {t('catalog.emptyB')}
        </div>
      )}
    </section>
  );
}
