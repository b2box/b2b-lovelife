import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
// import HCaptcha from "@hcaptcha/react-hcaptcha";

const Auth = () => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  // const captchaRef = useRef<HCaptcha>(null);
  const captchaRef = useRef<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Clave del sitio de hCaptcha (pública, segura para el código)
  const HCAPTCHA_SITE_KEY = "10000000-ffff-ffff-ffff-000000000001"; // Reemplaza con tu clave real

  useEffect(() => {
    document.title = mode === "login" ? "Iniciar sesión – B2BOX" : "Registrarse – B2BOX";
  }, [mode]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        // Redirect to app once authenticated
        navigate("/app", { replace: true });
      }
    });

    // Check existing session
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) navigate("/app", { replace: true });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar captcha para operaciones de registro
    if (mode === "signup" && !captchaToken) {
      toast({ title: "Error", description: "Por favor completa la verificación captcha." });
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ 
          email, 
          password,
          options: {
            captchaToken: captchaToken || undefined
          }
        });
        if (error) throw error;
        toast({ title: "¡Bienvenido!", description: "Inicio de sesión exitoso." });
      } else {
        const redirectUrl = `${window.location.origin}/auth`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { 
            emailRedirectTo: redirectUrl,
            captchaToken: captchaToken || undefined
          },
        });
        if (error) throw error;
        toast({ title: "Revisa tu correo", description: "Te enviamos un enlace para confirmar tu cuenta." });
      }
      
      // Reset captcha after successful submission
      setCaptchaToken(null);
      captchaRef.current?.resetCaptcha();
      
    } catch (err: any) {
      toast({ title: "Error", description: err.message ?? "Ocurrió un error" });
      // Reset captcha on error
      setCaptchaToken(null);
      captchaRef.current?.resetCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const onCaptchaVerify = (token: string) => {
    setCaptchaToken(token);
  };

  const onCaptchaExpire = () => {
    setCaptchaToken(null);
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
              
              {/* hCaptcha temporalmente deshabilitado */}
              {false && (
                <div className="flex justify-center">
                  <div>Captcha placeholder</div>
                </div>
              )}
              
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
