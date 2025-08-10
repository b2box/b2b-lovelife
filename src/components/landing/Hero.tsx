import heroImage from "@/assets/hero-b2b.jpg";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="container mx-auto grid items-center gap-8 py-10 md:py-16 lg:grid-cols-2">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
            <span className="h-2 w-2 rounded-full bg-primary" />
            Mayorista directo de fábrica
          </div>
          <h1 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">
            Productos virales al por mayor para tu tienda online
          </h1>
          <p className="mt-3 text-muted-foreground md:text-lg">
            Compra inteligente con envíos ágiles y precios competitivos. Construimos tu catálogo con productos de alta rotación.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="hero" className="pill px-6 py-3 hover:lift">Explorar tendencias</Button>
            <Button variant="outline" className="pill px-6 py-3">Ver categorías</Button>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-8 -z-10 rounded-3xl bg-gradient-primary opacity-20 blur-2xl" aria-hidden />
          <img src={heroImage} alt="B2B ecommerce hero visual" loading="eager" className="w-full rounded-xl shadow-elevate animate-float" />
        </div>
      </div>
    </section>
  );
};

export default Hero;