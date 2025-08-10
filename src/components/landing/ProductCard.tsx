import { Card, CardContent } from "@/components/ui/card";

export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  badge?: string;
};

type Props = { product: Product };

const ProductCard = ({ product }: Props) => {
  return (
    <Card className="card-elevated hover:lift transition-transform">
      <CardContent className="p-4">
        <div className="relative">
          {product.badge && (
            <span className="absolute left-2 top-2 z-10 rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">{product.badge}</span>
          )}
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="aspect-square w-full rounded-md object-cover"
          />
        </div>
        <div className="mt-3">
          <div className="text-lg font-semibold">${product.price.toFixed(2)}</div>
          <p className="line-clamp-2 text-sm text-muted-foreground">{product.name}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;