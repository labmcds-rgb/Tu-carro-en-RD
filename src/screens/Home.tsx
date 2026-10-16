import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCars } from '../context/CarsContext';
import { useI18n } from '../i18n/I18nContext';
import { CATS, PICKUP_CITY } from '../data/constants';
import ChipRow from '../components/ChipRow';
import { FeaturedCard, ListCard } from '../components/CarCard';
import Splash from '../components/Splash';
import { IcPin, IcCalendar, IcSearch } from '../components/icons';

export default function Home() {
  const nav = useNavigate();
  const { t } = useI18n();
  const { profile, isAdmin, profileLoaded, session } = useAuth();
  const { cars, loading } = useCars();

  if (session && !profileLoaded) return <Splash />;
  if (isAdmin) return <Navigate to="/admin" replace />;

  const firstName = (profile?.full_name ?? 'Bienvenido').split(' ')[0];
  const initials = profile?.avatar_initials ?? firstName.slice(0, 2).toUpperCase();
  const featured = cars.slice(0, 5);
  const popular = cars.slice(5, 8);

  const goCat = (cat: string) => nav(`/buscar?cat=${encodeURIComponent(cat)}`);
  const search = () => nav('/buscar');

  return (
    <section className="screen active">
      <div className="home-top">
        <div className="greet">
          <div className="hi">{t('home.hi')}</div>
          <div className="nm">{t('home.q')}</div>
        </div>
        <div className="avatar">
          {initials}
          <span className="ring" />
        </div>
      </div>

      <div className="searchcard">
        <div className="sc-row">
          <div className="sc-ic">
            <IcPin />
          </div>
          <div style={{ flex: 1 }}>
            <div className="sc-lab">{t('home.pickup')}</div>
            <div className="sc-val">{PICKUP_CITY}</div>
          </div>
        </div>
        <div className="sc-two">
          <div className="sc-row">
            <div className="sc-ic">
              <IcCalendar />
            </div>
            <div>
              <div className="sc-lab">{t('home.from')}</div>
              <div className="sc-val">{t('home.today')}</div>
            </div>
          </div>
          <div className="sc-row">
            <div className="sc-ic">
              <IcCalendar />
            </div>
            <div>
              <div className="sc-lab">{t('home.to')}</div>
              <div className="sc-val">{t('home.in3days')}</div>
            </div>
          </div>
        </div>
        <button className="btn btn-primary btn-search" onClick={search}>
          <IcSearch style={{ width: 18, height: 18 }} />
          {t('home.searchBtn')}
        </button>
      </div>

      <div className="sec-head" style={{ paddingBottom: 8 }}>
        <h2>{t('home.categories')}</h2>
      </div>
      <ChipRow>
        {CATS.map((c) => (
          <button key={c.id} className="chip" onClick={() => (c.id === 'todos' ? nav('/buscar') : goCat(c.id))}>
            <span className="ci">{c.ic}</span>
            {t('cat.' + c.id)}
          </button>
        ))}
      </ChipRow>

      <div className="sec-head">
        <h2>{t('home.featured')}</h2>
        <a onClick={() => nav('/buscar')}>{t('common.seeAll')}</a>
      </div>
      {loading ? (
        <div className="rail">
          <div className="skel-card" />
          <div className="skel-card" />
        </div>
      ) : (
        <div className="rail">
          {featured.map((car) => (
            <FeaturedCard key={car.id} car={car} />
          ))}
        </div>
      )}

      <div className="sec-head">
        <h2>{t('home.popular')}</h2>
      </div>
      <div className="list" style={{ paddingTop: 2 }}>
        {popular.map((car) => (
          <ListCard key={car.id} car={car} />
        ))}
      </div>
    </section>
  );
}
