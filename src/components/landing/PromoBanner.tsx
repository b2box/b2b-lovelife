import { ArrowUpRight } from "lucide-react";

const PromoBanner = () => {
  return (
    <section className="container mx-auto">
      <div className="mt-8 rounded-[28px] bg-gradient-trends-animated p-4 text-primary-foreground shadow-elevate">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-3 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-foreground shadow-sm">
              <img src="/lovable-uploads/f311b60a-adbd-4b8b-8fce-7615166a2895.png" alt="B2BOX Brands" className="h-6 w-auto" loading="lazy" />
              <img src="/lovable-uploads/573f686c-7492-4309-a3ef-8a941e81ec6e.png" alt="B2BOX Trends" className="h-6 w-auto" loading="lazy" />
            </span>
            <p className="text-base font-semibold md:text-2xl">Los productos más 🔥 para tu tienda online</p>
          </div>
          <button className="grid size-10 place-items-center rounded-full border border-white/70 text-white/90 hover:bg-white/10" aria-label="Explorar Trends">
            <ArrowUpRight />
          </button>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;