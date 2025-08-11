import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export type PricingSettings = {
  id?: string;
  ar_cny_to_usd: number; // Argentina prices use USD conversion from CNY
  co_cny_to_cop: number; // Colombia prices use COP conversion from CNY
  ar_tier1_pct: number;
  ar_tier2_pct: number;
  ar_tier3_pct: number;
  co_tier1_pct: number;
  co_tier2_pct: number;
  co_tier3_pct: number;
};

const defaults: PricingSettings = {
  ar_cny_to_usd: 1,
  co_cny_to_cop: 1,
  ar_tier1_pct: 300,
  ar_tier2_pct: 300,
  ar_tier3_pct: 300,
  co_tier1_pct: 200,
  co_tier2_pct: 200,
  co_tier3_pct: 200,
};

const SettingsPanel: React.FC = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<PricingSettings>(defaults);
  const [id, setId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from("pricing_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      setLoading(false);
      if (error) {
        console.error(error);
        toast({ title: "Error", description: "No se pudieron cargar los ajustes.", variant: "destructive" });
        return;
      }
      if (data) {
        setSettings({ ...defaults, ...data });
        setId(data.id);
      }
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      if (id) {
        const { error } = await (supabase as any)
          .from("pricing_settings")
          .update(settings)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { data, error } = await (supabase as any)
          .from("pricing_settings")
          .insert(settings)
          .select("id")
          .maybeSingle();
        if (error) throw error;
        setId(data?.id);
      }
      toast({ title: "Guardado", description: "Ajustes actualizados." });
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "No se pudieron guardar los ajustes.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="text-base font-semibold mb-3">Ajustes de precio</h3>
        {loading ? (
          <p>Cargando…</p>
        ) : (
          <div className="space-y-6">
            <section>
              <h4 className="text-sm font-medium mb-2">Tasas de cambio (aplican SIEMPRE)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>CNY → USD (Argentina)</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={settings.ar_cny_to_usd}
                    onChange={(e) => setSettings({ ...settings, ar_cny_to_usd: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>CNY → COP (Colombia)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={settings.co_cny_to_cop}
                    onChange={(e) => setSettings({ ...settings, co_cny_to_cop: Number(e.target.value) })}
                  />
                </div>
              </div>
            </section>

            <section>
              <h4 className="text-sm font-medium mb-2">Incremento % por defecto (solo para NUEVAS variantes)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-3">
                  <h5 className="text-sm font-medium mb-2">Argentina (AR)</h5>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label>Tier 1</Label>
                      <Input type="number" value={settings.ar_tier1_pct} onChange={(e) => setSettings({ ...settings, ar_tier1_pct: Number(e.target.value) })} />
                    </div>
                    <div>
                      <Label>Tier 2</Label>
                      <Input type="number" value={settings.ar_tier2_pct} onChange={(e) => setSettings({ ...settings, ar_tier2_pct: Number(e.target.value) })} />
                    </div>
                    <div>
                      <Label>Tier 3</Label>
                      <Input type="number" value={settings.ar_tier3_pct} onChange={(e) => setSettings({ ...settings, ar_tier3_pct: Number(e.target.value) })} />
                    </div>
                  </div>
                </Card>
                <Card className="p-3">
                  <h5 className="text-sm font-medium mb-2">Colombia (COL)</h5>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label>Tier 1</Label>
                      <Input type="number" value={settings.co_tier1_pct} onChange={(e) => setSettings({ ...settings, co_tier1_pct: Number(e.target.value) })} />
                    </div>
                    <div>
                      <Label>Tier 2</Label>
                      <Input type="number" value={settings.co_tier2_pct} onChange={(e) => setSettings({ ...settings, co_tier2_pct: Number(e.target.value) })} />
                    </div>
                    <div>
                      <Label>Tier 3</Label>
                      <Input type="number" value={settings.co_tier3_pct} onChange={(e) => setSettings({ ...settings, co_tier3_pct: Number(e.target.value) })} />
                    </div>
                  </div>
                </Card>
              </div>
            </section>

            <div className="flex justify-end">
              <Button onClick={save} disabled={saving}>{saving ? "Guardando…" : "Guardar ajustes"}</Button>
            </div>
          </div>
        )}
      </Card>

      <Card className="p-4">
        <p className="text-sm text-muted-foreground">
          Notas:
          <br />- Las tasas de cambio afectan todos los cálculos inmediatamente.
          <br />- Los porcentajes son usados como valores por defecto al crear nuevas variantes y no modifican variantes existentes.
        </p>
      </Card>
    </div>
  );
};

export default SettingsPanel;
