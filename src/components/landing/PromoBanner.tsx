import { ArrowUpRight } from "lucide-react";

const PromoBanner = () => {
  return (
    <section className="container mx-auto">
      <div className="rounded-[28px] bg-gradient-trends-animated px-4 md:px-6 py-[17px] md:py-[7px] relative text-primary-foreground shadow-elevate">
        <button className="absolute top-3 right-3 grid size-10 md:size-12 place-items-center rounded-full border border-white/70 text-white/90 hover:bg-white/10" aria-label="Explorar Trends">
          <ArrowUpRight />
        </button>
        <div className="h-full w-full flex items-center justify-center">
          <div className="flex items-center gap-4 md:gap-5">
            <img src="/lovable-uploads/ed2e19ef-d11d-4782-b976-aed06c45b8db.png" alt="Logo B2BOX Trends" className="h-12 md:h-14 w-auto" loading="lazy" />
            <p className="whitespace-nowrap text-xl md:text-3xl font-semibold">: Los productos más 🔥 para tu tienda online 🛒</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;