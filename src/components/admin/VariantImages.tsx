import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Star, ArrowUp, ArrowDown, ImageIcon } from "lucide-react";

interface VariantImage {
  id: string;
  url: string;
  alt: string | null;
  sort_order: number;
  is_verified: boolean;
}

interface VariantImagesProps {
  variantId: string;
  onImagesChange?: () => void;
}

export const VariantImages: React.FC<VariantImagesProps> = ({
  variantId,
  onImagesChange,
}) => {
  const [images, setImages] = useState<VariantImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const loadImages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("product_variant_images")
        .select("*")
        .eq("product_variant_id", variantId)
        .order("is_verified", { ascending: true })
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error("Error loading variant images:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las imágenes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, [variantId]);

  const handleFileUpload = async (files: FileList | null, isVerified: boolean = false) => {
    if (!files || files.length === 0) return;

    const regularImages = images.filter(img => !img.is_verified);
    const verifiedImages = images.filter(img => img.is_verified);
    const targetSection = isVerified ? verifiedImages : regularImages;
    const sectionName = isVerified ? "verificadas" : "regulares";

    if (targetSection.length + files.length > 8) {
      toast({
        title: "Error",
        description: `No puedes subir más de 8 imágenes ${sectionName} por variante.`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const newImages: VariantImage[] = [];

      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          toast({
            title: "Error",
            description: `${file.name} no es un archivo de imagen válido.`,
            variant: "destructive",
          });
          continue;
        }

        const fileName = `variants/${variantId}/${isVerified ? 'verified' : 'regular'}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${file.name.split('.').pop()}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("product-images")
          .getPublicUrl(uploadData.path);

        const { data: imageData, error: insertError } = await supabase
          .from("product_variant_images")
          .insert({
            product_variant_id: variantId,
            url: publicUrl,
            alt: file.name.split('.')[0],
            sort_order: targetSection.length + newImages.length,
            is_verified: isVerified,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        newImages.push(imageData);
      }

      setImages(prev => [...prev, ...newImages]);
      onImagesChange?.();
      toast({
        title: "Imágenes subidas",
        description: `Se subieron ${newImages.length} imagen(es) ${sectionName} correctamente.`,
      });
    } catch (error) {
      console.error("Error uploading images:", error);
      toast({
        title: "Error",
        description: "No se pudieron subir las imágenes.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (imageId: string, imageUrl: string) => {
    try {
      const { error } = await supabase
        .from("product_variant_images")
        .delete()
        .eq("id", imageId);

      if (error) throw error;

      // Try to delete from storage (extract path from URL)
      const path = imageUrl.split('/').slice(-2).join('/');
      await supabase.storage.from("product-images").remove([path]);

      setImages(prev => prev.filter(img => img.id !== imageId));
      onImagesChange?.();
      toast({
        title: "Imagen eliminada",
        description: "La imagen se ha eliminado correctamente.",
      });
    } catch (error) {
      console.error("Error removing image:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la imagen.",
        variant: "destructive",
      });
    }
  };

  const handleSetThumbnail = async (imageId: string) => {
    try {
      const regularImages = images.filter(img => !img.is_verified);
      
      // Only regular images can be thumbnails
      const updates = regularImages.map((img, index) => ({
        id: img.id,
        sort_order: img.id === imageId ? 0 : index + 1,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from("product_variant_images")
          .update({ sort_order: update.sort_order })
          .eq("id", update.id);

        if (error) throw error;
      }

      await loadImages();
      onImagesChange?.();
      toast({
        title: "Miniatura actualizada",
        description: "La imagen se ha establecido como miniatura principal.",
      });
    } catch (error) {
      console.error("Error setting thumbnail:", error);
      toast({
        title: "Error",
        description: "No se pudo establecer la miniatura.",
        variant: "destructive",
      });
    }
  };

  const handleMoveImage = async (imageId: string, direction: 'up' | 'down') => {
    const image = images.find(img => img.id === imageId);
    if (!image) return;

    const sectionImages = images.filter(img => img.is_verified === image.is_verified);
    const currentIndex = sectionImages.findIndex(img => img.id === imageId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= sectionImages.length) return;

    try {
      const newSectionImages = [...sectionImages];
      [newSectionImages[currentIndex], newSectionImages[newIndex]] = [newSectionImages[newIndex], newSectionImages[currentIndex]];
      
      // Update sort_order for both images
      const updates = [
        { id: newSectionImages[currentIndex].id, sort_order: currentIndex },
        { id: newSectionImages[newIndex].id, sort_order: newIndex },
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from("product_variant_images")
          .update({ sort_order: update.sort_order })
          .eq("id", update.id);

        if (error) throw error;
      }

      await loadImages();
      onImagesChange?.();
    } catch (error) {
      console.error("Error moving image:", error);
      toast({
        title: "Error",
        description: "No se pudo mover la imagen.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateAlt = async (imageId: string, alt: string) => {
    try {
      const { error } = await supabase
        .from("product_variant_images")
        .update({ alt })
        .eq("id", imageId);

      if (error) throw error;

      setImages(prev => prev.map(img =>
        img.id === imageId ? { ...img, alt } : img
      ));
    } catch (error) {
      console.error("Error updating alt text:", error);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-primary');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-primary');
  };

  const handleDrop = (e: React.DragEvent, isVerified: boolean) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-primary');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files, isVerified);
    }
  };

  const renderImageSection = (sectionImages: VariantImage[], isVerified: boolean, title: string) => {
    const sectionId = isVerified ? 'verified' : 'regular';
    
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium">{title} ({sectionImages.length}/8)</h4>
          {sectionImages.length < 8 && (
            <>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileUpload(e.target.files, isVerified)}
                className="hidden"
                id={`variant-upload-${variantId}-${sectionId}`}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => document.getElementById(`variant-upload-${variantId}-${sectionId}`)?.click()}
              >
                <Upload className="h-4 w-4 mr-1" />
                Subir
              </Button>
            </>
          )}
        </div>

        {sectionImages.length === 0 && !uploading && (
          <div 
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center transition-colors"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, isVerified)}
          >
            <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              No hay imágenes {isVerified ? 'verificadas' : 'regulares'}.
            </p>
            <p className="text-xs text-muted-foreground">
              Arrastra imágenes aquí o usa el botón "Subir"
            </p>
          </div>
        )}

        {sectionImages.length > 0 && (
          <div 
            className="grid grid-cols-2 md:grid-cols-4 gap-3 min-h-[100px] border-2 border-dashed border-transparent rounded-lg p-2 transition-colors"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, isVerified)}
          >
            {sectionImages.map((image, index) => (
              <Card key={image.id} className="card-glass overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative aspect-square">
                    <img
                      src={image.url}
                      alt={image.alt || `Imagen ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Verified badge */}
                    {isVerified && (
                      <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        Verificado
                      </div>
                    )}
                    
                    {/* Thumbnail indicator for regular images only */}
                    {!isVerified && index === 0 && (
                      <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <Star className="h-3 w-3" />
                      </div>
                    )}

                    {/* Actions overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      {!isVerified && (
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => handleSetThumbnail(image.id)}
                          disabled={index === 0}
                        >
                          <Star className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => handleMoveImage(image.id, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => handleMoveImage(image.id, 'down')}
                        disabled={index === sectionImages.length - 1}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveImage(image.id, image.url)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Alt text input */}
                  <div className="p-2">
                    <Input
                      placeholder="Texto alternativo..."
                      value={image.alt || ""}
                      onChange={(e) => handleUpdateAlt(image.id, e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Card>
    );
  };

  if (loading) {
    return <div className="p-4 text-center">Cargando imágenes...</div>;
  }

  const regularImages = images.filter(img => !img.is_verified);
  const verifiedImages = images.filter(img => img.is_verified);

  return (
    <div className="space-y-6">
      {renderImageSection(regularImages, false, "Imágenes")}
      {renderImageSection(verifiedImages, true, "Verificado")}
      
      {uploading && (
        <p className="text-sm text-muted-foreground text-center">Subiendo imágenes...</p>
      )}
    </div>
  );
};