import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useCountryPricing } from "@/hooks/useCountryPricing";

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
  const navigate = useNavigate();
  const { country } = useCountryPricing();
  return (
    <Card
      className="card-elevated hover:lift transition-transform rounded-2xl border-0 cursor-pointer"
      onClick={() => navigate(`/app/product/${product.id}`)}
      aria-label={`Ver ${product.name}`}
    >
      <CardContent className="p-[5px]">
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
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            loading="lazy"
            className="aspect-square w-full rounded-xl object-cover object-center"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg";
            }}
          />
          {/* Viral badge */}
          {product.viral && (
            <img src="/lovable-uploads/984b614e-1f6b-484a-8b88-5c741374625b.png" alt="Viral ahora" className="absolute right-3 bottom-3 z-20 h-6 w-auto md:h-7 select-none" loading="lazy" />
          )}
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold">
            {country === "AR" && `$${product.price.toFixed(2)} USD`}
            {country === "CO" && `$${product.price.toFixed(0)} COP`}
          </div>
          <p className="text-sm text-muted-foreground">{product.name}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;