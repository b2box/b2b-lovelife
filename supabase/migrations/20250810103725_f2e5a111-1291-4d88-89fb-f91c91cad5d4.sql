
-- Asignar rol 'admin' al usuario por email (idempotente)
insert into public.user_roles (id, user_id, role)
select gen_random_uuid(), u.id, 'admin'::public.app_role
from auth.users u
where u.email = 'gabriel@aziatrade.com'
and not exists (
  select 1 from public.user_roles ur
  where ur.user_id = u.id and ur.role = 'admin'::public.app_role
);
