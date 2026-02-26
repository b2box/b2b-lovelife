import { Button } from "@/components/ui/button";

const HeroV2 = () => {
  return (
    <section className="container mx-auto mt-6">
      <div className="rounded-[28px] p-[4px] bg-gradient-to-r from-purple-500 to-blue-500 shadow-elevate">
        <div className="rounded-[24px] bg-card px-6 md:px-12 py-10 md:py-16">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            {/* H1 */}
            <h1 className="text-3xl md:text-5xl font-bold leading-tight tracking-tight text-foreground">
              Si vendés online, necesitás importar.
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">B2BOX lo hace por vos.</span>{" "}
              Comprás al por mayor en China y recibís en Argentina con precio final.
            </p>

            {/* Impact block */}
            <div className="rounded-2xl border border-border bg-muted/50 px-6 py-5 space-y-2">
              <p className="text-base md:text-lg text-foreground font-medium">
                <span className="font-bold">30%</span> para confirmar.{" "}
                Saldo cuando la mercadería está por liberarse.
              </p>
              <p className="text-base md:text-lg text-foreground font-semibold">
                Sin aduana. Sin trámites. Sin excusas.
              </p>
            </div>

            {/* Mini clarification */}
            <p className="text-sm md:text-base text-muted-foreground italic">
              No es dropshipping. No es stock local.{" "}
              <span className="not-italic font-semibold text-foreground">
                Es importación mayorista gestionada por B2BOX.
              </span>
            </p>

            {/* CTA */}
            <div className="space-y-3">
              <Button variant="brand" size="lg" className="text-base px-10 h-13 rounded-full font-bold">
                Ver catálogo mayorista
              </Button>
              <p className="text-xs md:text-sm text-muted-foreground">
                Compra desde USD 1000. Precio final en Argentina.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroV2;
