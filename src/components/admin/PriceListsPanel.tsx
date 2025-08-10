
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type PriceTier = {
  id: string;
  product_id: string;
  tier: string;
  min_qty: number;
  unit_price: number;
  currency: string;
};

async function fetchPriceTiers(): Promise<PriceTier[]> {
  const { data, error } = await supabase
    .from("product_price_tiers")
    .select("id,product_id,tier,min_qty,unit_price,currency")
    .order("product_id", { ascending: true })
    .limit(200);
  if (error) throw error;
  return data as PriceTier[];
}

const PriceListsPanel: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "price_tiers"],
    queryFn: fetchPriceTiers,
  });

  return (
    <Card className="p-4 md:p-6">
      <h2 className="text-xl font-semibold mb-4">Listas de precios (por producto)</h2>
      {isLoading && <p>Cargando…</p>}
      {error && <p className="text-destructive">Error al cargar listas de precios.</p>}
      {!isLoading && data && (
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Mín. Cantidad</TableHead>
                <TableHead>Precio Unidad</TableHead>
                <TableHead>Moneda</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono text-xs">{t.id}</TableCell>
                  <TableCell className="font-mono text-xs">{t.product_id}</TableCell>
                  <TableCell>{t.tier}</TableCell>
                  <TableCell>{t.min_qty}</TableCell>
                  <TableCell>{Number(t.unit_price).toFixed(2)}</TableCell>
                  <TableCell>{t.currency}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
};

export default PriceListsPanel;

