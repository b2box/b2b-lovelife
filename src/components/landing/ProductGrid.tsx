import ProductCard, { type Product } from "./ProductCard";

type Props = {
  products: Product[];
};

const ProductGrid = ({ products }: Props) => {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
};

export default ProductGrid;