import { ArrowUpRight } from "lucide-react";

const PromoBanner = () => {
  return (
    <section className="container mx-auto">
      <div className="mt-8 rounded-[28px] bg-gradient-trends-animated p-6 md:p-8 min-h-32 text-primary-foreground shadow-elevate">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div className="flex items-center justify-center gap-3 justify-self-center">
            <img src="/lovable-uploads/ed2e19ef-d11d-4782-b976-aed06c45b8db.png" alt="Logo B2BOX Trends" className="h-7 md:h-9 w-auto" loading="lazy" />
            <p className="text-base font-semibold md:text-2xl">: Los productos más 🔥 para tu tienda online 🛒</p>
          </div>
          <button className="justify-self-end grid size-10 place-items-center rounded-full border border-white/70 text-white/90 hover:bg-white/10" aria-label="Explorar Trends">
            <ArrowUpRight />
          </button>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;