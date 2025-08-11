import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Package, Copy, GripVertical } from "lucide-react";
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
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export type AdminVariant = {
  id: string;
  product_id: string;
  name: string | null;
  sku: string | null;
  price: number | null;
  stock: number;
  active: boolean;
  created_at: string;
  updated_at: string;
  currency: string;
  sort_order: number;
  option_name?: string | null;
  attributes?: any;
  length_cm?: number | null;
  width_cm?: number | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  box_length_cm?: number | null;
  box_width_cm?: number | null;
  box_height_cm?: number | null;
  box_weight_kg?: number | null;
  pcs_per_carton?: number | null;
  cbm_per_carton?: number | null;
  is_clothing?: boolean;
  has_battery?: boolean;
};

interface SortableVariantRowProps {
  variant: AdminVariant;
  onEdit: (variant: AdminVariant) => void;
  onToggleActive: (id: string, active: boolean) => void;
  onDuplicate: (variant: AdminVariant) => void;
}

const SortableVariantRow: React.FC<SortableVariantRowProps> = ({
  variant,
  onEdit,
  onToggleActive,
  onDuplicate,
}) => {
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: variant.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  useEffect(() => {
    const loadThumbnail = async () => {
      const { data } = await supabase
        .from("product_variant_images")
        .select("url")
        .eq("product_variant_id", variant.id)
        .order("sort_order", { ascending: true })
        .limit(1)
        .maybeSingle();
      setThumbnail(data?.url || null);
    };
    loadThumbnail();
  }, [variant.id]);

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell>
        <div 
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted/50 transition-colors"
          title="Arrastra para reordenar"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      </TableCell>
      <TableCell>
        {thumbnail ? (
          <img 
            src={thumbnail} 
            alt="Thumbnail" 
            className="w-12 h-12 object-cover rounded border"
          />
        ) : (
          <div className="w-12 h-12 bg-muted rounded border flex items-center justify-center">
            <Package className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
      </TableCell>
      <TableCell>{variant.name ?? "-"}</TableCell>
      <TableCell>{variant.sku ?? "-"}</TableCell>
      <TableCell>
        <Switch 
          checked={!!variant.active} 
          onCheckedChange={(val) => onToggleActive(variant.id, !!val)} 
        />
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => onEdit(variant)}>
            Editar
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onDuplicate(variant)}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

interface DraggableVariantsEditorProps {
  productId: string;
  onVariantEdit: (variant: AdminVariant) => void;
}

export const DraggableVariantsEditor: React.FC<DraggableVariantsEditorProps> = ({
  productId,
  onVariantEdit,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [variants, setVariants] = useState<AdminVariant[]>([]);

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

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", productId)
      .order("sort_order", { ascending: true });
    setLoading(false);
    if (error) {
      console.error(error);
      toast({ title: "Error", description: "No se pudieron cargar variantes.", variant: "destructive" });
      return;
    }
    setVariants((data || []) as AdminVariant[]);
  };

  useEffect(() => {
    load();
  }, [productId]);

  const createVariant = async () => {
    // Get the next sort_order value
    const maxOrder = Math.max(...variants.map(v => v.sort_order), -1);
    
    const { data, error } = await supabase
      .from("product_variants")
      .insert({ 
        product_id: productId, 
        name: "Nueva variante", 
        currency: "USD", 
        stock: 0, 
        active: true,
        sort_order: maxOrder + 1
      })
      .select("*")
      .maybeSingle();
    if (error) {
      console.error(error);
      toast({ title: "Error", description: "No se pudo crear la variante.", variant: "destructive" });
      return;
    }
    if (data) {
      setVariants((v) => [...v, data as AdminVariant]);
      onVariantEdit(data as AdminVariant);
    }
  };

  const duplicateVariant = async (originalVariant: AdminVariant) => {
    // Get the next sort_order value
    const maxOrder = Math.max(...variants.map(v => v.sort_order), -1);

    const { data, error } = await supabase
      .from("product_variants")
      .insert({
        product_id: productId,
        name: `${originalVariant.name} (Copia)`,
        sku: originalVariant.sku ? `${originalVariant.sku}-copy` : null,
        currency: originalVariant.currency,
        stock: 0,
        active: false,
        price: originalVariant.price,
        attributes: originalVariant.attributes,
        length_cm: originalVariant.length_cm,
        width_cm: originalVariant.width_cm,
        height_cm: originalVariant.height_cm,
        weight_kg: originalVariant.weight_kg,
        box_length_cm: originalVariant.box_length_cm,
        box_width_cm: originalVariant.box_width_cm,
        box_height_cm: originalVariant.box_height_cm,
        box_weight_kg: originalVariant.box_weight_kg,
        pcs_per_carton: originalVariant.pcs_per_carton,
        cbm_per_carton: originalVariant.cbm_per_carton,
        is_clothing: originalVariant.is_clothing,
        has_battery: originalVariant.has_battery,
        sort_order: maxOrder + 1,
      })
      .select("*")
      .maybeSingle();
    
    if (error) {
      console.error(error);
      toast({ title: "Error", description: "No se pudo duplicar la variante.", variant: "destructive" });
      return;
    }
    
    if (data) {
      // Copy price tiers
      const { data: priceTiers } = await supabase
        .from("variant_price_tiers")
        .select("*")
        .eq("product_variant_id", originalVariant.id);
      
      if (priceTiers && priceTiers.length > 0) {
        const tiersToInsert = priceTiers.map(tier => ({
          product_variant_id: data.id,
          tier: tier.tier,
          min_qty: tier.min_qty,
          unit_price: tier.unit_price,
          currency: tier.currency,
        }));
        
        await supabase.from("variant_price_tiers").insert(tiersToInsert);
      }
      
      setVariants((v) => [...v, data as AdminVariant]);
      toast({ title: "Éxito", description: "Variante duplicada correctamente." });
    }
  };

  const toggleActive = async (id: string, val: boolean) => {
    const { error } = await supabase.from('product_variants').update({ active: val }).eq('id', id);
    if (error) {
      console.error(error);
      toast({ title: 'Error', description: 'No se pudo actualizar el estado.', variant: 'destructive' });
      return;
    }
    setVariants((prev) => prev.map((x) => (x.id === id ? { ...x, active: val } : x)));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = variants.findIndex((item) => item.id === active.id);
    const newIndex = variants.findIndex((item) => item.id === over.id);

    const newVariants = arrayMove(variants, oldIndex, newIndex);
    
    // Update sort_order for all variants
    const updatedVariants = newVariants.map((variant, index) => ({
      ...variant,
      sort_order: index,
    }));

    // Update local state immediately for smooth UX
    setVariants(updatedVariants);

    // Update database in background
    try {
      await Promise.all(
        updatedVariants.map((variant, index) => 
          supabase
            .from('product_variants')
            .update({ sort_order: index })
            .eq('id', variant.id)
        )
      );
      
      toast({
        title: "Orden actualizado",
        description: "El orden de las variantes se ha guardado.",
      });
    } catch (error) {
      console.error('Error updating variant order:', error);
      // Revert on error
      await load();
      toast({
        title: "Error",
        description: "No se pudo actualizar el orden de las variantes.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Variantes</h3>
        <Button size="sm" onClick={createVariant}>Agregar variante</Button>
      </div>
      {loading && <p>Cargando…</p>}
      {!loading && (
        <Card className="p-0 card-glass">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Orden</TableHead>
                  <TableHead className="w-[80px]">Imagen</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>PA Code</TableHead>
                  <TableHead className="w-[120px]">Activo</TableHead>
                  <TableHead className="w-[160px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <SortableContext
                  items={variants.map(v => v.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {variants.map((variant) => (
                    <SortableVariantRow
                      key={variant.id}
                      variant={variant}
                      onEdit={onVariantEdit}
                      onToggleActive={toggleActive}
                      onDuplicate={duplicateVariant}
                    />
                  ))}
                </SortableContext>
              </TableBody>
            </Table>
          </DndContext>
        </Card>
      )}
    </div>
  );
};