-- =====================================================================
-- TU CARRO EN RD · Flota inicial (datos de ejemplo)
-- Se inserta solo si la tabla está vacía, para no duplicar al re-aplicar.
-- =====================================================================

insert into public.cars
  (brand, model, year, category, price_per_day, seats, transmission, fuel, rating, trips_count, location, zone, body_color, body_color_2, scene_1, scene_2)
select * from (values
  ('Toyota',        'Corolla',  2023, 'Sedán',     2500, 5, 'Automática', 'Gasolina',  4.9, 128, 'Piantini, SD',    'Santo Domingo', '#E23744', '#a51f2c', '#0f2b33', '#0a1922'),
  ('Honda',         'CR-V',     2022, 'SUV',       3800, 5, 'Automática', 'Gasolina',  4.8,  96, 'Naco, SD',        'Santo Domingo', '#2B6CB0', '#1c4c80', '#122238', '#0b1526'),
  ('Kia',           'Sportage', 2023, 'SUV',       3500, 5, 'Automática', 'Gasolina',  4.7,  74, 'Bella Vista, SD', 'Santo Domingo', '#E8ECF4', '#aeb6c8', '#1c2436', '#10182a'),
  ('Toyota',        'Hilux',    2022, 'Pickup',    4500, 5, 'Automática', 'Diésel',    4.9,  61, 'Punta Cana',      'Punta Cana',    '#2A303C', '#161b26', '#2a1f12', '#1a1408'),
  ('Hyundai',       'Tucson',   2023, 'SUV',       3600, 5, 'Automática', 'Gasolina',  4.6,  52, 'Santiago',        'Santiago',      '#6D46D9', '#4c2ea3', '#1d1436', '#120b26'),
  ('Mercedes-Benz', 'Clase C',  2023, 'Lujo',      7500, 5, 'Automática', 'Gasolina',  5.0,  40, 'Piantini, SD',    'Santo Domingo', '#12182a', '#080c17', '#2a2410', '#191507'),
  ('Tesla',         'Model 3',  2023, 'Eléctrico', 6000, 5, 'Automática', 'Eléctrico', 4.9,  88, 'Naco, SD',        'Santo Domingo', '#C41E3A', '#8f142a', '#0a2b30', '#07191d'),
  ('Kia',           'Rio',      2022, 'Económico', 1800, 5, 'Manual',     'Gasolina',  4.5, 143, 'Los Prados, SD',  'Santo Domingo', '#2563EB', '#1a47a8', '#151d2e', '#0c1320')
) as v
where not exists (select 1 from public.cars);
