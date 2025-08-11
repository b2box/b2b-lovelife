
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
      product_variants!inner(
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
      const { data, error } = await supabase
        .from("products")
        .insert({
          name: `${product.name} (Copia)`,
          brand: product.brand,
          description: product.description,
          status: 'draft',
          subtitle: product.subtitle,
          material: product.material,
          discountable: product.discountable,
          supplier_link: product.supplier_link,
          supplier_model: product.supplier_model,
          type: product.type,
          collection: product.collection,
          active: false,
        })
        .select("id")
        .maybeSingle();
      
      if (error) throw error;
      toast({ title: "Duplicado", description: "Producto duplicado correctamente." });
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

