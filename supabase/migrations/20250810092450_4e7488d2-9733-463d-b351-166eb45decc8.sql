-- Harden function search_path
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- RLS policies for user_roles (RLS already enabled)
create policy "Users can view their own roles"
  on public.user_roles
  for select to authenticated
  using (user_id = auth.uid());

create policy "Admins manage user roles"
  on public.user_roles
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));
