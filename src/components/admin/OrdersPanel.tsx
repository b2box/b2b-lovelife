
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Order = {
  id: string;
  status: string;
  total: number;
  created_at: string;
};

async function fetchOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("id,status,total,created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data as Order[];
}

const OrdersPanel: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: fetchOrders,
  });

  return (
    <Card className="p-4 md:p-6">
      <h2 className="text-xl font-semibold mb-4">Pedidos</h2>
      {isLoading && <p>Cargando…</p>}
      {error && <p className="text-destructive">Error al cargar pedidos.</p>}
      {!isLoading && data && (
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs">{o.id}</TableCell>
                  <TableCell className="capitalize">{o.status}</TableCell>
                  <TableCell>${Number(o.total).toFixed(2)}</TableCell>
                  <TableCell>{new Date(o.created_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
};

export default OrdersPanel;

