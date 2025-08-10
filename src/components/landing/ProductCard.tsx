import { Card, CardContent } from "@/components/ui/card";

export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  badge?: string;
  viral?: boolean;
};

type Props = { product: Product };

const ProductCard = ({ product }: Props) => {
  return (
    <Card className="card-elevated hover:lift transition-transform rounded-2xl border-0">
      <CardContent className="p-4 md:p-5">
        <div className="relative">
          {product.badge && (
            <img
              src="/lovable-uploads/9381e44b-152c-428f-bc02-75c74feb59d6.png"
              alt="B2BOX Verified badge"
              className="absolute right-3 top-3 z-20 h-7 w-auto drop-shadow-md"
              loading="lazy"
            />
          )}
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="aspect-square w-full rounded-xl object-cover"
          />
          {/* Viral badge */}
          {product.viral && (
            <img src="/lovable-uploads/984b614e-1f6b-484a-8b88-5c741374625b.png" alt="Viral ahora" className="absolute right-3 bottom-3 z-20 h-6 w-auto md:h-7 select-none" loading="lazy" />
          )}
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold">${product.price.toFixed(2)}</div>
          <p className="text-sm text-muted-foreground">{product.name}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;