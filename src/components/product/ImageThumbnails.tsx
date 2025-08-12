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
  
  const displayImages = allImages.slice(0, 5); // Limit to 5 thumbnails max
  const remainingCount = Math.max(0, allImages.length - 5);

  return (
    <div className="flex items-center gap-2 overflow-hidden">
      {displayImages.map((image, i) => (
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
          {/* +X indicator for extra images on the last thumbnail */}
          {i === 4 && remainingCount > 0 && (
            <div className="absolute inset-0 grid place-items-center bg-black/60 text-white text-sm font-bold rounded-lg">
              +{remainingCount}
            </div>
          )}
        </button>
      ))}
    </div>
  );
});

ImageThumbnails.displayName = "ImageThumbnails";

export default ImageThumbnails;