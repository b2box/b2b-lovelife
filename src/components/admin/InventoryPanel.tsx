
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";

type Variant = {
  id: string;
  sku: string | null;
  name: string | null;
  stock: number;
};

async function fetchVariants(): Promise<Variant[]> {
  const { data, error } = await supabase
    .from("product_variants")
    .select("id,sku,name,stock")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data as Variant[];
}

type MovementForm = {
  product_variant_id: string;
  quantity: number;
  reason: "adjustment" | "purchase" | "sale" | "return";
  note?: string;
};

async function createMovement(payload: MovementForm) {
  const { error } = await supabase.from("inventory_movements").insert(payload);
  if (error) throw error;
}

const InventoryPanel: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "variants"],
    queryFn: fetchVariants,
  });
  const { toast } = useToast();
  const qc = useQueryClient();

  const [form, setForm] = useState<MovementForm>({
    product_variant_id: "",
    quantity: 0,
    reason: "adjustment",
    note: "",
  });

  const mutation = useMutation({
    mutationFn: createMovement,
    meta: {
      onError: (err: unknown) => {
        console.error("[InventoryPanel] createMovement error", err);
        toast({
          title: "Error",
          description: "No se pudo aplicar el movimiento de inventario.",
          variant: "destructive",
        });
      },
    },
    onSuccess: () => {
      toast({ title: "Inventario actualizado", description: "Movimiento aplicado." });
      qc.invalidateQueries({ queryKey: ["admin", "variants"] });
      setForm((f) => ({ ...f, quantity: 0, note: "" }));
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-4 md:p-6 card-glass">
        <h2 className="text-xl font-semibold mb-4">Inventario</h2>
        <div className="grid gap-3 md:grid-cols-5 items-end">
          <div className="md:col-span-2">
            <label className="text-sm font-medium">ID Variante</label>
            <Input
              placeholder="uuid de la variante"
              value={form.product_variant_id}
              onChange={(e) => setForm({ ...form, product_variant_id: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Cantidad</label>
            <Input
              type="number"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Motivo</label>
            <select
              className="w-full h-10 rounded-md border bg-background px-3 text-sm"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value as MovementForm["reason"] })}
            >
              <option value="adjustment">Ajuste</option>
              <option value="purchase">Compra</option>
              <option value="sale">Venta</option>
              <option value="return">Devolución</option>
            </select>
          </div>
          <div className="md:col-span-5">
            <label className="text-sm font-medium">Nota</label>
            <Textarea
              placeholder="Detalle del movimiento (opcional)"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
          </div>
          <div className="md:col-span-5">
            <Button onClick={() => mutation.mutate(form)} className="w-full md:w-auto">
              Aplicar movimiento
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-4 md:p-6 card-glass">
        <h3 className="text-lg font-semibold mb-3">Variantes recientes</h3>
        {isLoading && <p>Cargando…</p>}
        {error && <p className="text-destructive">Error al cargar variantes.</p>}
        {!isLoading && data && (
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-mono text-xs">{v.id}</TableCell>
                    <TableCell>{v.sku ?? "-"}</TableCell>
                    <TableCell>{v.name ?? "-"}</TableCell>
                    <TableCell>{v.stock}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default InventoryPanel;

