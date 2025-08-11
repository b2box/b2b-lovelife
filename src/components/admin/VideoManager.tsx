import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Play, ExternalLink } from "lucide-react";

interface VideoManagerProps {
  productId: string;
  currentVideoUrl?: string | null;
  onVideoUpdate: (videoUrl: string | null) => void;
}

export const VideoManager: React.FC<VideoManagerProps> = ({
  productId,
  currentVideoUrl,
  onVideoUpdate,
}) => {
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("video/")) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo de video válido.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "El archivo de video no puede superar los 50MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileName = `${productId}/video_${Date.now()}.${file.name.split('.').pop()}`;
      
      const { data, error } = await supabase.storage
        .from("product-images")
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from("product-images")
        .getPublicUrl(data.path);

      onVideoUpdate(publicUrl);
      toast({
        title: "Video subido",
        description: "El video se ha subido correctamente.",
      });
    } catch (error) {
      console.error("Error uploading video:", error);
      toast({
        title: "Error",
        description: "No se pudo subir el video.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) return;
    onVideoUpdate(urlInput.trim());
    setUrlInput("");
    toast({
      title: "Video actualizado",
      description: "La URL del video se ha guardado.",
    });
  };

  const handleRemoveVideo = () => {
    onVideoUpdate(null);
    toast({
      title: "Video eliminado",
      description: "El video se ha removido del producto.",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Video del producto</Label>
        {currentVideoUrl && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemoveVideo}
            className="text-destructive hover:text-destructive"
          >
            <X className="h-4 w-4 mr-1" />
            Eliminar
          </Button>
        )}
      </div>

      {currentVideoUrl ? (
        <Card className="card-glass">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Play className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Video configurado</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => window.open(currentVideoUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Ver
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 truncate">
              {currentVideoUrl}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {/* File Upload */}
          <Card className="card-glass border-dashed">
            <CardContent className="p-4">
              <div className="text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <Label
                  htmlFor="video-upload"
                  className="cursor-pointer text-sm font-medium hover:text-primary"
                >
                  Subir archivo de video
                </Label>
                <Input
                  id="video-upload"
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  MP4, WebM, AVI (máx. 50MB)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* URL Input */}
          <div className="flex gap-2">
            <Input
              placeholder="O pega la URL del video..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
            />
            <Button
              type="button"
              onClick={handleUrlSubmit}
              disabled={!urlInput.trim()}
              variant="outline"
            >
              Agregar
            </Button>
          </div>
        </div>
      )}

      {uploading && (
        <p className="text-sm text-muted-foreground">Subiendo video...</p>
      )}
    </div>
  );
};