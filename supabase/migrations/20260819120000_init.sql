-- =====================================================================
-- TU CARRO EN RD · Esquema inicial
-- Tablas: profiles, cars, bookings  +  RLS  +  trigger de nuevo usuario
-- =====================================================================

create extension if not exists "uuid-ossp";

-- ---------- Enum de estado de reserva ----------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'booking_status') then
    create type booking_status as enum ('active', 'past', 'cancelled');
  end if;
end$$;

-- ---------- Perfiles (1:1 con auth.users) ----------
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  full_name       text,
  phone           text,
  email           text,
  avatar_initials text,
  level           text        not null default 'Nuevo',
  rating          numeric(2,1) not null default 5.0,
  trips_count     int         not null default 0,
  created_at      timestamptz not null default now()
);

-- ---------- Flota de carros ----------
create table if not exists public.cars (
  id            uuid primary key default uuid_generate_v4(),
  brand         text  not null,
  model         text  not null,
  year          int   not null,
  category      text  not null,               -- SUV, Sedán, Lujo, Pickup, Eléctrico, Económico
  price_per_day int   not null,               -- RD$ por día
  seats         int   not null default 5,
  transmission  text  not null default 'Automática',
  fuel          text  not null default 'Gasolina',
  rating        numeric(2,1) not null default 4.8,
  trips_count   int   not null default 0,
  location      text  not null,
  zone          text  not null,               -- Santo Domingo, Punta Cana, Santiago
  body_color    text  not null default '#2B6CB0',
  body_color_2  text  not null default '#1c4c80',
  scene_1       text  not null default '#122238',
  scene_2       text  not null default '#0b1526',
  features      text[] not null default array[
                  'Aire acondicionado','Bluetooth','Cámara de reversa',
                  'Kilometraje ilimitado','USB / Carga','Seguro básico incluido'],
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);
create index if not exists cars_category_idx on public.cars (category);
create index if not exists cars_zone_idx     on public.cars (zone);

-- ---------- Reservas ----------
create table if not exists public.bookings (
  id            uuid primary key default uuid_generate_v4(),
  code          text not null unique,
  user_id       uuid not null references auth.users(id) on delete cascade,
  car_id        uuid not null references public.cars(id),
  pickup_date   date not null,
  return_date   date not null,
  pickup_time   text not null default '10:00 AM',
  return_time   text not null default '10:00 AM',
  days          int  not null,
  price_per_day int  not null,
  extras        jsonb not null default '[]'::jsonb,
  subtotal      int  not null,
  total         int  not null,
  location      text,
  status        booking_status not null default 'active',
  created_at    timestamptz not null default now()
);
create index if not exists bookings_user_idx on public.bookings (user_id);

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.cars     enable row level security;
alter table public.bookings enable row level security;

-- Perfiles: cada quien ve y edita el suyo
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- Carros: lectura pública (catálogo visible para todos)
drop policy if exists "cars_select_all" on public.cars;
create policy "cars_select_all" on public.cars
  for select using (true);

-- Reservas: cada usuario administra las suyas
drop policy if exists "bookings_select_own" on public.bookings;
create policy "bookings_select_own" on public.bookings
  for select using (auth.uid() = user_id);

drop policy if exists "bookings_insert_own" on public.bookings;
create policy "bookings_insert_own" on public.bookings
  for insert with check (auth.uid() = user_id);

drop policy if exists "bookings_update_own" on public.bookings;
create policy "bookings_update_own" on public.bookings
  for update using (auth.uid() = user_id);

drop policy if exists "bookings_delete_own" on public.bookings;
create policy "bookings_delete_own" on public.bookings
  for delete using (auth.uid() = user_id);

-- =====================================================================
-- Trigger: crear perfil automáticamente al registrarse un usuario
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  display_name text;
begin
  display_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1)
  );
  insert into public.profiles (id, full_name, email, phone, avatar_initials)
  values (
    new.id,
    display_name,
    new.email,
    new.raw_user_meta_data->>'phone',
    upper(left(regexp_replace(display_name, '\s', '', 'g'), 2))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
