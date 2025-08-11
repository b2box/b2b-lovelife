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
      try {
        console.log("[AdminGuard] Starting auth check...");
        
        // Get current user session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log("[AdminGuard] Session:", !!session, "Error:", sessionError);
        
        if (sessionError) {
          console.error("[AdminGuard] Session error:", sessionError);
          if (active) {
            setLoading(false);
            setAllowed(false);
          }
          return;
        }

        if (!session?.user) {
          console.log("[AdminGuard] No session, redirecting to auth");
          if (active) {
            navigate("/auth", { replace: true, state: { from: location.pathname } });
          }
          return;
        }

        const userId = session.user.id;
        console.log("[AdminGuard] User ID:", userId);
        setUserId(userId);

        // Check if user has admin or agent role
        console.log("[AdminGuard] Checking roles...");
        const { data: hasAccess, error: accessError } = await supabase.rpc("is_admin_or_agent", {
          _user_id: userId,
        });

        console.log("[AdminGuard] Access check result:", hasAccess, "Error:", accessError);

        // Get specific user role
        const { data: userRole, error: roleError } = await supabase.rpc("get_user_role", {
          _user_id: userId,
        });

        console.log("[AdminGuard] Role check result:", userRole, "Error:", roleError);

        if (active) {
          const hasAccess_bool = Boolean(hasAccess);
          console.log("[AdminGuard] Final state - Access:", hasAccess_bool, "Role:", userRole);
          setAllowed(hasAccess_bool);
          setUserRole(userRole || null);
          setLoading(false);
        }

      } catch (error) {
        console.error("[AdminGuard] Unexpected error in check():", error);
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