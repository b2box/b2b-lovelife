import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useUserRole() {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const getUserRole = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      
      if (!user) {
        if (active) {
          setUserRole(null);
          setUserId(null);
          setLoading(false);
        }
        return;
      }

      setUserId(user.id);

      // Obtener el rol del usuario
      const { data: role } = await supabase.rpc("get_user_role", {
        _user_id: user.id,
      });

      if (active) {
        setUserRole(role || null);
        setLoading(false);
      }
    };

    getUserRole();

    return () => {
      active = false;
    };
  }, []);

  return { loading, userRole, userId };
}