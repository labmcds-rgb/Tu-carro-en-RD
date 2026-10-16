import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import { IcHome, IcSearch, IcCarFront, IcUser, IcCalendar } from './icons';

type Tab = { to: string; labelKey: string; Icon: typeof IcHome; end: boolean };

const CUSTOMER_TABS: Tab[] = [
  { to: '/', labelKey: 'nav.home', Icon: IcHome, end: true },
  { to: '/buscar', labelKey: 'nav.search', Icon: IcSearch, end: false },
  { to: '/reservas', labelKey: 'nav.trips', Icon: IcCarFront, end: false },
  { to: '/perfil', labelKey: 'nav.profile', Icon: IcUser, end: false },
];

const ADMIN_TABS: Tab[] = [
  { to: '/admin', labelKey: 'nav.adminSummary', Icon: IcHome, end: true },
  { to: '/admin/flota', labelKey: 'nav.adminFleet', Icon: IcCarFront, end: false },
  { to: '/admin/reservas', labelKey: 'nav.adminBookings', Icon: IcCalendar, end: false },
  { to: '/perfil', labelKey: 'nav.profile', Icon: IcUser, end: false },
];

export default function TabBar() {
  const { isAdmin } = useAuth();
  const { t } = useI18n();
  const tabs = isAdmin ? ADMIN_TABS : CUSTOMER_TABS;
  return (
    <nav className="tabbar">
      {tabs.map(({ to, labelKey, Icon, end }) => (
        <NavLink key={to} to={to} end={end} className={({ isActive }) => 'tab' + (isActive ? ' on' : '')}>
          <Icon />
          <span className="tl">{t(labelKey)}</span>
        </NavLink>
      ))}
    </nav>
  );
}
