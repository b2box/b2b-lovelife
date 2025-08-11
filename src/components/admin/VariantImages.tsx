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

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (images.length + files.length > 8) {
      toast({
        title: "Error",
        description: "No puedes subir más de 8 imágenes por variante.",
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

        const fileName = `variants/${variantId}/image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${file.name.split('.').pop()}`;
        
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
            sort_order: images.length + newImages.length,
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
        description: `Se subieron ${newImages.length} imagen(es) correctamente.`,
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
      // Set all images to their current order + 1, then set selected to 0
      const updates = images.map((img, index) => ({
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
    const currentIndex = images.findIndex(img => img.id === imageId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= images.length) return;

    try {
      const newImages = [...images];
      [newImages[currentIndex], newImages[newIndex]] = [newImages[newIndex], newImages[currentIndex]];
      
      // Update sort_order for both images
      const updates = [
        { id: newImages[currentIndex].id, sort_order: currentIndex },
        { id: newImages[newIndex].id, sort_order: newIndex },
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

  if (loading) {
    return <div className="p-4 text-center">Cargando imágenes...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Upload section */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          Imágenes ({images.length}/8)
        </span>
        {images.length < 8 && (
          <>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
              id={`variant-upload-${variantId}`}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => document.getElementById(`variant-upload-${variantId}`)?.click()}
            >
              <Upload className="h-4 w-4 mr-1" />
              Subir
            </Button>
          </>
        )}
      </div>

      {images.length === 0 && !uploading && (
        <Card className="card-glass border-dashed">
          <CardContent className="p-8 text-center">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No hay imágenes para esta variante.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Images grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {images.map((image, index) => (
            <Card key={image.id} className="card-glass overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-square">
                  <img
                    src={image.url}
                    alt={image.alt || `Imagen ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Thumbnail indicator */}
                  {index === 0 && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <Star className="h-3 w-3" />
                    </div>
                  )}

                  {/* Actions overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => handleSetThumbnail(image.id)}
                      disabled={index === 0}
                    >
                      <Star className="h-3 w-3" />
                    </Button>
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
                      disabled={index === images.length - 1}
                    >
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemoveImage(image.id, image.url)}
                    >
                      <X className="h-3 w-3" />
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

      {uploading && (
        <p className="text-sm text-muted-foreground">Subiendo imágenes...</p>
      )}
    </div>
  );
};