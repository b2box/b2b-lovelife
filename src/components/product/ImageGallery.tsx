import { memo, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageGalleryProps {
  variants: any[];
  product: any;
  selectedImageIndex: number;
  onImageIndexChange: (index: number) => void;
}

const ImageGallery = memo(({ variants, product, selectedImageIndex, onImageIndexChange }: ImageGalleryProps) => {
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
  
  const currentImage = allImages[selectedImageIndex];
  const displayImage = currentImage?.url || product?.image || "/placeholder.svg";
  const imageCount = allImages.length;

  const handlePrevious = useCallback(() => {
    if (imageCount <= 1) return;
    const newIndex = selectedImageIndex > 0 ? selectedImageIndex - 1 : imageCount - 1;
    onImageIndexChange(newIndex);
  }, [selectedImageIndex, imageCount, onImageIndexChange]);

  const handleNext = useCallback(() => {
    if (imageCount <= 1) return;
    const newIndex = (selectedImageIndex + 1) % imageCount;
    onImageIndexChange(newIndex);
  }, [selectedImageIndex, imageCount, onImageIndexChange]);

  return (
    <>
      <img
        src={displayImage}
        alt={currentImage?.alt || product?.name || "Producto"}
        className="absolute inset-0 h-full w-full object-contain"
        loading="lazy"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          if (target.src !== "/placeholder.svg") {
            target.src = "/placeholder.svg";
          }
        }}
      />
      {/* Viral badge */}
      {product?.viral && (
        <img
          src="/lovable-uploads/984b614e-1f6b-484a-8b88-5c741374625b.png"
          alt="Viral ahora"
          className="absolute left-3 top-3 h-8 w-auto select-none"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
      )}
      {/* Contador */}
      <span className="absolute top-3 right-3 rounded-full bg-black/50 text-white text-xs px-2 py-1">
        {Math.max(1, selectedImageIndex + 1)} de {Math.max(1, imageCount)}
      </span>
      {/* Variant indicator */}
      {currentImage && (
        <span className="absolute bottom-3 left-3 rounded-full bg-black/70 text-white text-xs px-3 py-1">
          {currentImage.variantName}
        </span>
      )}
      {/* Navigation arrows */}
      {imageCount > 1 && (
        <>
          <button 
            className="absolute left-3 top-1/2 -translate-y-1/2 grid size-10 place-items-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors" 
            aria-label="Imagen anterior"
            onClick={handlePrevious}
            type="button"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            className="absolute right-3 top-1/2 -translate-y-1/2 grid size-10 place-items-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors" 
            aria-label="Siguiente imagen"
            onClick={handleNext}
            type="button"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}
    </>
  );
});

ImageGallery.displayName = "ImageGallery";

export default ImageGallery;