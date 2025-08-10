
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Profile = {
  id: string;
  display_name: string | null;
  created_at: string;
};

type CustomerTier = {
  profile_id: string;
  tier: string;
};

async function fetchProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id,display_name,created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data as Profile[];
}

async function fetchCustomerTiers(): Promise<CustomerTier[]> {
  const { data, error } = await supabase.from("customer_price_tiers").select("profile_id,tier");
  if (error) throw error;
  return (data ?? []) as CustomerTier[];
}

const CustomersPanel: React.FC = () => {
  const profilesQuery = useQuery({
    queryKey: ["admin", "profiles"],
    queryFn: fetchProfiles,
  });

  const tiersQuery = useQuery({
    queryKey: ["admin", "customer_price_tiers"],
    queryFn: fetchCustomerTiers,
  });

  const isLoading = profilesQuery.isLoading || tiersQuery.isLoading;
  const isError = profilesQuery.error || tiersQuery.error;

  const tiersMap = new Map<string, string>();
  (tiersQuery.data ?? []).forEach((t) => tiersMap.set(t.profile_id, t.tier));

  return (
    <Card className="p-4 md:p-6">
      <h2 className="text-xl font-semibold mb-4">Clientes</h2>
      {isLoading && <p>Cargando…</p>}
      {isError && <p className="text-destructive">Error al cargar clientes.</p>}
      {!isLoading && profilesQuery.data && (
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Tier de precio</TableHead>
                <TableHead>Alta</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profilesQuery.data.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs">{p.id}</TableCell>
                  <TableCell>{p.display_name ?? "-"}</TableCell>
                  <TableCell>{tiersMap.get(p.id) ?? "—"}</TableCell>
                  <TableCell>{new Date(p.created_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <p className="text-xs text-muted-foreground mt-3">
        Nota: la asignación/edición de tiers puede añadirse aquí; por ahora se muestra en modo lectura.
      </p>
    </Card>
  );
};

export default CustomersPanel;

