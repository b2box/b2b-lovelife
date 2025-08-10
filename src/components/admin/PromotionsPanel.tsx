
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";

type Promotion = {
  id: string;
  name: string;
  description: string | null;
  type: "percentage" | "fixed";
  value: number;
  active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
};

async function fetchPromotions(): Promise<Promotion[]> {
  const { data, error } = await supabase
    .from("promotions")
    .select("id,name,description,type,value,active,starts_at,ends_at,created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data as Promotion[];
}

type CreatePromo = {
  name: string;
  description?: string;
  type: "percentage" | "fixed";
  value: number;
  active: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
};

async function createPromotion(payload: CreatePromo) {
  const { error } = await supabase.from("promotions").insert(payload as any);
  if (error) throw error;
}

const PromotionsPanel: React.FC = () => {
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "promotions"],
    queryFn: fetchPromotions,
  });

  const [form, setForm] = useState<CreatePromo>({
    name: "",
    description: "",
    type: "percentage",
    value: 0,
    active: true,
    starts_at: "",
    ends_at: "",
  });

  const mutation = useMutation({
    mutationFn: createPromotion,
    meta: {
      onError: (err: unknown) => {
        console.error("[PromotionsPanel] createPromotion error", err);
        toast({
          title: "Error",
          description: "No se pudo crear la promoción.",
          variant: "destructive",
        });
      },
    },
    onSuccess: () => {
      toast({ title: "Promoción creada", description: "La promoción fue creada con éxito." });
      qc.invalidateQueries({ queryKey: ["admin", "promotions"] });
      setForm({
        name: "",
        description: "",
        type: "percentage",
        value: 0,
        active: true,
        starts_at: "",
        ends_at: "",
      });
    },
  });

  const submit = () => {
    const payload: CreatePromo = {
      ...form,
      value: Number(form.value),
      starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
      ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
    };
    mutation.mutate(payload);
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-4 md:p-6">
        <h2 className="text-xl font-semibold mb-4">Crear promoción</h2>
        <div className="grid gap-3 md:grid-cols-6">
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Nombre</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium">Tipo</label>
            <select
              className="w-full h-10 rounded-md border bg-background px-3 text-sm"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as CreatePromo["type"] })}
            >
              <option value="percentage">% Porcentaje</option>
              <option value="fixed">Monto fijo</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Valor</label>
            <Input
              type="number"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Activa</label>
            <select
              className="w-full h-10 rounded-md border bg-background px-3 text-sm"
              value={form.active ? "true" : "false"}
              onChange={(e) => setForm({ ...form, active: e.target.value === "true" })}
            >
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Inicio</label>
            <Input
              type="datetime-local"
              value={form.starts_at || ""}
              onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Fin</label>
            <Input
              type="datetime-local"
              value={form.ends_at || ""}
              onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
            />
          </div>
          <div className="md:col-span-6">
            <label className="text-sm font-medium">Descripción</label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="md:col-span-6">
            <Button onClick={submit} className="w-full md:w-auto">
              Crear promoción
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-4 md:p-6">
        <h3 className="text-lg font-semibold mb-3">Promociones recientes</h3>
        {isLoading && <p>Cargando…</p>}
        {error && <p className="text-destructive">Error al cargar promociones.</p>}
        {!isLoading && data && (
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Activa</TableHead>
                  <TableHead>Inicio</TableHead>
                  <TableHead>Fin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs">{p.id}</TableCell>
                    <TableCell>{p.name}</TableCell>
                    <TableCell>{p.type}</TableCell>
                    <TableCell>{Number(p.value)}</TableCell>
                    <TableCell>{p.active ? "Sí" : "No"}</TableCell>
                    <TableCell>{p.starts_at ? new Date(p.starts_at).toLocaleString() : "—"}</TableCell>
                    <TableCell>{p.ends_at ? new Date(p.ends_at).toLocaleString() : "—"}</TableCell>
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

export default PromotionsPanel;

