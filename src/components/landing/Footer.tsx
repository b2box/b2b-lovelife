import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer id="site-footer" className="mt-16 bg-background">
      <div className="container mx-auto grid gap-8 py-12 md:grid-cols-5">
        <div>
          <div className="mb-3">
            <img
              src="/lovable-uploads/2aff48ef-50fd-47c3-9885-87de596ab734.png"
              alt="Logo B2BOX"
              className="h-10 w-auto md:h-12"
              loading="lazy"
            />
          </div>
          <p className="mt-4 text-base font-semibold">Productos Virales al por Mayor</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Compra desde China como si compraras localmente.
          </p>
        </div>

        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground"><img src="/lovable-uploads/307e7943-73c1-4b73-9a3a-020177aab39e.png" alt="Icono Para tu negocio" className="h-4 w-4" loading="lazy" /><span>Para tu negocio</span></h3>
          <div className="flex flex-col gap-3">
            <a href="#brands" aria-label="B2BOX Brands">
              <img
                src="/lovable-uploads/5a1d0f95-e676-471f-9aab-89aac7f82c18.png"
                alt="B2BOX Brands"
                className="h-9 w-auto hover-scale"
                loading="lazy"
              />
            </a>
            <a href="#trends" aria-label="B2BOX Trends">
              <img
                src="/lovable-uploads/21382621-126b-47f0-b6bd-c776ea5ff0aa.png"
                alt="B2BOX Trends"
                className="h-9 w-auto hover-scale"
                loading="lazy"
              />
            </a>
            <a href="#academy" aria-label="B2BOX Academy">
              <img
                src="/lovable-uploads/40992dee-8dd3-4691-86b1-75ba530085f6.png"
                alt="B2BOX Academy"
                className="h-9 w-auto hover-scale"
                loading="lazy"
              />
            </a>
          </div>
        </div>

        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground"><img src="/lovable-uploads/a463cd78-cb2e-4fe6-b892-0d5bf0faaba4.png" alt="Icono Comprar" className="h-4 w-4" loading="lazy" /><span>Comprar</span></h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#como" className="story-link hover:text-foreground">¿Cómo comprar?</a></li>
            <li><a href="#productos" className="story-link hover:text-foreground">Nuestros productos</a></li>
            <li><a href="#envios" className="story-link hover:text-foreground">Precios y envíos</a></li>
            <li><a href="#pagos" className="story-link hover:text-foreground">Métodos de pago</a></li>
            <li><a href="#faq" className="story-link hover:text-foreground">Preguntas frecuentes</a></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground"><img src="/lovable-uploads/c0fa3188-b174-4754-9c07-abc53f21dfce.png" alt="Icono Nosotros" className="h-4 w-4" loading="lazy" /><span>Nosotros</span></h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#registro" className="story-link hover:text-foreground">Regístrate en B2BOX</a></li>
            <li><a href="#partners" className="story-link hover:text-foreground">Partners</a></li>
            <li><a href="#group" className="story-link hover:text-foreground">B2BOX Group</a></li>
            <li><a href="#eventos" className="story-link hover:text-foreground">Eventos</a></li>
            <li><a href="#contacto" className="story-link hover:text-foreground">Contacto</a></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground"><img src="/lovable-uploads/2275c0b0-3ef0-454c-aa91-f8110f929178.png" alt="Icono Legal" className="h-4 w-4" loading="lazy" /><span>Legal</span></h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#tyc" className="story-link hover:text-foreground">Términos y condiciones</a></li>
            <li><a href="#priv" className="story-link hover:text-foreground">Política de privacidad</a></li>
            <li><a href="#devol" className="story-link hover:text-foreground">Política de devoluciones</a></li>
            <li><a href="#metodos-aceptados" className="story-link hover:text-foreground">Métodos de pago aceptados</a></li>
            <li><a href="#certificaciones" className="story-link hover:text-foreground">Certificaciones de seguridad</a></li>
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