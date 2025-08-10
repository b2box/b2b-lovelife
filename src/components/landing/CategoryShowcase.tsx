import { Card } from "@/components/ui/card";
import heroImage from "@/assets/hero-b2b.jpg";
import productImg from "@/assets/product-organizer.jpg";
import { ChevronRight } from "lucide-react";

const items = [
  { title: "Hogar", image: heroImage },
  { title: "Electrónica", image: productImg },
  { title: "Moda masculina" },
  { title: "Vehículos, motos y bicicletas", arrow: true },
];

const CategoryShowcase = () => {
  return (
    <section className="container mx-auto">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {items.map((it, idx) => (
          <Card key={idx} className="card-elevated relative rounded-3xl bg-muted p-6">
            <h3 className="text-xl font-semibold">{it.title}</h3>
            {it.image && (
              <img
                src={it.image}
                alt={`Imagen de ${it.title}`}
                className="mt-4 h-48 w-full rounded-2xl object-cover"
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
