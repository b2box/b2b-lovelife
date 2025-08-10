import { Card } from "@/components/ui/card";
const CATEGORY_IMG = "/lovable-uploads/86370ad9-004b-4913-88ea-47228476a72f.png";
import { ChevronRight } from "lucide-react";

const items = [
  { title: "Hogar", image: CATEGORY_IMG },
  { title: "Electrónica", image: CATEGORY_IMG },
  { title: "Moda masculina" },
  { title: "Vehículos, motos y bicicletas", arrow: true },
];

const CategoryShowcase = () => {
  return (
    <section className="container mx-auto">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {items.map((it, idx) => (
          <Card key={idx} className="card-elevated relative overflow-hidden rounded-[28px] bg-muted p-6 min-h-[360px]">
            <h3 className="text-2xl font-semibold">{it.title}</h3>
            {it.image && (
              <img
                src={it.image}
                alt={`Decoración ${it.title}`}
                className="pointer-events-none select-none absolute bottom-0 right-0 w-[85%] max-w-none"
                loading="lazy"
              />
            )}
            {it.arrow && (
              <div className="absolute right-6 top-1/2 -translate-y-1/2">
                <div className="grid size-10 place-items-center rounded-full border text-foreground/80">
                  <ChevronRight />
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </section>
  );
};

export default CategoryShowcase;
