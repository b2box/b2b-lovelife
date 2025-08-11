import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Package2, DollarSign, Ruler, ImageIcon, Settings } from "lucide-react";
import { VariantPricingEditor } from "./VariantPricingEditor";
import { VariantImages } from "./VariantImages";
import type { AdminVariant } from "./DraggableVariantsEditor";

interface VariantEditorProps {
  variant: AdminVariant | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

type SupplierTier = {
  tier: "inicial" | "mayorista" | "distribuidor";
  min_qty: number;
  unit_price: number;
};

export const VariantEditor: React.FC<VariantEditorProps> = ({
  variant,
  isOpen,
  onClose,
  onSave,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [form, setForm] = useState({
    name: "",
    sku: "",
    active: true,
    // Product dimensions
    length_cm: 0,
    width_cm: 0,
    height_cm: 0,
    weight_kg: 0,
    // Box dimensions
    box_length_cm: 0,
    box_width_cm: 0,
    box_height_cm: 0,
    box_weight_kg: 0,
    pcs_per_carton: 1,
    cbm_per_carton: 0,
    // Properties
    is_clothing: false,
    has_battery: false,
    // Individual packaging
    has_individual_packaging: true,
    individual_packaging_price_cny: null as number | null,
    individual_packaging_required: false,
  });

  const [initialForm, setInitialForm] = useState(form);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Supplier pricing (base tiers in CNY)
  const [supplierTiers, setSupplierTiers] = useState<SupplierTier[]>([
    { tier: "inicial", min_qty: 1, unit_price: 0 },
    { tier: "mayorista", min_qty: 50, unit_price: 0 },
    { tier: "distribuidor", min_qty: 100, unit_price: 0 },
  ]);

  useEffect(() => {
    if (variant) {
      const currentForm = {
        name: variant.name || "",
        sku: variant.sku || "",
        active: variant.active,
        length_cm: variant.length_cm || 0,
        width_cm: variant.width_cm || 0,
        height_cm: variant.height_cm || 0,
        weight_kg: variant.weight_kg || 0,
        box_length_cm: variant.box_length_cm || 0,
        box_width_cm: variant.box_width_cm || 0,
        box_height_cm: variant.box_height_cm || 0,
        box_weight_kg: variant.box_weight_kg || 0,
        pcs_per_carton: variant.pcs_per_carton || 1,
        cbm_per_carton: variant.cbm_per_carton || 0,
        is_clothing: variant.is_clothing || false,
        has_battery: variant.has_battery || false,
        has_individual_packaging: variant.has_individual_packaging ?? true,
        individual_packaging_price_cny: variant.individual_packaging_price_cny || null,
        individual_packaging_required: variant.individual_packaging_required || false,
      };
      
      setForm(currentForm);
      setInitialForm(currentForm);
      setHasUnsavedChanges(false);
      loadSupplierPricing();
    }
  }, [variant]);

  // Track changes for unsaved warning
  useEffect(() => {
    if (!variant) return;
    
    const hasChanges = JSON.stringify(form) !== JSON.stringify(initialForm);
    setHasUnsavedChanges(hasChanges);
  }, [form, initialForm, variant]);

  // Handle close with unsaved changes warning
  const handleClose = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        "Tienes cambios sin guardar. ¿Estás seguro de que quieres cerrar sin guardar?"
      );
      if (!confirmed) return;
    }
    onClose();
  };

  const loadSupplierPricing = async () => {
    if (!variant?.id) return;
    
    setLoading(true);
    try {
      const { data: tiers } = await supabase
        .from("variant_price_tiers")
        .select("*")
        .eq("product_variant_id", variant.id)
        .eq("currency", "CNY"); // Base supplier pricing is in CNY

      if (tiers && tiers.length > 0) {
        const newSupplierTiers = [...supplierTiers];
        tiers.forEach((tier) => {
          const tierIndex = ["inicial", "mayorista", "distribuidor"].indexOf(tier.tier);
          if (tierIndex >= 0) {
            newSupplierTiers[tierIndex] = {
              tier: tier.tier as "inicial" | "mayorista" | "distribuidor",
              min_qty: tier.min_qty,
              unit_price: Number(tier.unit_price),
            };
          }
        });
        setSupplierTiers(newSupplierTiers);
      }
    } catch (error) {
      console.error("Error loading supplier pricing:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveVariant = async () => {
    if (!variant?.id) return;
    
    setSaving(true);
    try {
      // Save variant basic info
      const { error: variantError } = await supabase
        .from("product_variants")
        .update({
          name: form.name,
          sku: form.sku,
          active: form.active,
          length_cm: form.length_cm || null,
          width_cm: form.width_cm || null,
          height_cm: form.height_cm || null,
          weight_kg: form.weight_kg || null,
          box_length_cm: form.box_length_cm || null,
          box_width_cm: form.box_width_cm || null,
          box_height_cm: form.box_height_cm || null,
          box_weight_kg: form.box_weight_kg || null,
          pcs_per_carton: form.pcs_per_carton || null,
          cbm_per_carton: form.cbm_per_carton || null,
          is_clothing: form.is_clothing,
          has_battery: form.has_battery,
          has_individual_packaging: form.has_individual_packaging,
          individual_packaging_price_cny: form.individual_packaging_price_cny,
          individual_packaging_required: form.individual_packaging_required,
          updated_at: new Date().toISOString(),
        })
        .eq("id", variant.id);

      if (variantError) throw variantError;

      // Save supplier pricing (CNY base prices)
      await supabase
        .from("variant_price_tiers")
        .delete()
        .eq("product_variant_id", variant.id)
        .eq("currency", "CNY");

      const supplierTiersToInsert = supplierTiers
        .filter(tier => tier.unit_price > 0)
        .map(tier => ({
          product_variant_id: variant.id,
          tier: tier.tier,
          min_qty: tier.min_qty,
          unit_price: tier.unit_price,
          currency: "CNY",
        }));

      if (supplierTiersToInsert.length > 0) {
        const { error: tiersError } = await supabase
          .from("variant_price_tiers")
          .insert(supplierTiersToInsert);

        if (tiersError) throw tiersError;
      }

      toast({
        title: "Guardado",
        description: "Variante actualizada correctamente",
      });

      onSave();
      // Don't close the editor after saving
    } catch (error) {
      console.error("Error saving variant:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la variante",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSupplierTier = (index: number, field: keyof SupplierTier, value: number) => {
    const newTiers = [...supplierTiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    setSupplierTiers(newTiers);
  };

  const saveSupplierPricing = async () => {
    if (!variant?.id) return;
    
    setSaving(true);
    try {
      // Save supplier pricing (CNY base prices)
      await supabase
        .from("variant_price_tiers")
        .delete()
        .eq("product_variant_id", variant.id)
        .eq("currency", "CNY");

      const supplierTiersToInsert = supplierTiers
        .filter(tier => tier.unit_price > 0)
        .map(tier => ({
          product_variant_id: variant.id,
          tier: tier.tier,
          min_qty: tier.min_qty,
          unit_price: tier.unit_price,
          currency: "CNY",
        }));

      if (supplierTiersToInsert.length > 0) {
        const { error: tiersError } = await supabase
          .from("variant_price_tiers")
          .insert(supplierTiersToInsert);

        if (tiersError) throw tiersError;
      }

      toast({
        title: "Guardado",
        description: "Precios del supplier guardados correctamente",
      });

      // Trigger a refresh for the pricing tab
      onSave();
    } catch (error) {
      console.error("Error saving supplier pricing:", error);
      toast({
        title: "Error",
        description: "No se pudieron guardar los precios del supplier",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!variant) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Variante: {variant.name}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="info" className="gap-2">
              <Package2 size={16} />
              Info
            </TabsTrigger>
            <TabsTrigger value="supplier" className="gap-2">
              <DollarSign size={16} />
              Supplier
            </TabsTrigger>
            <TabsTrigger value="pricing" className="gap-2">
              <Settings size={16} />
              Pricing
            </TabsTrigger>
            <TabsTrigger value="dimensions" className="gap-2">
              <Ruler size={16} />
              Dimensiones
            </TabsTrigger>
            <TabsTrigger value="media" className="gap-2">
              <ImageIcon size={16} />
              Media
            </TabsTrigger>
          </TabsList>

          {/* Info básica */}
          <TabsContent value="info" className="space-y-4">
            <Card className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="variant-name">Nombre de la variante</Label>
                  <Input
                    id="variant-name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ej: Color Rojo"
                  />
                </div>
                <div>
                  <Label htmlFor="variant-sku">PA Code (SKU)</Label>
                  <Input
                    id="variant-sku"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    placeholder="Ej: PA-001-RED"
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="variant-active"
                    checked={form.active}
                    onCheckedChange={(checked) => setForm({ ...form, active: checked })}
                  />
                  <Label htmlFor="variant-active">Variante activa</Label>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is-clothing"
                    checked={form.is_clothing}
                    onCheckedChange={(checked) => setForm({ ...form, is_clothing: checked })}
                  />
                  <Label htmlFor="is-clothing">Es ropa</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="has-battery"
                    checked={form.has_battery}
                    onCheckedChange={(checked) => setForm({ ...form, has_battery: checked })}
                  />
                  <Label htmlFor="has-battery">Tiene batería</Label>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Supplier Pricing */}
          <TabsContent value="supplier" className="space-y-4">
            <Card className="p-4">
              <h4 className="font-medium mb-4">Precios Supplier (CNY)</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Configura los precios base del proveedor en CNY. Estos precios se usarán para calcular automáticamente los precios de venta en cada mercado.
              </p>
              <div className="space-y-4">
                {supplierTiers.map((tier, index) => (
                  <div key={tier.tier} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 border rounded">
                    <div>
                      <Label className="text-sm font-medium capitalize">{tier.tier}</Label>
                    </div>
                    <div>
                      <Label className="text-xs">Cantidad mínima</Label>
                      <Input
                        type="number"
                        value={tier.min_qty}
                        onChange={(e) => updateSupplierTier(index, "min_qty", Number(e.target.value))}
                        min="1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Precio unitario (CNY)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={tier.unit_price}
                        onChange={(e) => updateSupplierTier(index, "unit_price", Number(e.target.value))}
                        min="0"
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end mt-4">
                <Button 
                  onClick={saveSupplierPricing} 
                  disabled={saving}
                  variant="outline"
                >
                  {saving ? "Guardando..." : "Guardar Precios Supplier"}
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Pricing y Mercados */}
          <TabsContent value="pricing" className="space-y-4">
            {variant.id && (
              <VariantPricingEditor 
                variantId={variant.id} 
                onPricingUpdate={onSave}
              />
            )}
          </TabsContent>

          {/* Dimensiones */}
          <TabsContent value="dimensions" className="space-y-4">
            {/* a) Dimensiones del Producto */}
            <Card className="p-4">
              <h4 className="font-medium mb-4">a) Dimensiones del Producto</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="length">Largo (cm)</Label>
                  <Input
                    id="length"
                    type="number"
                    step="0.1"
                    value={form.length_cm}
                    onChange={(e) => setForm({ ...form, length_cm: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="width">Ancho (cm)</Label>
                  <Input
                    id="width"
                    type="number"
                    step="0.1"
                    value={form.width_cm}
                    onChange={(e) => setForm({ ...form, width_cm: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="height">Alto (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.1"
                    value={form.height_cm}
                    onChange={(e) => setForm({ ...form, height_cm: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Peso (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.01"
                    value={form.weight_kg}
                    onChange={(e) => setForm({ ...form, weight_kg: Number(e.target.value) })}
                  />
                </div>
              </div>
            </Card>

            {/* b) Dimensiones de la Caja */}
            <Card className="p-4">
              <h4 className="font-medium mb-4">b) Dimensiones de la Caja</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="box-length">Largo caja (cm)</Label>
                  <Input
                    id="box-length"
                    type="number"
                    step="0.1"
                    value={form.box_length_cm}
                    onChange={(e) => setForm({ ...form, box_length_cm: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="box-width">Ancho caja (cm)</Label>
                  <Input
                    id="box-width"
                    type="number"
                    step="0.1"
                    value={form.box_width_cm}
                    onChange={(e) => setForm({ ...form, box_width_cm: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="box-height">Alto caja (cm)</Label>
                  <Input
                    id="box-height"
                    type="number"
                    step="0.1"
                    value={form.box_height_cm}
                    onChange={(e) => setForm({ ...form, box_height_cm: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="box-weight">Peso caja (kg)</Label>
                  <Input
                    id="box-weight"
                    type="number"
                    step="0.01"
                    value={form.box_weight_kg}
                    onChange={(e) => setForm({ ...form, box_weight_kg: Number(e.target.value) })}
                  />
                </div>
              </div>
            </Card>

            {/* c) Packaging Master */}
            <Card className="p-4">
              <h4 className="font-medium mb-4">c) Packaging Master</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pcs-per-carton">Piezas por cartón (pcs/ctn)</Label>
                  <Input
                    id="pcs-per-carton"
                    type="number"
                    value={form.pcs_per_carton}
                    onChange={(e) => setForm({ ...form, pcs_per_carton: Number(e.target.value) })}
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="cbm-per-carton">CBM por cartón (cbm/ctn)</Label>
                  <Input
                    id="cbm-per-carton"
                    type="number"
                    step="0.001"
                    value={form.cbm_per_carton}
                    onChange={(e) => setForm({ ...form, cbm_per_carton: Number(e.target.value) })}
                  />
                </div>
              </div>
            </Card>

            {/* d) Individual Packaging */}
            <Card className="p-4">
              <h4 className="font-medium mb-4">d) Individual Packaging</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="has-individual-packaging"
                    checked={form.has_individual_packaging}
                    onCheckedChange={(checked) => setForm({ ...form, has_individual_packaging: checked })}
                  />
                  <Label htmlFor="has-individual-packaging">Tiene empaque individual</Label>
                </div>
                
                {!form.has_individual_packaging && (
                  <div className="space-y-4 pl-6 border-l-2 border-muted">
                    <div>
                      <Label htmlFor="individual-packaging-price">Precio empaque individual (CNY)</Label>
                      <Input
                        id="individual-packaging-price"
                        type="number"
                        step="0.01"
                        value={form.individual_packaging_price_cny || ''}
                        onChange={(e) => setForm({ ...form, individual_packaging_price_cny: Number(e.target.value) || null })}
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="individual-packaging-required"
                        checked={form.individual_packaging_required}
                        onCheckedChange={(checked) => setForm({ ...form, individual_packaging_required: checked })}
                      />
                      <Label htmlFor="individual-packaging-required">Empaque individual obligatorio</Label>
                    </div>
                    
                    {form.individual_packaging_required && (
                      <div className="text-sm text-muted-foreground p-2 bg-accent/50 rounded">
                        ⚠️ Este costo se sumará automáticamente al precio del proveedor en los cálculos de precios para el cliente.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Media */}
          <TabsContent value="media" className="space-y-4">
            {variant.id && (
              <VariantImages variantId={variant.id} />
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={saveVariant} disabled={saving}>
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};