import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="mt-16 border-t bg-background">
      <div className="container mx-auto grid gap-8 py-12 md:grid-cols-4">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-gradient-primary" />
            <span className="text-xl font-bold">B2BOX</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Productos virales al por mayor. Compra desde China como si compraras localmente.
          </p>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">Para tu negocio</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#brands" className="hover:text-foreground">Brands</a></li>
            <li><a href="#trends" className="hover:text-foreground">Trends</a></li>
            <li><a href="#academy" className="hover:text-foreground">Academy</a></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">Comprar</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#como" className="hover:text-foreground">¿Cómo comprar?</a></li>
            <li><a href="#envios" className="hover:text-foreground">Precios y envíos</a></li>
            <li><a href="#faq" className="hover:text-foreground">Preguntas frecuentes</a></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">Legal</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#tyc" className="hover:text-foreground">Términos y condiciones</a></li>
            <li><a href="#priv" className="hover:text-foreground">Política de privacidad</a></li>
            <li><a href="#devol" className="hover:text-foreground">Política de devoluciones</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 py-6 md:flex-row">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} B2BOX. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4 text-muted-foreground">
            <a href="#" aria-label="Facebook"><Facebook size={18} /></a>
            <a href="#" aria-label="Instagram"><Instagram size={18} /></a>
            <a href="#" aria-label="LinkedIn"><Linkedin size={18} /></a>
            <a href="#" aria-label="YouTube"><Youtube size={18} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;