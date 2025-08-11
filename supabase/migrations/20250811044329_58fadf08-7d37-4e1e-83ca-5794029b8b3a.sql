-- Limpiar datos existentes incorrectos y configurar roles correctos
DELETE FROM public.user_roles;

-- Insertar Gabriel como admin (ya existe en auth.users)
INSERT INTO public.user_roles (user_id, role)
SELECT 'd1c36a1f-68bd-4845-aa4d-f4da6cd8a7cd', 'admin'::app_role
WHERE EXISTS (SELECT 1 FROM auth.users WHERE id = 'd1c36a1f-68bd-4845-aa4d-f4da6cd8a7cd');

-- Actualizar el perfil de Gabriel
UPDATE public.profiles 
SET display_name = 'Gabriel'
WHERE id = 'd1c36a1f-68bd-4845-aa4d-f4da6cd8a7cd';

-- Función para verificar si un usuario es admin o agente
CREATE OR REPLACE FUNCTION public.is_admin_or_agent(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = _user_id AND ur.role IN ('admin', 'agent')
  );
$$;

-- Función para obtener el rol del usuario
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT ur.role FROM public.user_roles ur
  WHERE ur.user_id = _user_id
  LIMIT 1;
$$;