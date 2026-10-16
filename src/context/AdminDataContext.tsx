import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { Booking, Car } from '../types/db';

type AdminDataValue = {
  cars: Car[];
  bookings: Booking[];
  loading: boolean;
  reload: () => Promise<void>;
};

const AdminDataContext = createContext<AdminDataValue | undefined>(undefined);

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const { isAdmin } = useAuth();
  const [cars, setCars] = useState<Car[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  // `silent` = refresco en segundo plano sin mostrar el spinner (no borra lo ya cargado).
  const load = useCallback(
    async (silent = false) => {
      if (!isAdmin) {
        setCars([]);
        setBookings([]);
        return;
      }
      if (!silent) setLoading(true);
      const [carsRes, bookingsRes] = await Promise.all([
        supabase.from('cars').select('*').order('price_per_day', { ascending: true }),
        // Nota: NO se hace join a profiles aquí. `bookings` no tiene FK directa a
        // `profiles` (solo a auth.users), así que ese embed rompe toda la consulta.
        // El perfil del cliente se trae aparte y se une abajo.
        supabase.from('bookings').select('*, car:cars(*)').order('created_at', { ascending: false }),
      ]);
      if (bookingsRes.error) {
        // eslint-disable-next-line no-console
        console.error('[AdminData] error cargando reservas:', bookingsRes.error.message);
      }
      let bs = (bookingsRes.data as Booking[]) ?? [];

      // Adjunta el perfil (nombre/teléfono/correo) de cada cliente con una consulta aparte.
      const userIds = Array.from(new Set(bs.map((b) => b.user_id)));
      if (userIds.length) {
        const { data: profs } = await supabase
          .from('profiles')
          .select('id, full_name, phone, email')
          .in('id', userIds);
        const byId = new Map(
          (profs ?? []).map((p) => [
            p.id as string,
            { full_name: p.full_name, phone: p.phone, email: p.email },
          ]),
        );
        bs = bs.map((b) => ({ ...b, profile: byId.get(b.user_id) ?? null }));
      }

      setCars((carsRes.data as Car[]) ?? []);
      setBookings(bs);
      setLoading(false);
    },
    [isAdmin],
  );

  useEffect(() => {
    void load();
  }, [load]);

  // Refresco silencioso para llamar al entrar a cada pantalla admin.
  const reload = useCallback(() => load(true), [load]);

  return (
    <AdminDataContext.Provider value={{ cars, bookings, loading, reload }}>
      {children}
    </AdminDataContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAdminData() {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error('useAdminData debe usarse dentro de <AdminDataProvider>');
  return ctx;
}
