
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
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr) {
        console.error("[AdminGuard] getUser error:", userErr);
      }
      const user = userData?.user ?? null;
      if (!user) {
        console.warn("[AdminGuard] No session, redirecting to /auth");
        if (active) {
          navigate("/auth", { replace: true, state: { from: location.pathname } });
        }
        return;
      }

      setUserId(user.id);

      // Verificar si es admin o agente (ambos pueden acceder al admin)
      const { data: hasAccess, error: accessErr } = await supabase.rpc("is_admin_or_agent", {
        _user_id: user.id,
      });

      if (accessErr) {
        console.error("[AdminGuard] is_admin_or_agent RPC error:", accessErr);
      }

      // Obtener el rol específico del usuario
      const { data: role, error: roleErr } = await supabase.rpc("get_user_role", {
        _user_id: user.id,
      });

      if (roleErr) {
        console.error("[AdminGuard] get_user_role RPC error:", roleErr);
      }

      if (active) {
        setAllowed(Boolean(hasAccess));
        setUserRole(role || null);
        setLoading(false);
      }
    };

    check();

    return () => {
      active = false;
    };
  }, [navigate, location.pathname]);

  return { loading, allowed, userId, userRole };
}

