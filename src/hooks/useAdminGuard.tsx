
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type AdminGuardResult = {
  loading: boolean;
  allowed: boolean;
  userId: string | null;
};

export function useAdminGuard(): AdminGuardResult {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
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

      // Usa la función RPC has_role(_user_id, _role)
      const { data: hasRole, error: roleErr } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });

      if (roleErr) {
        console.error("[AdminGuard] has_role RPC error:", roleErr);
      }

      if (active) {
        setAllowed(Boolean(hasRole));
        setLoading(false);
      }
    };

    check();

    return () => {
      active = false;
    };
  }, [navigate, location.pathname]);

  return { loading, allowed, userId };
}

