import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Star, ImageIcon, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export interface ImageItem {
  id: string;
  url: string;
  alt: string | null;
  sort_order: number;
}

interface ImageManagerProps {
  images: ImageItem[];
  onImagesUpdate: (images: ImageItem[]) => void;
  productId?: string;
  variantId?: string;
  maxImages?: number;
}

interface SortableImageProps {
  image: ImageItem;
  index: number;
  onSetThumbnail: (imageId: string) => void;
  onRemoveImage: (imageId: string) => void;
  onUpdateAlt: (imageId: string, alt: string) => void;
}

const SortableImage: React.FC<SortableImageProps> = ({
  image,
  index,
  onSetThumbnail,
  onRemoveImage,
  onUpdateAlt,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`card-glass overflow-hidden transition-all duration-200 ${
        isDragging ? 'scale-105 shadow-lg' : 'hover:scale-[1.02]'
      }`}
    >
      <CardContent className="p-0">
        <div className="relative aspect-square">
          {/* Drag handle - always visible */}
          <div
            {...attributes}
            {...listeners}
            className="absolute top-2 right-2 z-10 bg-black/70 text-white p-2 rounded-lg cursor-grab active:cursor-grabbing hover:bg-black/80 transition-colors"
            title="Arrastra para reordenar"
          >
            <GripVertical className="h-4 w-4" />
          </div>

          <img
            src={image.url}
            alt={image.alt || `Imagen ${index + 1}`}
            className="w-full h-full object-cover"
            draggable={false}
          />

          {/* Thumbnail indicator */}
          {index === 0 && (
            <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <Star className="h-3 w-3" />
              Principal
            </div>
          )}

          {/* Actions overlay - only on hover */}
          <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                onSetThumbnail(image.id);
              }}
              disabled={index === 0}
              title="Establecer como principal"
            >
              <Star className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveImage(image.id);
              }}
              title="Eliminar imagen"
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
            onChange={(e) => onUpdateAlt(image.id, e.target.value)}
            className="text-xs"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export const DraggableImageManager: React.FC<ImageManagerProps> = ({
  images,
  onImagesUpdate,
  productId,
  variantId,
  maxImages = 10,
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;

    if (images.length + files.length > maxImages) {
      toast({
        title: "Error",
        description: `No puedes subir más de ${maxImages} imágenes.`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const newImages: ImageItem[] = [];

      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          toast({
            title: "Error",
            description: `${file.name} no es un archivo de imagen válido.`,
            variant: "destructive",
          });
          continue;
        }

        const entityId = productId || variantId || 'temp';
        const fileName = `${entityId}/image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${file.name.split('.').pop()}`;

        const { data, error } = await supabase.storage
          .from("product-images")
          .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from("product-images")
          .getPublicUrl(data.path);

        newImages.push({
          id: `temp_${Date.now()}_${Math.random()}`,
          url: publicUrl,
          alt: file.name.split('.')[0],
          sort_order: images.length + newImages.length,
        });
      }

      onImagesUpdate([...images, ...newImages]);
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

  const handleInputFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    await handleFileUpload(files);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    await handleFileUpload(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleRemoveImage = (imageId: string) => {
    const newImages = images.filter(img => img.id !== imageId);
    // Update sort orders
    const updatedImages = newImages.map((img, index) => ({
      ...img,
      sort_order: index,
    }));
    onImagesUpdate(updatedImages);
  };

  const handleSetThumbnail = (imageId: string) => {
    const newImages = images.map((img, index) => ({
      ...img,
      sort_order: img.id === imageId ? 0 : index + 1,
    }));
    onImagesUpdate(newImages.sort((a, b) => a.sort_order - b.sort_order));
    toast({
      title: "Miniatura actualizada",
      description: "La imagen se ha establecido como miniatura principal.",
    });
  };

  const handleUpdateAlt = (imageId: string, alt: string) => {
    const newImages = images.map(img =>
      img.id === imageId ? { ...img, alt } : img
    );
    onImagesUpdate(newImages);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = images.findIndex((item) => item.id === active.id);
    const newIndex = images.findIndex((item) => item.id === over.id);

    const newImages = arrayMove(images, oldIndex, newIndex);
    
    // Update sort_order for all images
    const updatedImages = newImages.map((img, index) => ({
      ...img,
      sort_order: index,
    }));

    // Update local state immediately for smooth UX
    onImagesUpdate(updatedImages);

    // Update database in background
    try {
      await Promise.all(
        updatedImages.map((img, index) => 
          // Update in database if it's a real image (not temp)
          !img.id.startsWith('temp_') && 
          supabase
            .from(variantId ? 'product_variant_images' : 'product_images')
            .update({ sort_order: index })
            .eq('id', img.id)
        )
      );
      
      toast({
        title: "Orden actualizado",
        description: "El orden de las imágenes se ha guardado.",
      });
    } catch (error) {
      console.error('Error updating image order:', error);
      // Revert on error
      onImagesUpdate(images);
      toast({
        title: "Error",
        description: "No se pudo actualizar el orden de las imágenes.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">
          Imágenes ({images.length}/{maxImages})
        </Label>
        {images.length < maxImages && (
          <Label
            htmlFor="image-upload"
            className="cursor-pointer"
          >
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              asChild
            >
              <span>
                <Upload className="h-4 w-4 mr-1" />
                Subir
              </span>
            </Button>
          </Label>
        )}
      </div>

      <Input
        id="image-upload"
        type="file"
        accept="image/*"
        multiple
        onChange={handleInputFileUpload}
        disabled={uploading}
        className="hidden"
      />

      {images.length === 0 && !uploading && (
        <Card 
          className={`card-glass border-dashed transition-colors ${dragOver ? 'border-primary bg-primary/5' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <CardContent className="p-8 text-center">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Arrastra imágenes aquí o sube algunas para empezar.
            </p>
          </CardContent>
        </Card>
      )}

      {images.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={images.map(img => img.id)}
            strategy={rectSortingStrategy}
          >
            <div 
              className="grid grid-cols-2 md:grid-cols-3 gap-4"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {images.map((image, index) => (
                <SortableImage
                  key={image.id}
                  image={image}
                  index={index}
                  onSetThumbnail={handleSetThumbnail}
                  onRemoveImage={handleRemoveImage}
                  onUpdateAlt={handleUpdateAlt}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {uploading && (
        <p className="text-sm text-muted-foreground">Subiendo imágenes...</p>
      )}
    </div>
  );
};