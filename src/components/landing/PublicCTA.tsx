import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const PublicCTA = () => {
  const navigate = useNavigate();
  return (
    <section aria-label="CTA de registro" className="container mx-auto">
      <article className="rounded-[28px] bg-foreground text-background p-6 md:p-10 animate-fade-in">
        <div className="grid items-center gap-6 md:grid-cols-[1.4fr_1fr_auto]">
          <h2 className="text-2xl md:text-4xl font-extrabold leading-tight">
            Los que saben ya compran directo. ¿Tú sigues pagando de más?
          </h2>
          <p className="text-base md:text-lg opacity-90">
            Regístrate y accede al catálogo de productos virales, con entrega puerta a puerta y sin intermediarios.
          </p>
          <Button
            onClick={() => navigate("/auth")}
            variant="brand"
            className="rounded-full h-14 px-8 md:px-10 text-base md:text-lg font-semibold hover-scale"
          >
            Quiero vender más
          </Button>
        </div>
      </article>
    </section>
  );
};

export default PublicCTA;
