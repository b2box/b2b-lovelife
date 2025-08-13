import { memo, useMemo } from "react";

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
  
  // Calculate which images to show based on selected index
  const { displayImages, startIndex } = useMemo(() => {
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

  return (
    <div className="flex items-center gap-2 justify-between w-full max-w-full">
      {displayImages.map((image, i) => {
        const actualIndex = startIndex + i;
        const isSelected = selectedImageIndex === actualIndex;
        
        return (
          <button
            key={`${image.variantId}-${image.id}`}
            className={`relative flex-1 aspect-square max-w-[calc(20%-0.5rem)] overflow-hidden rounded-lg transition-all ${
              isSelected 
                ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-105 z-10' 
                : 'ring-1 ring-border hover:ring-primary/50'
            }`}
            onClick={() => onImageIndexChange(actualIndex)}
            aria-label={`Ver imagen ${actualIndex + 1} de ${image.variantName}`}
          >
            <img 
              src={image.url} 
              alt={image.alt || `${image.variantName} imagen ${actualIndex + 1}`} 
              className="w-full h-full object-cover" 
              loading="lazy" 
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