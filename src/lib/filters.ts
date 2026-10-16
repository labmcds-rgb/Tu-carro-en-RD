import type { Car } from '../types/db';
import { zoneOf, type SortKey } from '../data/constants';

export type CatalogFilters = {
  activeCat: string;
  search: string;
  zone: string;
  max: number;
};

export function matchesFilters(c: Car, f: CatalogFilters): boolean {
  const q = f.search.trim().toLowerCase();
  const hay = `${c.brand} ${c.model} ${c.category}`.toLowerCase();
  return (
    (f.activeCat === 'todos' || c.category === f.activeCat) &&
    c.price_per_day <= f.max &&
    (f.zone === 'Todas' || zoneOf(c.location) === f.zone) &&
    (q === '' || hay.includes(q))
  );
}

export function sortCars(items: Car[], sortBy: SortKey): Car[] {
  const a = [...items];
  if (sortBy === 'precio_asc') a.sort((x, y) => x.price_per_day - y.price_per_day);
  else if (sortBy === 'precio_desc') a.sort((x, y) => y.price_per_day - x.price_per_day);
  else if (sortBy === 'rating') a.sort((x, y) => y.rating - x.rating);
  return a;
}
