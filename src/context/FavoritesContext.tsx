import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

type FavoritesValue = {
  ids: Set<string>;
  isFavorite: (carId: string) => boolean;
  /** Alterna el favorito; devuelve el nuevo estado (true = ahora es favorito). */
  toggle: (carId: string) => Promise<boolean>;
};

const FavoritesContext = createContext<FavoritesValue | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [ids, setIds] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    if (!user) {
      setIds(new Set());
      return;
    }
    const { data } = await supabase.from('favorites').select('car_id').eq('user_id', user.id);
    setIds(new Set((data ?? []).map((r: { car_id: string }) => r.car_id)));
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const toggle = useCallback(
    async (carId: string) => {
      if (!user) return false;
      const has = ids.has(carId);
      // Actualización optimista (la UI responde al instante).
      setIds((cur) => {
        const n = new Set(cur);
        if (has) n.delete(carId);
        else n.add(carId);
        return n;
      });
      if (has) {
        await supabase.from('favorites').delete().eq('user_id', user.id).eq('car_id', carId);
        return false;
      }
      await supabase.from('favorites').insert({ user_id: user.id, car_id: carId });
      return true;
    },
    [user, ids],
  );

  return (
    <FavoritesContext.Provider value={{ ids, isFavorite: (id) => ids.has(id), toggle }}>
      {children}
    </FavoritesContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites debe usarse dentro de <FavoritesProvider>');
  return ctx;
}
