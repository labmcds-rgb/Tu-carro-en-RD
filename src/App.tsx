import { Routes, Route, Navigate } from 'react-router-dom';
import PushRegistrar from './components/PushRegistrar';
import AppShell from './components/AppShell';
import RequireAuth from './components/RequireAuth';
import Login from './screens/Login';
import Home from './screens/Home';
import Catalog from './screens/Catalog';
import CarDetail from './screens/CarDetail';
import Booking from './screens/Booking';
import Success from './screens/Success';
import Trips from './screens/Trips';
import Profile from './screens/Profile';
import EditProfile from './screens/EditProfile';
import Favorites from './screens/Favorites';
import Settings from './screens/Settings';
import Legal from './screens/Legal';
import AdminHome from './screens/admin/AdminHome';
import AdminFleet from './screens/admin/AdminFleet';
import AdminBookings from './screens/admin/AdminBookings';
import AdminTeam from './screens/admin/AdminTeam';
import AdminExtras from './screens/admin/AdminExtras';
import AdminPayment from './screens/admin/AdminPayment';

export default function App() {
  return (
    <>
      <PushRegistrar />
      <Routes>
      <Route element={<AppShell />}>
        <Route path="/login" element={<Login />} />
        <Route path="/terminos" element={<Legal doc="terms" />} />
        <Route path="/privacidad" element={<Legal doc="privacy" />} />
        <Route element={<RequireAuth />}>
          <Route path="/" element={<Home />} />
          <Route path="/buscar" element={<Catalog />} />
          <Route path="/carro/:id" element={<CarDetail />} />
          <Route path="/reservar/:id" element={<Booking />} />
          <Route path="/reserva-exitosa" element={<Success />} />
          <Route path="/reservas" element={<Trips />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/perfil/editar" element={<EditProfile />} />
          <Route path="/favoritos" element={<Favorites />} />
          <Route path="/ajustes" element={<Settings />} />
          <Route path="/admin" element={<AdminHome />} />
          <Route path="/admin/flota" element={<AdminFleet />} />
          <Route path="/admin/reservas" element={<AdminBookings />} />
          <Route path="/admin/equipo" element={<AdminTeam />} />
          <Route path="/admin/extras" element={<AdminExtras />} />
          <Route path="/admin/pago" element={<AdminPayment />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
      </Routes>
    </>
  );
}
