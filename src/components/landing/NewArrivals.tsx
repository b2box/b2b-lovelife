
import ProductCard from "./ProductCard";
import { categories } from "./data";
import { useNavigate } from "react-router-dom";
const NewArrivals = () => {
  const navigate = useNavigate();
  const firstKey = Object.keys(categories)[0];
  const products = categories[firstKey]?.slice(0, 3) ?? [];

  return (
    <section aria-label="Lo más nuevo en B2BOX" className="container mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-stretch">
        <button
          onClick={() => navigate("/auth")}
          className="relative overflow-hidden rounded-[28px] bg-brand-violet-soft animate-fade-in flex items-end justify-center h-full md:col-span-2"
          aria-label="Explorar lo más nuevo en B2BOX"
        >
          <img
            src="/lovable-uploads/675a800a-12eb-4949-a34c-e4dbc08e2680.png"
            alt="Lo más nuevo en B2BOX - ilustración"
            className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[120%] w-auto pointer-events-none select-none"
            loading="lazy"
          />
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
