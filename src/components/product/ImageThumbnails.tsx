import { memo, useMemo, useCallback } from "react";

interface ImageThumbnailsProps {
  variants: any[];
  product: any;
  selectedImageIndex: number;
  onImageIndexChange: (index: number) => void;
}

const ImageThumbnails = memo(({ variants, product, selectedImageIndex, onImageIndexChange }: ImageThumbnailsProps) => {
  // Collect all images from all variants with error handling - stabilized
  const allImages = useMemo(() => {
    if (!Array.isArray(variants) || variants.length === 0) return [];
    
    return variants.flatMap(variant => {
      const images = variant?.product_variant_images;
      if (!Array.isArray(images)) return [];
      
      return images.map((img: any) => ({
        id: img?.id,
        url: img?.url,
        alt: img?.alt,
        sort_order: img?.sort_order || 0,
        variantName: variant?.name || "Producto",
        variantId: variant?.id
      }));
    }).sort((a, b) => a.sort_order - b.sort_order);
  }, [variants]);
  
  // Calculate which images to show based on selected index
  const { displayImages, startIndex } = useMemo(() => {
    if (!allImages.length) return { displayImages: [], startIndex: 0 };
    
    const maxThumbnails = 5;
    let start = 0;
    
    // If selected image is beyond the first 5, adjust the start position
    if (selectedImageIndex >= maxThumbnails) {
      start = Math.min(selectedImageIndex - 2, allImages.length - maxThumbnails);
    }
    
    const images = allImages.slice(start, start + maxThumbnails);
    
    return {
      displayImages: images,
      startIndex: start
    };
  }, [allImages, selectedImageIndex]);
  
  const remainingCount = Math.max(0, allImages.length - (startIndex + displayImages.length));

  const handleImageClick = useCallback((actualIndex: number) => {
    if (actualIndex >= 0 && actualIndex < allImages.length) {
      onImageIndexChange(actualIndex);
    }
  }, [allImages.length, onImageIndexChange]);

  if (!displayImages.length) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 justify-between w-full max-w-full">
      {displayImages.map((image, i) => {
        const actualIndex = startIndex + i;
        const isSelected = selectedImageIndex === actualIndex;
        
        return (
          <button
            key={`${image?.variantId}-${image?.id}-${actualIndex}`}
            className={`relative flex-1 aspect-square max-w-[calc(20%-0.5rem)] overflow-hidden rounded-lg transition-all ${
              isSelected 
                ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-105 z-10' 
                : 'ring-1 ring-border hover:ring-primary/50'
            }`}
            onClick={() => handleImageClick(actualIndex)}
            aria-label={`Ver imagen ${actualIndex + 1} de ${image?.variantName || 'producto'}`}
            type="button"
          >
            <img 
              src={image?.url || "/placeholder.svg"} 
              alt={image?.alt || `${image?.variantName || 'producto'} imagen ${actualIndex + 1}`} 
              className="w-full h-full object-cover" 
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== "/placeholder.svg") {
                  target.src = "/placeholder.svg";
                }
              }}
            />
            {/* +X indicator for extra images on the last thumbnail */}
            {i === displayImages.length - 1 && remainingCount > 0 && (
              <div className="absolute inset-0 grid place-items-center bg-black/60 text-white text-sm font-bold rounded-lg">
                +{remainingCount}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
});

ImageThumbnails.displayName = "ImageThumbnails";

export default ImageThumbnails;