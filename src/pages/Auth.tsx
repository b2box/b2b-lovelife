import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

const Auth = () => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    document.title = mode === "login" ? "Iniciar sesión – B2BOX" : "Registrarse – B2BOX";
  }, [mode]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        // Check if user is admin first
        supabase.rpc('is_admin_or_agent', { _user_id: session.user.id }).then(({ data: isAdmin }) => {
          if (isAdmin) {
            navigate("/app/admin", { replace: true });
          } else {
            // Get market from localStorage to redirect to correct app
            const market = localStorage.getItem("market") || "CN";
            if (market === "AR") {
              navigate("/app/ar", { replace: true });
            } else if (market === "CO") {
              navigate("/app/co", { replace: true });
            } else {
              navigate("/app", { replace: true });
            }
          }
        });
      }
    });

    // Check existing session
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        supabase.rpc('is_admin_or_agent', { _user_id: data.session.user.id }).then(({ data: isAdmin }) => {
          if (isAdmin) {
            navigate("/app/admin", { replace: true });
          } else {
            const market = localStorage.getItem("market") || "CN";
            if (market === "AR") {
              navigate("/app/ar", { replace: true });
            } else if (market === "CO") {
              navigate("/app/co", { replace: true });
            } else {
              navigate("/app", { replace: true });
            }
          }
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ 
          email, 
          password
        });
        if (error) throw error;
        toast({ title: "¡Bienvenido!", description: "Inicio de sesión exitoso." });
      } else {
        const redirectUrl = `${window.location.origin}/auth`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { 
            emailRedirectTo: redirectUrl
          },
        });
        if (error) throw error;
        toast({ title: "Revisa tu correo", description: "Te enviamos un enlace para confirmar tu cuenta." });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message ?? "Ocurrió un error" });
    } finally {
      setLoading(false);
    }
  };


  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto max-w-md py-10">
        <Card className="border shadow-elevate">
          <CardHeader>
            <CardTitle className="text-2xl">
              {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              
              <Button type="submit" className="w-full" variant="brand" disabled={loading}>
                {loading ? "Procesando…" : mode === "login" ? "Iniciar sesión" : "Registrarse"}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              {mode === "login" ? (
                <>
                  ¿No tenés cuenta?{" "}
                  <Button variant="link" className="px-1" onClick={() => setMode("signup")}>Registrate</Button>
                </>
              ) : (
                <>
                  ¿Ya tenés cuenta?{" "}
                  <Button variant="link" className="px-1" onClick={() => setMode("login")}>Iniciá sesión</Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Auth;
