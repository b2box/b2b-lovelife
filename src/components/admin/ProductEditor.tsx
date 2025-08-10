import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export type AdminProduct = {
  id?: string;
  name: string;
  brand?: string | null;
  description?: string | null;
  slug?: string | null;
  active: boolean;
};

export type AdminVariant = {
  id: string;
  product_id: string;
  name: string | null;
  sku: string | null;
  active: boolean;
  price: number | null;
  currency: string;
  stock: number;
  option_name: string | null;
  length_cm: number | null;
  width_cm: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  box_length_cm: number | null;
  box_width_cm: number | null;
  box_height_cm: number | null;
  box_weight_kg: number | null;
  pcs_per_carton: number | null;
  cbm_per_carton: number | null;
  has_battery: boolean;
  is_clothing: boolean;
};

export type VariantPriceTier = {
  id: string;
  product_variant_id: string;
  tier: string;
  min_qty: number;
  currency: string;
  unit_price: number;
};

export type VariantImage = {
  id: string;
  product_variant_id: string;
  url: string;
  alt: string | null;
  sort_order: number;
};

interface ProductEditorProps {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
  product?: AdminProduct | null;
}

const ProductEditor: React.FC<ProductEditorProps> = ({ open, onClose, onSaved, product }) => {
  const isEdit = !!product?.id;
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<AdminProduct>({
    id: product?.id,
    name: product?.name || "",
    brand: product?.brand || "",
    description: product?.description || "",
    slug: product?.slug || "",
    active: product?.active ?? true,
  });

  useEffect(() => {
    setForm({
      id: product?.id,
      name: product?.name || "",
      brand: product?.brand || "",
      description: product?.description || "",
      slug: product?.slug || "",
      active: product?.active ?? true,
    });
  }, [product]);

  const saveProduct = async () => {
    try {
      setSaving(true);
      if (isEdit && form.id) {
        const { error } = await supabase
          .from("products")
          .update({
            name: form.name,
            brand: form.brand,
            description: form.description,
            slug: form.slug,
            active: form.active,
          })
          .eq("id", form.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("products")
          .insert({
            name: form.name,
            brand: form.brand,
            description: form.description,
            slug: form.slug,
            active: form.active,
          })
          .select("id")
          .maybeSingle();
        if (error) throw error;
        setForm((f) => ({ ...f, id: data?.id }));
      }
      toast({ title: "Guardado", description: "Producto guardado correctamente." });
      onSaved?.();
    } catch (e: any) {
      console.error("[ProductEditor] saveProduct", e);
      toast({ title: "Error", description: "No se pudo guardar el producto.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar producto" : "Nuevo producto"}</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="basicos" className="w-full">
          <TabsList>
            <TabsTrigger value="basicos">Básicos</TabsTrigger>
            {form.id && <TabsTrigger value="variantes">Variantes</TabsTrigger>}
          </TabsList>

          <TabsContent value="basicos" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="brand">Marca</Label>
                <Input id="brand" value={form.brand ?? ""} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea id="description" value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" value={form.slug ?? ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              </div>
              <div className="flex items-end">
                <Button type="button" variant={form.active ? "default" : "secondary"} onClick={() => setForm({ ...form, active: !form.active })}>
                  {form.active ? "Activo" : "Inactivo"}
                </Button>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>Cerrar</Button>
              <Button onClick={saveProduct} disabled={saving}>{saving ? "Guardando…" : "Guardar"}</Button>
            </div>
          </TabsContent>

          {form.id && (
            <TabsContent value="variantes">
              <VariantsEditor productId={form.id!} />
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ProductEditor;

/* -------------------------- Variants Editor --------------------------- */

const VariantsEditor: React.FC<{ productId: string }> = ({ productId }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [variants, setVariants] = useState<AdminVariant[]>([]);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: true });
    setLoading(false);
    if (error) {
      console.error(error);
      toast({ title: "Error", description: "No se pudieron cargar variantes.", variant: "destructive" });
      return;
    }
    setVariants((data || []) as any);
  };

  useEffect(() => {
    load();
  }, [productId]);

  const createVariant = async () => {
    const { data, error } = await supabase
      .from("product_variants")
      .insert({ product_id: productId, name: "Nueva variante", currency: "USD", stock: 0, active: true })
      .select("*")
      .maybeSingle();
    if (error) {
      console.error(error);
      toast({ title: "Error", description: "No se pudo crear la variante.", variant: "destructive" });
      return;
    }
    if (data) setVariants((v) => [...v, data as any]);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Variantes</h3>
        <Button size="sm" onClick={createVariant}>Agregar variante</Button>
      </div>
      {loading && <p>Cargando…</p>}
      {!loading && variants.length === 0 && <p>No hay variantes.</p>}
      <div className="space-y-4">
        {variants.map((v) => (
          <VariantCard key={v.id} variant={v} onChanged={load} />
        ))}
      </div>
    </div>
  );
};

const VariantCard: React.FC<{ variant: AdminVariant; onChanged: () => void }> = ({ variant, onChanged }) => {
  const { toast } = useToast();
  const [v, setV] = useState<AdminVariant>(variant);
  const [saving, setSaving] = useState(false);

  useEffect(() => setV(variant), [variant]);

  const save = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from("product_variants")
        .update({
          name: v.name,
          sku: v.sku,
          active: v.active,
          stock: v.stock,
          currency: v.currency,
          price: v.price,
          option_name: v.option_name,
          length_cm: v.length_cm,
          width_cm: v.width_cm,
          height_cm: v.height_cm,
          weight_kg: v.weight_kg,
          box_length_cm: v.box_length_cm,
          box_width_cm: v.box_width_cm,
          box_height_cm: v.box_height_cm,
          box_weight_kg: v.box_weight_kg,
          pcs_per_carton: v.pcs_per_carton,
          cbm_per_carton: v.cbm_per_carton,
          has_battery: v.has_battery,
          is_clothing: v.is_clothing,
        })
        .eq("id", v.id);
      if (error) throw error;
      toast({ title: "Variante actualizada" });
      onChanged();
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "No se pudo actualizar.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <Label>Título</Label>
          <Input value={v.name ?? ""} onChange={(e) => setV({ ...v, name: e.target.value })} />
        </div>
        <div>
          <Label>SKU</Label>
          <Input value={v.sku ?? ""} onChange={(e) => setV({ ...v, sku: e.target.value })} />
        </div>
        <div>
          <Label>Variante</Label>
          <Input value={v.option_name ?? ""} onChange={(e) => setV({ ...v, option_name: e.target.value })} />
        </div>
        <div className="flex items-end">
          <Button variant={v.active ? "default" : "secondary"} onClick={() => setV({ ...v, active: !v.active })}>
            {v.active ? "Activo" : "Inactivo"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-8 gap-3">
        <div>
          <Label>Largo (cm)</Label>
          <Input type="number" value={v.length_cm ?? 0} onChange={(e) => setV({ ...v, length_cm: Number(e.target.value) })} />
        </div>
        <div>
          <Label>Ancho (cm)</Label>
          <Input type="number" value={v.width_cm ?? 0} onChange={(e) => setV({ ...v, width_cm: Number(e.target.value) })} />
        </div>
        <div>
          <Label>Alto (cm)</Label>
          <Input type="number" value={v.height_cm ?? 0} onChange={(e) => setV({ ...v, height_cm: Number(e.target.value) })} />
        </div>
        <div>
          <Label>Peso (kg)</Label>
          <Input type="number" value={v.weight_kg ?? 0} onChange={(e) => setV({ ...v, weight_kg: Number(e.target.value) })} />
        </div>
        <div>
          <Label>Caja L (cm)</Label>
          <Input type="number" value={v.box_length_cm ?? 0} onChange={(e) => setV({ ...v, box_length_cm: Number(e.target.value) })} />
        </div>
        <div>
          <Label>Caja A (cm)</Label>
          <Input type="number" value={v.box_width_cm ?? 0} onChange={(e) => setV({ ...v, box_width_cm: Number(e.target.value) })} />
        </div>
        <div>
          <Label>Caja H (cm)</Label>
          <Input type="number" value={v.box_height_cm ?? 0} onChange={(e) => setV({ ...v, box_height_cm: Number(e.target.value) })} />
        </div>
        <div>
          <Label>Caja Peso (kg)</Label>
          <Input type="number" value={v.box_weight_kg ?? 0} onChange={(e) => setV({ ...v, box_weight_kg: Number(e.target.value) })} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <Label>PCS/CTN</Label>
          <Input type="number" value={v.pcs_per_carton ?? 0} onChange={(e) => setV({ ...v, pcs_per_carton: Number(e.target.value) })} />
        </div>
        <div>
          <Label>CBM/CTN</Label>
          <Input type="number" value={v.cbm_per_carton ?? 0} onChange={(e) => setV({ ...v, cbm_per_carton: Number(e.target.value) })} />
        </div>
        <div>
          <Label>Moneda</Label>
          <Input value={v.currency} onChange={(e) => setV({ ...v, currency: e.target.value })} />
        </div>
        <div>
          <Label>Precio base</Label>
          <Input type="number" value={v.price ?? 0} onChange={(e) => setV({ ...v, price: Number(e.target.value) })} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <Label>Batería</Label>
          <Button variant={v.has_battery ? "default" : "secondary"} onClick={() => setV({ ...v, has_battery: !v.has_battery })}>
            {v.has_battery ? "Sí" : "No"}
          </Button>
        </div>
        <div>
          <Label>Ropa</Label>
          <Button variant={v.is_clothing ? "default" : "secondary"} onClick={() => setV({ ...v, is_clothing: !v.is_clothing })}>
            {v.is_clothing ? "Sí" : "No"}
          </Button>
        </div>
        <div>
          <Label>Stock</Label>
          <Input type="number" value={v.stock} onChange={(e) => setV({ ...v, stock: Number(e.target.value) })} />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button onClick={save} disabled={saving}>{saving ? "Guardando…" : "Guardar Variante"}</Button>
      </div>

      <VariantTiers variantId={v.id} />
      <VariantImages variantId={v.id} />
    </Card>
  );
};

const VariantTiers: React.FC<{ variantId: string }> = ({ variantId }) => {
  const { toast } = useToast();
  const [rows, setRows] = useState<VariantPriceTier[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("variant_price_tiers")
      .select("*")
      .eq("product_variant_id", variantId)
      .order("min_qty", { ascending: true });
    setLoading(false);
    if (error) {
      console.error(error);
      toast({ title: "Error", description: "No se pudieron cargar precios.", variant: "destructive" });
      return;
    }
    setRows((data || []) as any);
  };

  useEffect(() => { load(); }, [variantId]);

  const addRow = async () => {
    const { data, error } = await (supabase as any)
      .from("variant_price_tiers")
      .insert({ product_variant_id: variantId, tier: 'inicial', min_qty: 1, currency: 'USD', unit_price: 0 })
      .select("*")
      .maybeSingle();
    if (error) {
      console.error(error);
      toast({ title: "Error", description: "No se pudo agregar el precio.", variant: "destructive" });
      return;
    }
    if (data) setRows((r) => [...r, data as any]);
  };

  const updateRow = async (row: VariantPriceTier) => {
    const { error } = await (supabase as any)
      .from("variant_price_tiers")
      .update({ tier: row.tier, min_qty: row.min_qty, currency: row.currency, unit_price: row.unit_price })
      .eq("id", row.id);
    if (error) {
      console.error(error);
      toast({ title: "Error", description: "No se pudo guardar el precio.", variant: "destructive" });
    }
  };

  const removeRow = async (id: string) => {
    const { error } = await (supabase as any).from("variant_price_tiers").delete().eq("id", id);
    if (error) {
      console.error(error);
      toast({ title: "Error", description: "No se pudo eliminar.", variant: "destructive" });
      return;
    }
    setRows((r) => r.filter((x) => x.id !== id));
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">Precios por tiers</h4>
        <Button size="sm" variant="outline" onClick={addRow}>Agregar tier</Button>
      </div>
      {loading && <p>Cargando precios…</p>}
      {!loading && rows.length === 0 && <p>Sin precios configurados.</p>}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
        {rows.map((row) => (
          <Card key={row.id} className="p-3 md:col-span-12">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
              <div>
                <Label>Tier</Label>
                <Input value={row.tier} onChange={(e) => setRows((rs) => rs.map(r => r.id === row.id ? { ...r, tier: e.target.value } : r))} onBlur={() => updateRow(rows.find(r=>r.id===row.id)!)} />
              </div>
              <div>
                <Label>Mín. qty</Label>
                <Input type="number" value={row.min_qty} onChange={(e) => setRows((rs) => rs.map(r => r.id === row.id ? { ...r, min_qty: Number(e.target.value) } : r))} onBlur={() => updateRow(rows.find(r=>r.id===row.id)!)} />
              </div>
              <div>
                <Label>Moneda</Label>
                <Input value={row.currency} onChange={(e) => setRows((rs) => rs.map(r => r.id === row.id ? { ...r, currency: e.target.value } : r))} onBlur={() => updateRow(rows.find(r=>r.id===row.id)!)} />
              </div>
              <div>
                <Label>Precio</Label>
                <Input type="number" value={row.unit_price} onChange={(e) => setRows((rs) => rs.map(r => r.id === row.id ? { ...r, unit_price: Number(e.target.value) } : r))} onBlur={() => updateRow(rows.find(r=>r.id===row.id)!)} />
              </div>
              <div className="flex items-end">
                <Button variant="destructive" onClick={() => removeRow(row.id)}>Eliminar</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const VariantImages: React.FC<{ variantId: string }> = ({ variantId }) => {
  const { toast } = useToast();
  const [images, setImages] = useState<VariantImage[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("product_variant_images")
      .select("*")
      .eq("product_variant_id", variantId)
      .order("sort_order", { ascending: true });
    setLoading(false);
    if (error) {
      console.error(error);
      toast({ title: "Error", description: "No se pudieron cargar imágenes.", variant: "destructive" });
      return;
    }
    setImages((data || []) as any);
  };

  useEffect(() => { load(); }, [variantId]);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const path = `variants/${variantId}/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from('product-images').upload(path, file);
    if (upErr) {
      console.error(upErr);
      toast({ title: "Error", description: "No se pudo subir la imagen.", variant: "destructive" });
      return;
    }
    const { data: pub } = supabase.storage.from('product-images').getPublicUrl(path);
    const { error } = await (supabase as any)
      .from("product_variant_images")
      .insert({ product_variant_id: variantId, url: pub.publicUrl, alt: file.name })
      .select("*")
      .maybeSingle();
    if (error) {
      console.error(error);
      toast({ title: "Error", description: "No se pudo guardar la imagen.", variant: "destructive" });
      return;
    }
    await load();
  };

  const remove = async (id: string) => {
    const { error } = await (supabase as any).from("product_variant_images").delete().eq("id", id);
    if (error) {
      console.error(error);
      toast({ title: "Error", description: "No se pudo eliminar la imagen.", variant: "destructive" });
      return;
    }
    setImages((imgs) => imgs.filter((i) => i.id !== id));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Imágenes</h4>
        <Input type="file" accept="image/*" onChange={onFile} />
      </div>
      {loading && <p>Cargando imágenes…</p>}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {images.map((img) => (
          <Card key={img.id} className="p-2 space-y-2">
            <img src={img.url} alt={img.alt ?? 'imagen variante'} className="w-full h-24 object-cover rounded" />
            <div className="flex justify-between items-center">
              <span className="text-xs truncate">{img.alt}</span>
              <Button size="sm" variant="destructive" onClick={() => remove(img.id)}>Eliminar</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
