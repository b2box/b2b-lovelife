
import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
  product_images?: { url: string; sort_order: number }[];
};

async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("id,name,slug,brand,description,status,subtitle,bx_code,verified_product,verified_video,material,discountable,agent_profile_id,supplier_link,supplier_model,type,collection,active,product_images(url,sort_order)")
    .order("updated_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data as unknown as Product[];
}


const ProductsPanel: React.FC = () => {
  
  const qc = useQueryClient();
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Product | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: fetchProducts,
  });


  return (
    <Card className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Productos</h2>
        <Button size="sm" onClick={() => { setSelected(null); setEditorOpen(true); }}>Nuevo</Button>
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
                      const img = (p.product_images ?? []).sort((a, b) => a.sort_order - b.sort_order)[0];
                      return img ? (
                        <img
                          src={img.url}
                          alt={`Miniatura de ${p.name}`}
                          className="h-12 w-12 rounded-md object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-md bg-muted" aria-label="Sin imagen" />)
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

