
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";

type Product = {
  id: string;
  name: string;
  active: boolean;
  updated_at: string;
};

async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("id,name,active,updated_at")
    .order("updated_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data as Product[];
}

async function toggleActive(id: string, active: boolean) {
  const { error } = await supabase.from("products").update({ active }).eq("id", id);
  if (error) throw error;
}

const ProductsPanel: React.FC = () => {
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: fetchProducts,
  });

  const mutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => toggleActive(id, active),
    meta: {
      onError: (err: unknown) => {
        console.error("[ProductsPanel] toggleActive error", err);
        toast({
          title: "Error",
          description: "No se pudo actualizar el estado del producto.",
          variant: "destructive",
        });
      },
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      toast({ title: "Actualizado", description: "Estado del producto actualizado." });
    },
  });

  return (
    <Card className="p-4 md:p-6">
      <h2 className="text-xl font-semibold mb-4">Productos</h2>
      {isLoading && <p>Cargando…</p>}
      {error && <p className="text-destructive">Error al cargar productos.</p>}
      {!isLoading && data && (
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Activo</TableHead>
                <TableHead>Actualizado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs">{p.id}</TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.active ? "Sí" : "No"}</TableCell>
                  <TableCell>{new Date(p.updated_at).toLocaleString()}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant={p.active ? "outline" : "brand"}
                      onClick={() => mutation.mutate({ id: p.id, active: !p.active })}
                    >
                      {p.active ? "Desactivar" : "Activar"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
};

export default ProductsPanel;

