import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Car } from '../types/db';

type CarsContextValue = {
  cars: Car[];
  loading: boolean;
  error: string | null;
  byId: (id: string) => Car | undefined;
  reload: () => void;
};

const CarsContext = createContext<CarsContextValue | undefined>(undefined);

export function CarsProvider({ children }: { children: ReactNode }) {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Los carros siempre se muestran. La disponibilidad se maneja POR FECHAS
  // en la pantalla de reserva (las fechas tomadas se bloquean en el calendario),
  // no ocultando el carro.
  async function load() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('is_active', true)
      .order('price_per_day', { ascending: true });
    if (error) setError(error.message);
    setCars((data as Car[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <CarsContext.Provider
      value={{ cars, loading, error, byId: (id) => cars.find((c) => c.id === id), reload: load }}
    >
      {children}
    </CarsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCars() {
  const ctx = useContext(CarsContext);
  if (!ctx) throw new Error('useCars debe usarse dentro de <CarsProvider>');
  return ctx;
}
