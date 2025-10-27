import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { ShopifyProduct } from "@/lib/shopify/types";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";

interface ShopifyProductCardProps {
  product: ShopifyProduct;
}

export const ShopifyProductCard = ({ product }: ShopifyProductCardProps) => {
  const navigate = useNavigate();
  const addItem = useCartStore(state => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const firstVariant = product.node.variants.edges[0]?.node;
    if (!firstVariant) {
      toast.error("Product not available");
      return;
    }

    const cartItem = {
      product,
      variantId: firstVariant.id,
      variantTitle: firstVariant.title,
      price: firstVariant.price,
      quantity: 1,
      selectedOptions: firstVariant.selectedOptions || []
    };
    
    addItem(cartItem);
    toast.success("Added to cart", {
      description: `${product.node.title} has been added to your cart`
    });
  };

  const handleCardClick = () => {
    navigate(`/product/${product.node.handle}`);
  };

  const price = parseFloat(product.node.priceRange.minVariantPrice.amount);
  const image = product.node.images.edges[0]?.node;

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={handleCardClick}
    >
      <div className="aspect-square relative overflow-hidden bg-secondary/10">
        {image ? (
          <img
            src={image.url}
            alt={image.altText || product.node.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No image
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <h3 className="font-semibold line-clamp-2 min-h-[3rem]">
          {product.node.title}
        </h3>
        
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold">
            {product.node.priceRange.minVariantPrice.currencyCode} ${price.toFixed(2)}
          </span>
          
          <Button
            size="sm"
            onClick={handleAddToCart}
            className="gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Add
          </Button>
        </div>
      </div>
    </Card>
  );
};
