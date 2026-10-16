-- =============================================================================
-- TU CARRO EN RD · SETUP COMPLETO DE LA BASE DE DATOS
-- -----------------------------------------------------------------------------
-- Pega TODO este archivo en:  Supabase → SQL Editor → New query → Run.
-- Recrea desde cero toda la base de datos (tablas, seguridad, funciones,
-- triggers, ajustes y los 8 carros de ejemplo). Es seguro re-ejecutarlo.
--
-- Tras correrlo, para dejar admin tu cuenta: regístrate en la app y luego
-- ejecuta de nuevo la última línea (sección 11) con tu correo.
-- =============================================================================


-- =====================================================================
-- 1) EXTENSIONES Y TIPOS
-- =====================================================================
create extension if not exists "uuid-ossp";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'booking_status') then
    create type booking_status as enum ('active', 'past', 'cancelled');
  end if;
end$$;


-- =====================================================================
-- 2) TABLAS
-- =====================================================================

-- ---------- Perfiles (1:1 con auth.users) ----------
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  full_name       text,
  phone           text,
  email           text,
  avatar_initials text,
  level           text         not null default 'Nuevo',
  rating          numeric(2,1) not null default 5.0,
  trips_count     int          not null default 0,
  role            text         not null default 'customer',
  created_at      timestamptz  not null default now()
);
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_role_check') then
    alter table public.profiles add constraint profiles_role_check check (role in ('customer', 'admin'));
  end if;
end$$;

-- ---------- Flota de carros ----------
create table if not exists public.cars (
  id             uuid primary key default uuid_generate_v4(),
  brand          text  not null,
  model          text  not null,
  year           int   not null,
  category       text  not null,
  price_per_day  int   not null,
  seats          int   not null default 5,
  transmission   text  not null default 'Automática',
  fuel           text  not null default 'Gasolina',
  rating         numeric(2,1) not null default 4.8,
  trips_count    int   not null default 0,
  location       text  not null,
  zone           text  not null,
  body_color     text  not null default '#2B6CB0',
  body_color_2   text  not null default '#1c4c80',
  scene_1        text  not null default '#122238',
  scene_2        text  not null default '#0b1526',
  features       text[] not null default array[
                   'Aire acondicionado','Bluetooth','Cámara de reversa',
                   'Kilometraje ilimitado','USB / Carga','Seguro básico incluido'],
  is_active      boolean not null default true,
  image_url      text,                 -- foto principal (= images[0])
  images         text[] not null default '{}',  -- todas las fotos
  plate          text,                 -- matrícula (uso interno admin)
  description    text,                 -- descripción en español
  description_en text,                 -- descripción en inglés
  color_name     text,                 -- color en palabras (ej. "Blanco")
  created_at     timestamptz not null default now()
);
create index if not exists cars_category_idx on public.cars (category);
create index if not exists cars_zone_idx     on public.cars (zone);

-- ---------- Reservas ----------
create table if not exists public.bookings (
  id             uuid primary key default uuid_generate_v4(),
  code           text not null unique,
  user_id        uuid not null references auth.users(id) on delete cascade,
  car_id         uuid not null references public.cars(id),
  pickup_date    date not null,
  return_date    date not null,
  pickup_time    text not null default '10:00 AM',
  return_time    text not null default '10:00 AM',
  days           int  not null,
  price_per_day  int  not null,
  extras         jsonb not null default '[]'::jsonb,
  subtotal       int  not null,
  total          int  not null,
  location       text,
  status         booking_status not null default 'active',
  payment_method text not null default 'efectivo',   -- 'efectivo' | 'zelle'
  payment_status text not null default 'pendiente',  -- 'pendiente' | 'pagado'
  created_at     timestamptz not null default now()
);
create index if not exists bookings_user_idx on public.bookings (user_id);

-- ---------- Tokens de dispositivo (push FCM) ----------
create table if not exists public.device_tokens (
  token      text primary key,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  platform   text,
  updated_at timestamptz not null default now()
);
create index if not exists device_tokens_user_idx on public.device_tokens(user_id);

-- ---------- Favoritos ----------
create table if not exists public.favorites (
  user_id    uuid not null references auth.users(id) on delete cascade,
  car_id     uuid not null references public.cars(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, car_id)
);

-- ---------- Reseñas / calificaciones ----------
create table if not exists public.reviews (
  id         uuid primary key default uuid_generate_v4(),
  booking_id uuid not null unique references public.bookings(id) on delete cascade,
  car_id     uuid not null references public.cars(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  rating     int  not null check (rating between 1 and 5),
  comment    text,
  created_at timestamptz not null default now()
);

-- ---------- Ajustes de la app (precios de extras, Zelle) ----------
create table if not exists public.app_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);


-- =====================================================================
-- 3) HELPER is_admin()  (lo usan muchas políticas de seguridad)
-- =====================================================================
create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;


-- =====================================================================
-- 4) ROW LEVEL SECURITY
-- =====================================================================
alter table public.profiles      enable row level security;
alter table public.cars          enable row level security;
alter table public.bookings      enable row level security;
alter table public.device_tokens enable row level security;
alter table public.favorites     enable row level security;
alter table public.reviews       enable row level security;
alter table public.app_settings  enable row level security;

grant select, insert, update, delete on public.device_tokens to authenticated;

-- Perfiles
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "profiles_admin_select" on public.profiles;
create policy "profiles_admin_select" on public.profiles for select using (public.is_admin());

-- Carros (lectura pública; escritura solo admin)
drop policy if exists "cars_select_all" on public.cars;
create policy "cars_select_all" on public.cars for select using (true);
drop policy if exists "cars_admin_insert" on public.cars;
create policy "cars_admin_insert" on public.cars for insert with check (public.is_admin());
drop policy if exists "cars_admin_update" on public.cars;
create policy "cars_admin_update" on public.cars for update using (public.is_admin());
drop policy if exists "cars_admin_delete" on public.cars;
create policy "cars_admin_delete" on public.cars for delete using (public.is_admin());

-- Reservas (cada quien las suyas; admin ve/edita todas)
drop policy if exists "bookings_select_own" on public.bookings;
create policy "bookings_select_own" on public.bookings for select using (auth.uid() = user_id);
drop policy if exists "bookings_insert_own" on public.bookings;
create policy "bookings_insert_own" on public.bookings for insert with check (auth.uid() = user_id);
drop policy if exists "bookings_update_own" on public.bookings;
create policy "bookings_update_own" on public.bookings for update using (auth.uid() = user_id);
drop policy if exists "bookings_delete_own" on public.bookings;
create policy "bookings_delete_own" on public.bookings for delete using (auth.uid() = user_id);
drop policy if exists "bookings_admin_select" on public.bookings;
create policy "bookings_admin_select" on public.bookings for select using (public.is_admin());
drop policy if exists "bookings_admin_update" on public.bookings;
create policy "bookings_admin_update" on public.bookings for update using (public.is_admin());

-- Tokens de dispositivo
drop policy if exists "device_tokens_all_own" on public.device_tokens;
create policy "device_tokens_all_own" on public.device_tokens
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Favoritos
drop policy if exists "favorites_own" on public.favorites;
create policy "favorites_own" on public.favorites
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Reseñas (todos leen para el promedio; cada quien crea las suyas)
drop policy if exists "reviews_read_all" on public.reviews;
create policy "reviews_read_all" on public.reviews for select using (true);
drop policy if exists "reviews_own_insert" on public.reviews;
create policy "reviews_own_insert" on public.reviews for insert with check (auth.uid() = user_id);

-- Ajustes (todos leen; solo admin edita)
drop policy if exists "settings_read_all" on public.app_settings;
create policy "settings_read_all" on public.app_settings for select using (true);
drop policy if exists "settings_admin_write" on public.app_settings;
create policy "settings_admin_write" on public.app_settings
  for all using (public.is_admin()) with check (public.is_admin());


-- =====================================================================
-- 5) STORAGE · bucket de fotos de carros (car-photos)
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit)
values ('car-photos', 'car-photos', true, 52428800)
on conflict (id) do update set public = true, file_size_limit = 52428800;

drop policy if exists "car_photos_public_read" on storage.objects;
create policy "car_photos_public_read" on storage.objects for select using (bucket_id = 'car-photos');
drop policy if exists "car_photos_admin_insert" on storage.objects;
create policy "car_photos_admin_insert" on storage.objects for insert with check (bucket_id = 'car-photos' and public.is_admin());
drop policy if exists "car_photos_admin_update" on storage.objects;
create policy "car_photos_admin_update" on storage.objects for update using (bucket_id = 'car-photos' and public.is_admin());
drop policy if exists "car_photos_admin_delete" on storage.objects;
create policy "car_photos_admin_delete" on storage.objects for delete using (bucket_id = 'car-photos' and public.is_admin());


-- =====================================================================
-- 6) FUNCIONES Y TRIGGERS
-- =====================================================================

-- Crea el perfil automáticamente al registrarse un usuario
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare display_name text;
begin
  display_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1));
  insert into public.profiles (id, full_name, email, phone, avatar_initials)
  values (new.id, display_name, new.email, new.raw_user_meta_data->>'phone',
          upper(left(regexp_replace(display_name, '\s', '', 'g'), 2)))
  on conflict (id) do nothing;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Ascender / revocar administradores
create or replace function public.set_admin_role(target_email text, make_admin boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'No autorizado: solo un administrador puede cambiar roles.';
  end if;
  update public.profiles set role = case when make_admin then 'admin' else 'customer' end
   where lower(email) = lower(trim(target_email));
  if not found then
    raise exception 'No se encontró ninguna cuenta con ese correo. La persona debe registrarse primero.';
  end if;
end; $$;
revoke execute on function public.set_admin_role(text, boolean) from anon, public;
grant execute on function public.set_admin_role(text, boolean) to authenticated;

-- Fechas ocupadas de un carro (para bloquearlas en el calendario)
create or replace function public.car_booked_ranges(p_car_id uuid)
returns table (pickup_date date, return_date date)
language sql security definer stable set search_path = public as $$
  select b.pickup_date, b.return_date from public.bookings b
  where b.car_id = p_car_id and b.status = 'active';
$$;

-- (Opcional/legado) ids de carros con reserva activa
create or replace function public.booked_car_ids()
returns setof uuid language sql security definer stable set search_path = public as $$
  select distinct car_id from public.bookings where status = 'active';
$$;

-- Al guardar una reseña, recalcula el rating del carro (promedio)
create or replace function public.apply_review()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.cars set rating = coalesce(
    (select round(avg(r.rating)::numeric, 1) from public.reviews r where r.car_id = new.car_id), rating)
  where id = new.car_id;
  return new;
end $$;
drop trigger if exists reviews_apply on public.reviews;
create trigger reviews_apply after insert on public.reviews
  for each row execute function public.apply_review();

-- Contador de rentas real (recalcula al crear/cambiar/borrar reservas)
create or replace function public.recount_car_trips(p_car_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.cars set trips_count = (
    select count(*) from public.bookings b where b.car_id = p_car_id and b.status <> 'cancelled'
  ) where id = p_car_id;
$$;
create or replace function public.bookings_recount()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (tg_op = 'DELETE') then perform public.recount_car_trips(old.car_id); return old; end if;
  perform public.recount_car_trips(new.car_id);
  if (tg_op = 'UPDATE' and new.car_id is distinct from old.car_id) then
    perform public.recount_car_trips(old.car_id);
  end if;
  return new;
end $$;
drop trigger if exists bookings_recount_trg on public.bookings;
create trigger bookings_recount_trg after insert or update or delete on public.bookings
  for each row execute function public.bookings_recount();


-- =====================================================================
-- 7) AJUSTES INICIALES (precios de extras + datos de Zelle)
-- =====================================================================
insert into public.app_settings (key, value)
values ('extras', '{"seguro":15,"aero_santiago":0,"aero_sdq":150,"aero_puj":300}'::jsonb)
on conflict (key) do nothing;

insert into public.app_settings (key, value)
values ('zelle', '{"name":"","handle":""}'::jsonb)
on conflict (key) do nothing;


-- =====================================================================
-- 8) FLOTA INICIAL (8 carros de ejemplo) · solo si la tabla está vacía
--    Los precios se cargan en RD$ y luego se convierten a US$ (sección 9).
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


-- =====================================================================
-- 9) CONVERTIR PRECIOS DEL SEED A US$  (tasa 60 RD$ = 1 US$, redondeo a 5)
--    Solo afecta valores altos (precios en pesos); si ya están en dólares
--    (< 1000) los deja igual, para que sea seguro re-ejecutar.
-- =====================================================================
update public.cars
set price_per_day = greatest(5, round(price_per_day / 60.0 / 5) * 5)
where price_per_day >= 1000;


-- =====================================================================
-- 10) RECALCULAR CONTADOR DE RENTAS REAL (base vacía → 0)
-- =====================================================================
update public.cars c
set trips_count = (
  select count(*) from public.bookings b where b.car_id = c.id and b.status <> 'cancelled'
);


-- =====================================================================
-- 11) MARCAR TU CUENTA COMO ADMIN
--     Cambia el correo por el tuyo. Si tu cuenta aún no existe, primero
--     regístrate en la app y luego ejecuta solo esta línea.
-- =====================================================================
update public.profiles set role = 'admin' where email = 'labmcds@gmail.com';
