import ProductCard, { type Product } from "./ProductCard";

type Props = {
  products: Product[];
  fiveCols?: boolean;
};

const ProductGrid = ({ products, fiveCols = false }: Props) => {
  const gridCols = fiveCols ? "lg:grid-cols-5 xl:grid-cols-5" : "lg:grid-cols-6 xl:grid-cols-6";
  return (
    <div className={`grid grid-cols-2 gap-6 md:grid-cols-3 ${gridCols}`}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
};

export default ProductGrid;