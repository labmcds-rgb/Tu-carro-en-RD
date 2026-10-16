-- =====================================================================
-- Fase 2 · Rol de administrador + permisos (RLS)
-- =====================================================================

-- Columna de rol en perfiles: 'customer' (por defecto) o 'admin'
alter table public.profiles
  add column if not exists role text not null default 'customer';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_role_check') then
    alter table public.profiles
      add constraint profiles_role_check check (role in ('customer', 'admin'));
  end if;
end$$;

-- Helper: ¿el usuario actual es administrador?
-- security definer evita recursión de RLS al consultar profiles.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------- Carros: los admin gestionan la flota ----------
drop policy if exists "cars_admin_insert" on public.cars;
create policy "cars_admin_insert" on public.cars for insert with check (public.is_admin());

drop policy if exists "cars_admin_update" on public.cars;
create policy "cars_admin_update" on public.cars for update using (public.is_admin());

drop policy if exists "cars_admin_delete" on public.cars;
create policy "cars_admin_delete" on public.cars for delete using (public.is_admin());

-- ---------- Reservas: los admin ven y actualizan todas ----------
drop policy if exists "bookings_admin_select" on public.bookings;
create policy "bookings_admin_select" on public.bookings for select using (public.is_admin());

drop policy if exists "bookings_admin_update" on public.bookings;
create policy "bookings_admin_update" on public.bookings for update using (public.is_admin());

-- ---------- Perfiles: los admin ven todos (para mostrar el cliente en cada reserva) ----------
drop policy if exists "profiles_admin_select" on public.profiles;
create policy "profiles_admin_select" on public.profiles for select using (public.is_admin());
