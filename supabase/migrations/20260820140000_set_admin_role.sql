-- =====================================================================
-- Fase 4 · Función para que un admin ascienda/revoque a otros admins
-- Solo un administrador puede ejecutarla (verifica is_admin internamente).
-- =====================================================================

create or replace function public.set_admin_role(target_email text, make_admin boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'No autorizado: solo un administrador puede cambiar roles.';
  end if;

  update public.profiles
     set role = case when make_admin then 'admin' else 'customer' end
   where lower(email) = lower(trim(target_email));

  if not found then
    raise exception 'No se encontró ninguna cuenta con ese correo. La persona debe registrarse primero.';
  end if;
end;
$$;

revoke execute on function public.set_admin_role(text, boolean) from anon, public;
grant execute on function public.set_admin_role(text, boolean) to authenticated;
