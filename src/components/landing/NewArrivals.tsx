import { ArrowUpRight } from "lucide-react";

const ILLUSTRATION = "/lovable-uploads/9a49c939-851c-4da2-b256-e577a0021fba.png";

const NewArrivals = () => {
  return (
    <section aria-label="Lo más nuevo en B2BOX" className="container mx-auto">
      <article className="relative overflow-hidden rounded-[28px] bg-primary text-primary-foreground p-6 md:p-10 animate-fade-in">
        <div className="grid items-center gap-6 md:grid-cols-2">
          <h2 className="text-3xl md:text-5xl font-extrabold leading-tight text-center md:text-left">
            Lo más nuevo en
            <br />
            B2BOX
          </h2>
          <div className="relative h-40 md:h-56">
            <img
              src={ILLUSTRATION}
              alt="Ilustración de remera representando nuevos productos en B2BOX"
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 md:left-6 md:translate-x-0 h-full w-auto drop-shadow"
              loading="lazy"
            />
          </div>
        </div>

        <button
          aria-label="Explorar lo más nuevo"
          className="absolute bottom-6 right-6 grid size-12 place-items-center rounded-full bg-background text-foreground/90 shadow border border-foreground/10 hover-scale"
        >
          <ArrowUpRight />
        </button>
      </article>
    </section>
  );
};

export default NewArrivals;
