
import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Copy, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import ProductEditor from "./ProductEditor";

type Product = {
  id: string;
  name: string;
  slug: string | null;
  brand: string | null;
  description: string | null;
  status: string | null;
  subtitle: string | null;
  bx_code: string | null;
  verified_product: boolean;
  verified_video: boolean;
  material: string | null;
  discountable: boolean;
  agent_profile_id: string | null;
  supplier_link: string | null;
  supplier_model: string | null;
  type: string | null;
  collection: string | null;
  active: boolean;
  product_variants?: {
    id: string;
    product_variant_images: { url: string; sort_order: number }[];
  }[];
};

async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(`
      id,name,slug,brand,description,status,subtitle,bx_code,verified_product,verified_video,
      material,discountable,agent_profile_id,supplier_link,supplier_model,type,collection,active,
      product_variants(
        id,
        product_variant_images(url, sort_order)
      )
    `)
    .order("updated_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data as unknown as Product[];
}


const ProductsPanel: React.FC = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Product | null>(null);
  const [deleteText, setDeleteText] = React.useState("");
  const [randomCode] = React.useState(() => Math.random().toString(36).substring(2, 8).toUpperCase());

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: fetchProducts,
  });


  const duplicateProduct = async (product: Product) => {
    try {
      // 1. Obtener el producto completo con todas sus variantes e imágenes
      const { data: fullProduct, error: fetchError } = await supabase
        .from("products")
        .select(`
          *,
          product_variants(
            *,
            product_variant_images(*)
          )
        `)
        .eq("id", product.id)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (!fullProduct) throw new Error("Producto no encontrado");

      // Generar un nuevo BX_CODE único
      const timestamp = Date.now().toString().slice(-6);
      const newBxCode = fullProduct.bx_code ? `${fullProduct.bx_code}_${timestamp}` : null;

      // 2. Duplicar el producto padre
      const { data: newProduct, error: productError } = await supabase
        .from("products")
        .insert({
          name: `${fullProduct.name} (Copia)`,
          brand: fullProduct.brand,
          description: fullProduct.description,
          status: 'draft',
          subtitle: fullProduct.subtitle,
          material: fullProduct.material,
          discountable: fullProduct.discountable,
          supplier_link: fullProduct.supplier_link,
          supplier_model: fullProduct.supplier_model,
          type: fullProduct.type,
          collection: fullProduct.collection,
          active: false,
          bx_code: newBxCode,
          verified_product: false,
          verified_video: false,
          agent_profile_id: fullProduct.agent_profile_id,
          video_url: fullProduct.video_url,
        })
        .select("id")
        .maybeSingle();
      
      if (productError) throw productError;
      if (!newProduct) throw new Error("Error al crear el producto duplicado");

      // 3. Duplicar las variantes si existen
      if (fullProduct.product_variants && fullProduct.product_variants.length > 0) {
        for (const variant of fullProduct.product_variants) {
          const { data: newVariant, error: variantError } = await supabase
            .from("product_variants")
            .insert({
              product_id: newProduct.id,
              name: variant.name,
              sku: variant.sku,
              price: variant.price,
              currency: variant.currency,
              stock: 0, // Reset stock for duplicated variants
              active: variant.active,
              attributes: variant.attributes,
              sort_order: variant.sort_order,
              option_name: variant.option_name,
              is_clothing: variant.is_clothing,
              length_cm: variant.length_cm,
              width_cm: variant.width_cm,
              height_cm: variant.height_cm,
              weight_kg: variant.weight_kg,
              box_length_cm: variant.box_length_cm,
              box_width_cm: variant.box_width_cm,
              box_height_cm: variant.box_height_cm,
              box_weight_kg: variant.box_weight_kg,
              pcs_per_carton: variant.pcs_per_carton,
              cbm_per_carton: variant.cbm_per_carton,
              has_battery: variant.has_battery,
              has_individual_packaging: (variant as any).has_individual_packaging || false,
              individual_packaging_price_cny: (variant as any).individual_packaging_price_cny || null,
              individual_packaging_required: (variant as any).individual_packaging_required || false,
            })
            .select("id")
            .maybeSingle();

          if (variantError) throw variantError;
          if (!newVariant) throw new Error("Error al crear la variante duplicada");

          // 4. Duplicar las imágenes de la variante si existen
          if (variant.product_variant_images && variant.product_variant_images.length > 0) {
            const variantImages = variant.product_variant_images.map(img => ({
              product_variant_id: newVariant.id,
              url: img.url,
              alt: img.alt,
              sort_order: img.sort_order,
            }));

            const { error: imagesError } = await supabase
              .from("product_variant_images")
              .insert(variantImages);

            if (imagesError) throw imagesError;
          }
        }
      }

      toast({ title: "Duplicado", description: "Producto y variantes duplicados correctamente." });
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "No se pudo duplicar el producto.", variant: "destructive" });
    }
  };

  const deleteProduct = async (product: Product) => {
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id);
      
      if (error) throw error;
      toast({ title: "Eliminado", description: "Producto eliminado correctamente." });
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      setDeleteText("");
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "No se pudo eliminar el producto.", variant: "destructive" });
    }
  };

  return (
    <Card className="p-4 md:p-6 card-glass">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Productos</h2>
        <Button size="sm" variant="secondary" onClick={() => { setSelected(null); setEditorOpen(true); }}>Nuevo</Button>
      </div>
      {isLoading && <p>Cargando…</p>}
      {error && <p className="text-destructive">Error al cargar productos.</p>}
      {!isLoading && data && (
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thumbnail</TableHead>
                <TableHead>BX CODE</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    {(() => {
                      // Get first variant's first image
                      const firstVariant = (p.product_variants ?? [])[0];
                      const img = firstVariant 
                        ? (firstVariant.product_variant_images ?? []).sort((a, b) => a.sort_order - b.sort_order)[0]
                        : null;
                      return img ? (
                        <img
                          src={img.url}
                          alt={`Miniatura de ${p.name}`}
                          className="h-12 w-12 rounded-md object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center" aria-label="Sin imagen">
                          <span className="text-xs text-muted-foreground">Sin imagen</span>
                        </div>
                      );
                    })()}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{p.bx_code ?? "-"}</TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => { setSelected(p as any); setEditorOpen(true); }}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => duplicateProduct(p)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Eliminar Producto</AlertDialogTitle>
                          <AlertDialogDescription>
                            Para confirmar, escribe: <strong>{randomCode}</strong>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <Input 
                          value={deleteText} 
                          onChange={(e) => setDeleteText(e.target.value)} 
                          placeholder={`Escribe ${randomCode}`} 
                        />
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setDeleteText("")}>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            disabled={deleteText !== randomCode}
                            onClick={() => deleteProduct(p)}
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <ProductEditor
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSaved={() => { setEditorOpen(false); qc.invalidateQueries({ queryKey: ["admin", "products"] }); }}
        product={selected as any}
      />
    </Card>
  );
};

export default ProductsPanel;

