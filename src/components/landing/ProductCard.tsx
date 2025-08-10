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
    <Card className="card-elevated hover:lift transition-transform rounded-2xl">
      <CardContent className="p-4">
        <div className="relative">
          {product.badge && (
            <span className="absolute right-2 top-2 z-10 rounded-full border bg-background/90 px-2 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur">
              {product.badge}
            </span>
          )}
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="aspect-square w-full rounded-md object-cover"
          />
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold">${product.price.toFixed(2)}</div>
          <p className="truncate text-sm text-muted-foreground">{product.name}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;