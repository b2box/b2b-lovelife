import { ArrowUpRight } from "lucide-react";
import ProductCard from "./ProductCard";
import { categories } from "./data";
import { useNavigate } from "react-router-dom";
const NewArrivals = () => {
  const navigate = useNavigate();
  const firstKey = Object.keys(categories)[0];
  const products = categories[firstKey]?.slice(0, 3) ?? [];

  return (
    <section aria-label="Lo más nuevo en B2BOX" className="container mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-stretch">
        <button
          onClick={() => navigate("/auth")}
          className="relative overflow-hidden rounded-[28px] bg-primary text-primary-foreground p-6 md:p-10 animate-fade-in text-left flex items-center justify-center"
          aria-label="Ver lo más nuevo en B2BOX"
        >
          <div>
            <h2 className="text-2xl md:text-4xl font-extrabold leading-tight text-center md:text-left">
              Lo más nuevo en
              <br />
              B2BOX
            </h2>
            <span
              className="absolute bottom-6 right-6 grid size-12 place-items-center rounded-full bg-background text-foreground/90 shadow border border-foreground/10 hover-scale"
              aria-hidden="true"
            >
              <ArrowUpRight />
            </span>
          </div>
        </button>

        {products.map((p, idx) => (
          <div key={p.id + idx} className="h-full">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default NewArrivals;
