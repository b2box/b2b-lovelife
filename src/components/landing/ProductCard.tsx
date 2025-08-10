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
            <img
              src="/lovable-uploads/9381e44b-152c-428f-bc02-75c74feb59d6.png"
              alt="B2BOX Verified badge"
              className="absolute right-2 top-2 z-10 h-7 w-auto drop-shadow"
              loading="lazy"
            />
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