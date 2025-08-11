import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ActivateProductButtonProps {
  productId: string;
  isActive: boolean;
  onUpdate: () => void;
}

export const ActivateProductButton = ({ productId, isActive, onUpdate }: ActivateProductButtonProps) => {
  const { toast } = useToast();
  
  const toggleProductStatus = async () => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ active: !isActive })
        .eq('id', productId);
        
      if (error) throw error;
      
      toast({
        title: "Éxito",
        description: `Producto ${!isActive ? 'activado' : 'desactivado'} correctamente`,
      });
      
      onUpdate();
    } catch (error) {
      console.error('Error updating product status:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el producto",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Button
      onClick={toggleProductStatus}
      variant={isActive ? "outline" : "default"}
      size="sm"
    >
      {isActive ? "Desactivar" : "Activar"}
    </Button>
  );
};