import { memo } from "react";

interface ImageThumbnailsProps {
  variants: any[];
  product: any;
  selectedImageIndex: number;
  onImageIndexChange: (index: number) => void;
}

const ImageThumbnails = memo(({ variants, product, selectedImageIndex, onImageIndexChange }: ImageThumbnailsProps) => {
  // Collect all images from all variants with variant info
  const allImages = variants.flatMap(variant => 
    (variant as any).product_variant_images?.map((img: any) => ({
      ...img,
      variantName: variant.name || product.name,
      variantId: variant.id
    })) || []
  ).sort((a, b) => a.sort_order - b.sort_order);
  
  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
      {allImages.map((image, i) => (
        <button
          key={`${image.variantId}-${image.id}`}
          className={`relative w-12 h-12 flex-shrink-0 overflow-hidden rounded-lg ring-1 bg-muted transition-all ${
            selectedImageIndex === i ? 'ring-primary ring-2 scale-105' : 'ring-border hover:ring-primary/50'
          }`}
          onClick={() => onImageIndexChange(i)}
          aria-label={`Ver imagen ${i + 1} de ${image.variantName}`}
        >
          <img 
            src={image.url} 
            alt={image.alt || `${image.variantName} imagen ${i + 1}`} 
            className="w-full h-full object-cover" 
            loading="lazy" 
          />
          {/* Variant indicator badge */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs px-1 py-0.5 truncate">
            {image.variantName}
          </div>
        </button>
      ))}
    </div>
  );
});

ImageThumbnails.displayName = "ImageThumbnails";

export default ImageThumbnails;