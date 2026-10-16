-- =====================================================================
-- Fase 5 · Tokens de dispositivo para notificaciones push (FCM)
-- =====================================================================

create table if not exists public.device_tokens (
  token      text primary key,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  platform   text,
  updated_at timestamptz not null default now()
);

create index if not exists device_tokens_user_idx on public.device_tokens(user_id);

alter table public.device_tokens enable row level security;
grant select, insert, update, delete on public.device_tokens to authenticated;

-- Cada usuario administra solo los tokens de sus propios dispositivos.
drop policy if exists "device_tokens_all_own" on public.device_tokens;
create policy "device_tokens_all_own" on public.device_tokens
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
