import { memo } from "react";

interface ImageGalleryProps {
  variants: any[];
  product: any;
  selectedImageIndex: number;
  onImageIndexChange: (index: number) => void;
}

const ImageGallery = memo(({ variants, product, selectedImageIndex, onImageIndexChange }: ImageGalleryProps) => {
  // Collect all images from all variants
  const allImages = variants.flatMap(variant => 
    (variant as any).product_variant_images?.map((img: any) => ({
      ...img,
      variantName: variant.name || product.name,
      variantId: variant.id
    })) || []
  ).sort((a, b) => a.sort_order - b.sort_order);
  
  const currentImage = allImages[selectedImageIndex];
  const displayImage = currentImage?.url || product.image;
  const imageCount = allImages.length;

  return (
    <>
      <img
        src={displayImage}
        alt={currentImage?.alt || product.name}
        className="absolute inset-0 h-full w-full object-contain"
        loading="lazy"
      />
      {/* Viral badge */}
      {product.viral && (
        <img
          src="/lovable-uploads/984b614e-1f6b-484a-8b88-5c741374625b.png"
          alt="Viral ahora"
          className="absolute left-3 top-3 h-8 w-auto select-none"
          loading="lazy"
        />
      )}
      {/* Contador y flecha */}
      <span className="absolute top-3 right-3 rounded-full bg-black/50 text-white text-xs px-2 py-1">
        {selectedImageIndex + 1} de {imageCount || 1}
      </span>
      {/* Variant indicator */}
      {currentImage && (
        <span className="absolute bottom-3 left-3 rounded-full bg-black/70 text-white text-xs px-3 py-1">
          {currentImage.variantName}
        </span>
      )}
      {imageCount > 1 && (
        <button 
          className="absolute right-3 top-1/2 -translate-y-1/2 grid size-10 place-items-center rounded-full bg-black/40 text-white hover:bg-black/60" 
          aria-label="Siguiente imagen"
          onClick={() => onImageIndexChange((selectedImageIndex + 1) % imageCount)}
        >
          ›
        </button>
      )}
    </>
  );
});

ImageGallery.displayName = "ImageGallery";

export default ImageGallery;