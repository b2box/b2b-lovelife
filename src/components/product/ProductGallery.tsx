import ImageGallery from "@/components/product/ImageGallery";
import ImageThumbnails from "@/components/product/ImageThumbnails";
import type { ProductVariant } from "@/hooks/useProductVariants";
import type { Product } from "@/components/landing/ProductCard";

interface ProductGalleryProps {
  variants: ProductVariant[];
  product: Product & { slug: string };
  selectedImageIndex: number;
  onImageIndexChange: (index: number) => void;
}

const ProductGallery = ({ 
  variants, 
  product, 
  selectedImageIndex, 
  onImageIndexChange 
}: ProductGalleryProps) => {
  return (
    <div className="rounded-2xl bg-card p-2 md:p-3 h-fit">
      <div className="space-y-2">
        <div className="relative overflow-hidden rounded-xl bg-muted aspect-square">
          <ImageGallery 
            variants={variants}
            product={product}
            selectedImageIndex={selectedImageIndex}
            onImageIndexChange={onImageIndexChange}
          />
        </div>

        {/* Thumbnails */}
        <ImageThumbnails 
          variants={variants}
          product={product}
          selectedImageIndex={selectedImageIndex}
          onImageIndexChange={onImageIndexChange}
        />
      </div>
    </div>
  );
};

export default ProductGallery;