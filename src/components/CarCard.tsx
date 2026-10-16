import { useNavigate } from 'react-router-dom';
import type { Car } from '../types/db';
import { money } from '../lib/format';
import CarImage from './CarImage';
import { IcStar, IcHeart, IcSeat, IcGear } from './icons';
import { useUI } from '../context/UIContext';
import { useFavorites } from '../context/FavoritesContext';
import { useI18n } from '../i18n/I18nContext';

function Price({ value }: { value: number }) {
  const { t } = useI18n();
  return (
    <span className="price">
      <span className="rd">$</span>
      <span className="amt">{money(value)}</span>
      <span className="per">{t('booking.perDaySuffix')}</span>
    </span>
  );
}

export function FeaturedCard({ car }: { car: Car }) {
  const nav = useNavigate();
  const { toast } = useUI();
  const { isFavorite, toggle } = useFavorites();
  const { t } = useI18n();
  const fav = isFavorite(car.id);
  return (
    <div className="fcard" onClick={() => nav(`/carro/${car.id}`)}>
      <div className="carimg">
        <CarImage car={car} />
        <div className="rate-pill">
          <IcStar />
          {car.rating}
        </div>
        <div
          className="fav"
          onClick={async (e) => {
            e.stopPropagation();
            const now = await toggle(car.id);
            toast(now ? t('detail.savedToast') : t('detail.removedToast'));
          }}
        >
          <IcHeart
            style={{ width: 16, height: 16, color: fav ? 'var(--coral)' : '#fff', fill: fav ? 'var(--coral)' : 'none' }}
          />
        </div>
      </div>
      <div className="fbody">
        <div className="fmeta">
          <div>
            <div className="fname">
              {car.brand} {car.model}
            </div>
            <div className="fsub">
              {car.year} · {t('cat.' + car.category)}
            </div>
          </div>
        </div>
        <div className="fspecs">
          <div className="spec">
            <IcSeat />
            {car.seats}
          </div>
          <div className="spec">
            <IcGear />
            {t('detail.gearAuto')}
          </div>
          <div className="spec" style={{ marginLeft: 'auto' }}>
            <Price value={car.price_per_day} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ListCard({ car }: { car: Car }) {
  const nav = useNavigate();
  const { t } = useI18n();
  return (
    <div className="lcard" onClick={() => nav(`/carro/${car.id}`)}>
      <div className="lthumb">
        <CarImage car={car} />
        <div className="lcat">{t('cat.' + car.category)}</div>
      </div>
      <div className="linfo">
        <div className="fname">
          {car.brand} {car.model}
        </div>
        <div className="lrate">
          <IcStar /> {car.rating}{' '}
          <span style={{ color: 'var(--muted-2)' }}>
            · {car.trips_count} {t('detail.rentals')}
          </span>
        </div>
        <div className="lbot">
          <div className="spec">
            <IcSeat />
            {car.seats} · {t('fuel.' + car.fuel)}
          </div>
          <Price value={car.price_per_day} />
        </div>
      </div>
    </div>
  );
}
