import { useState, type UIEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCars } from '../context/CarsContext';
import { useUI } from '../context/UIContext';
import { useFavorites } from '../context/FavoritesContext';
import { useI18n } from '../i18n/I18nContext';
import { money } from '../lib/format';
import CarImage from '../components/CarImage';
import { IcChevronLeft, IcHeart, IcStar, IcSeat, IcGear, IcFuel, IcBolt, IcCheck } from '../components/icons';

export default function CarDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { byId, loading } = useCars();
  const { toast } = useUI();
  const { isFavorite, toggle } = useFavorites();
  const { t, lang } = useI18n();
  const [heroIdx, setHeroIdx] = useState(0);

  const car = id ? byId(id) : undefined;

  if (!car) {
    return (
      <section className="screen stack active">
        <div className="stackhead">
          <button className="back" onClick={() => nav(-1)} aria-label={t('common.back')}>
            <IcChevronLeft />
          </button>
          <div className="t">{t('detail.title')}</div>
        </div>
        <div style={{ textAlign: 'center', color: 'var(--muted)', padding: 40, fontWeight: 600 }}>
          {loading ? t('common.loading') : t('detail.notFound')}
        </div>
      </section>
    );
  }

  const fuelShort =
    car.fuel === 'Eléctrico' ? t('detail.fuelEV') : car.fuel === 'Diésel' ? t('detail.fuelDiesel') : t('detail.fuelGas');

  const fav = isFavorite(car.id);
  async function onFav() {
    const now = await toggle(car!.id);
    toast(now ? t('detail.savedToast') : t('detail.removedToast'));
  }

  // Fotos del carrusel: usa `images`; si no, la foto principal; si no, el dibujo.
  const photos = car.images?.length ? car.images : car.image_url ? [car.image_url] : [];
  const onHeroScroll = (e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== heroIdx) setHeroIdx(i);
  };

  return (
    <section className="screen stack active">
      <div className="stackhead">
        <button className="back" onClick={() => nav(-1)} aria-label={t('common.back')}>
          <IcChevronLeft />
        </button>
        <div className="t">{t('detail.title')}</div>
        <button className="icon-btn" onClick={onFav} aria-label={t('detail.favAria')}>
          <IcHeart style={fav ? { color: 'var(--coral)', fill: 'var(--coral)' } : undefined} />
        </button>
      </div>

      <div className="hero">
        {photos.length > 0 ? (
          <div className="hero-track" onScroll={onHeroScroll}>
            {photos.map((url, i) => (
              <div className="hero-slide" key={i}>
                <img src={url} alt={`${car.brand} ${car.model}`} />
              </div>
            ))}
          </div>
        ) : (
          <CarImage car={car} />
        )}
        <div className="rate-pill">
          {car.trips_count} {t('detail.rentals')}
        </div>
        {photos.length > 1 && (
          <div className="dots">
            {photos.map((_, i) => (
              <i key={i} className={i === heroIdx ? 'on' : ''} />
            ))}
          </div>
        )}
      </div>

      <div className="d-title">
        <div className="row">
          <h1>
            {car.brand} {car.model}
          </h1>
        </div>
        <div className="row">
          <div className="sub">
            {car.year} · {t('cat.' + car.category)} · {car.location}
            {car.color_name ? ` · ${car.color_name}` : ''}
          </div>
        </div>
      </div>

      <div className="specgrid">
        <div className="sbox">
          <IcSeat />
          <div className="sv">{car.seats}</div>
          <div className="sl">{t('detail.seats')}</div>
        </div>
        <div className="sbox">
          <IcGear />
          <div className="sv">{t('detail.gearAuto')}</div>
          <div className="sl">{t('detail.gearbox')}</div>
        </div>
        <div className="sbox">
          {car.fuel === 'Eléctrico' ? <IcBolt /> : <IcFuel />}
          <div className="sv">{fuelShort}</div>
          <div className="sl">{car.fuel === 'Eléctrico' ? t('detail.energy') : t('detail.fuel')}</div>
        </div>
        <div className="sbox">
          <IcStar style={{ width: 19, height: 19, color: 'var(--gold)' }} />
          <div className="sv">{car.rating}</div>
          <div className="sl">{t('detail.rating')}</div>
        </div>
      </div>

      <div className="block">
        <h3>{t('detail.about')}</h3>
        <p>
          {/* Descripción del idioma del usuario; si falta, la del otro idioma; si no, la genérica. */}
          {(lang === 'en' ? car.description_en || car.description : car.description || car.description_en) ||
            t('detail.aboutText', { brand: car.brand, model: car.model, year: car.year })}
        </p>
      </div>

      <div className="block">
        <h3>{t('detail.includes')}</h3>
        <div className="feats">
          {car.features.map((f) => {
            // Traduce el id de feature; si es un valor viejo sin traducción, muestra el texto tal cual.
            const label = t('feature.' + f);
            return (
              <span className="feat" key={f}>
                <IcCheck style={{ color: 'var(--good)' }} />
                {label === 'feature.' + f ? f : label}
              </span>
            );
          })}
        </div>
      </div>

      <div style={{ height: 6 }} />

      <div className="footer-cta">
        <div className="fc-price">
          <div className="amt">
            <span className="rd">$</span>
            <b>{money(car.price_per_day)}</b>
          </div>
          <div className="per">{t('detail.perDay')}</div>
        </div>
        <button className="btn btn-primary" onClick={() => nav(`/reservar/${car.id}`)}>
          {t('detail.bookNow')}
        </button>
      </div>
    </section>
  );
}
