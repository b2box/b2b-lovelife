
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type AdminGuardResult = {
  loading: boolean;
  allowed: boolean;
  userId: string | null;
  userRole: string | null;
};

export function useAdminGuard(): AdminGuardResult {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let active = true;

    const check = async () => {
      console.log("[AdminGuard] Checking session and role...");
      
      try {
        const { data: userData, error: userErr } = await supabase.auth.getUser();
        if (userErr) {
          console.error("[AdminGuard] getUser error:", userErr);
          if (active) {
            setLoading(false);
            setAllowed(false);
          }
          return;
        }
        
        const user = userData?.user ?? null;
        console.log("[AdminGuard] User found:", !!user, user?.id);
        
        if (!user) {
          console.warn("[AdminGuard] No session, redirecting to /auth");
          if (active) {
            navigate("/auth", { replace: true, state: { from: location.pathname } });
          }
          return;
        }

        setUserId(user.id);

        // Verificar si es admin o agente (ambos pueden acceder al admin)
        console.log("[AdminGuard] Calling is_admin_or_agent RPC...");
        const { data: hasAccess, error: accessErr } = await supabase.rpc("is_admin_or_agent", {
          _user_id: user.id,
        });

        console.log("[AdminGuard] is_admin_or_agent result:", hasAccess, "error:", accessErr);

        if (accessErr) {
          console.error("[AdminGuard] is_admin_or_agent RPC error:", accessErr);
          // Fallar silenciosamente y continuar sin acceso
        }

        // Obtener el rol específico del usuario
        console.log("[AdminGuard] Calling get_user_role RPC...");
        const { data: role, error: roleErr } = await supabase.rpc("get_user_role", {
          _user_id: user.id,
        });

        console.log("[AdminGuard] get_user_role result:", role, "error:", roleErr);

        if (roleErr) {
          console.error("[AdminGuard] get_user_role RPC error:", roleErr);
          // Fallar silenciosamente y continuar sin rol
        }

        if (active) {
          console.log("[AdminGuard] Setting final state - hasAccess:", Boolean(hasAccess), "role:", role);
          setAllowed(Boolean(hasAccess));
          setUserRole(role || null);
          setLoading(false);
        }
      } catch (error) {
        console.error("[AdminGuard] Unexpected error:", error);
        if (active) {
          setAllowed(false);
          setLoading(false);
        }
      }
    };

    check();

    return () => {
      active = false;
    };
  }, [navigate, location.pathname]);

  return { loading, allowed, userId, userRole };
}

