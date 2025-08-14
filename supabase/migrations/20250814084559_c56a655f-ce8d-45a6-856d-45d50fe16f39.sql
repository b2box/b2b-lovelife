-- Get Sergi's user ID and add admin role
INSERT INTO public.user_roles (user_id, role)
SELECT au.id, 'admin'::app_role
FROM auth.users au
WHERE au.email = 'sergi@aziatrade.com'
ON CONFLICT (user_id, role) DO NOTHING;