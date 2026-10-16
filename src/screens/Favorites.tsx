import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';
import { useCars } from '../context/CarsContext';
import { useI18n } from '../i18n/I18nContext';
import { ListCard } from '../components/CarCard';
import { IcChevronLeft } from '../components/icons';
import type { Car } from '../types/db';

export default function Favorites() {
  const nav = useNavigate();
  const { ids } = useFavorites();
  const { byId } = useCars();
  const { t } = useI18n();

  const favCars = Array.from(ids)
    .map((id) => byId(id))
    .filter(Boolean) as Car[];

  return (
    <section className="screen stack active">
      <div className="stackhead">
        <button className="back" onClick={() => nav('/perfil')} aria-label={t('common.back')}>
          <IcChevronLeft />
        </button>
        <div className="t">{t('favorites.title')}</div>
      </div>

      {favCars.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            color: 'var(--muted)',
            padding: '48px 28px',
            fontWeight: 600,
            lineHeight: 1.5,
          }}
        >
          {t('favorites.empty')}
        </div>
      ) : (
        <div className="list" style={{ paddingTop: 10 }}>
          {favCars.map((c) => (
            <ListCard key={c.id} car={c} />
          ))}
        </div>
      )}
    </section>
  );
}
