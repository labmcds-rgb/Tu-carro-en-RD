-- =====================================================================
-- Fase 3 · Fotos reales de carros (Storage) + columna image_url
-- =====================================================================

alter table public.cars add column if not exists image_url text;

-- Bucket público para las fotos, con límite de 50 MB por archivo
insert into storage.buckets (id, name, public, file_size_limit)
values ('car-photos', 'car-photos', true, 52428800)
on conflict (id) do update set public = true, file_size_limit = 52428800;

-- Lectura pública de las fotos
drop policy if exists "car_photos_public_read" on storage.objects;
create policy "car_photos_public_read" on storage.objects
  for select using (bucket_id = 'car-photos');

-- Solo los administradores pueden subir / cambiar / borrar fotos
drop policy if exists "car_photos_admin_insert" on storage.objects;
create policy "car_photos_admin_insert" on storage.objects
  for insert with check (bucket_id = 'car-photos' and public.is_admin());

drop policy if exists "car_photos_admin_update" on storage.objects;
create policy "car_photos_admin_update" on storage.objects
  for update using (bucket_id = 'car-photos' and public.is_admin());

drop policy if exists "car_photos_admin_delete" on storage.objects;
create policy "car_photos_admin_delete" on storage.objects
  for delete using (bucket_id = 'car-photos' and public.is_admin());
