import { Card } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
const CATEGORY_IMG = "/lovable-uploads/86370ad9-004b-4913-88ea-47228476a72f.png";

const items = [
  { title: "Hogar", image: CATEGORY_IMG },
  { title: "Electrónica", image: CATEGORY_IMG },
  { title: "Moda masculina" },
  { title: "Vehículos, motos y bicicletas", arrow: true },
];

const CategoryShowcase = () => {
  const slides = [...items, ...items];
  return (
    <section className="container mx-auto">
      <Carousel opts={{ align: "start", loop: false }}>
        <CarouselContent>
          {slides.map((it, idx) => (
            <CarouselItem key={idx} className="md:basis-1/2 lg:basis-1/4">
              <Card className="card-elevated relative overflow-hidden rounded-[28px] bg-muted p-6 min-h-[360px]">
                <h3 className="text-2xl font-semibold">{it.title}</h3>
                {it.image && (
                  <img
                    src={it.image}
                    alt={`Decoración ${it.title}`}
                    className="pointer-events-none select-none absolute bottom-0 right-0 w-[85%] max-w-none"
                    loading="lazy"
                  />
                )}
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="bg-white/90 text-foreground border border-white/70 shadow disabled:opacity-0 disabled:pointer-events-none" />
        <CarouselNext className="bg-white/90 text-foreground border border-white/70 shadow disabled:opacity-0 disabled:pointer-events-none" />
      </Carousel>
    </section>
  );
};

export default CategoryShowcase;
