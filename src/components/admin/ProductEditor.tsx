import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { slugify } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Languages, Truck, Layers, UserSquare, Settings } from "lucide-react";

export type AdminProduct = {
  id?: string;
  name: string;
  brand?: string | null;
  description?: string | null;
  slug?: string | null;
  active: boolean;
  status?: 'draft' | 'published';
  subtitle?: string | null;
  bx_code?: string | null;
  verified_product?: boolean;
  verified_video?: boolean;
  material?: string | null;
  discountable?: boolean;
  agent_profile_id?: string | null;
  supplier_link?: string | null;
  supplier_model?: string | null;
  type?: string | null;
  collection?: string | null;
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
    status: (product as any)?.status ?? 'draft',
    subtitle: (product as any)?.subtitle ?? "",
    bx_code: (product as any)?.bx_code ?? "",
    verified_product: (product as any)?.verified_product ?? false,
    verified_video: (product as any)?.verified_video ?? false,
    material: (product as any)?.material ?? "",
    discountable: (product as any)?.discountable ?? true,
    agent_profile_id: (product as any)?.agent_profile_id ?? null,
    supplier_link: (product as any)?.supplier_link ?? "",
    supplier_model: (product as any)?.supplier_model ?? "",
    type: (product as any)?.type ?? "",
    collection: (product as any)?.collection ?? "",
  });

  const [profiles, setProfiles] = useState<{id: string; display_name: string | null}[]>([]);
const [categories, setCategories] = useState<{id: string; name: string; parent_id: string | null}[]>([]);
const [selectedParentIds, setSelectedParentIds] = useState<string[]>([]);
const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<string[]>([]);
const [tagsText, setTagsText] = useState<string>("");
  const [translations, setTranslations] = useState<Record<string, { id?: string; title: string; description: string }>>({
    cn: { title: "", description: "" },
    ar: { title: "", description: "" },
    co: { title: "", description: "" },
  });
  const agentOptions = useMemo(() => {
    const allowed = ["kerwin", "jessica", "gabriel"];
    return profiles.filter((p) => {
      const name = (p.display_name || "").toLowerCase();
      return allowed.some((a) => name === a || name.includes(a));
    });
  }, [profiles]);

  useEffect(() => {
    setForm({
      id: product?.id,
      name: product?.name || "",
      brand: product?.brand || "",
      description: product?.description || "",
      slug: product?.slug || "",
      active: product?.active ?? true,
      status: (product as any)?.status ?? 'draft',
      subtitle: (product as any)?.subtitle ?? "",
      bx_code: (product as any)?.bx_code ?? "",
      verified_product: (product as any)?.verified_product ?? false,
      verified_video: (product as any)?.verified_video ?? false,
      material: (product as any)?.material ?? "",
      discountable: (product as any)?.discountable ?? true,
      agent_profile_id: (product as any)?.agent_profile_id ?? null,
      supplier_link: (product as any)?.supplier_link ?? "",
      supplier_model: (product as any)?.supplier_model ?? "",
      type: (product as any)?.type ?? "",
      collection: (product as any)?.collection ?? "",
    });
  }, [product]);

  useEffect(() => {
    // Load agents, categories, tags and translations when opening
    if (!open) return;
    (async () => {
      const { data: profs } = await (supabase as any).from('profiles').select('id, display_name').limit(50);
      setProfiles(profs || []);
const { data: cats } = await supabase.from('categories').select('id,name,parent_id').order('name');
setCategories((cats || []) as any);
if (product?.id) {
  const { data: pc } = await supabase.from('product_categories').select('category_id').eq('product_id', product.id);
  const chosen = new Set<string>((pc || []).map((r: any) => r.category_id as string));
  const parents = new Set<string>();
  const subs = new Set<string>();
  (cats || []).forEach((c: any) => {
    if (chosen.has(c.id)) {
      if (c.parent_id) {
        subs.add(c.id);
        parents.add(c.parent_id);
      } else {
        parents.add(c.id);
      }
    }
  });
  setSelectedParentIds([...parents]);
  setSelectedSubcategoryIds([...subs]);
  const { data: tgs } = await (supabase as any).from('product_tags').select('tags(name), tag_id').eq('product_id', product.id);
  if (tgs && tgs.length) setTagsText((tgs as any[]).map((x: any) => x.tags?.name).filter(Boolean).join(', '));

        const { data: trans } = await supabase
          .from('product_translations')
          .select('id, country_code, title, description')
          .eq('product_id', product.id);
        const base: Record<string, { id?: string; title: string; description: string }> = {
          cn: { title: "", description: "" },
          ar: { title: "", description: "" },
          co: { title: "", description: "" },
        };
        (trans || []).forEach((t: any) => {
          const code = (t.country_code || '').toLowerCase();
          if (base[code] !== undefined) base[code] = { id: t.id, title: t.title || '', description: t.description || '' };
        });
        setTranslations(base);
      } else {
setSelectedParentIds([]);
        setSelectedSubcategoryIds([]);
        setTagsText("");
        setTranslations({ cn: { title: "", description: "" }, ar: { title: "", description: "" }, co: { title: "", description: "" } });
      }
    })();
  }, [open, product?.id]);

  const syncRelations = async (productId: string) => {
    try {
      // Categories
      const { data: existingPC } = await supabase.from('product_categories').select('category_id').eq('product_id', productId);
      const existingIds = new Set((existingPC || []).map((r: any) => r.category_id));
const desiredIds = new Set<string>([...selectedParentIds, ...selectedSubcategoryIds]);
      const toInsert = [...desiredIds]
        .filter((id) => !existingIds.has(id))
        .map((id) => ({ product_id: productId, category_id: id as string }));
      const toDelete = [...existingIds].filter((id) => !desiredIds.has(id as string));
      if (toInsert.length) await supabase.from('product_categories').insert(toInsert as any);
      if (toDelete.length) await supabase.from('product_categories').delete().eq('product_id', productId).in('category_id', toDelete as any);

      // Tags
      const names = Array.from(new Set((tagsText || '').split(',').map((s) => s.trim()).filter(Boolean)));
      // Upsert tags by name
      let tagIds: string[] = [];
      if (names.length) {
        const { data: up } = await (supabase as any).from('tags').upsert(names.map((n) => ({ name: n })), { onConflict: 'name' }).select('id,name');
        tagIds = (up || []).map((r: any) => r.id);
      }
      const { data: existingPT } = await supabase.from('product_tags').select('tag_id').eq('product_id', productId);
      const existingTagIds = new Set((existingPT || []).map((r: any) => r.tag_id));
      const desiredTagIds = new Set(tagIds);
      const ptInsert = [...desiredTagIds].filter((id) => !existingTagIds.has(id)).map((id) => ({ product_id: productId, tag_id: id }));
      const ptDelete = [...existingTagIds].filter((id) => !desiredTagIds.has(id));
      if (ptInsert.length) await supabase.from('product_tags').insert(ptInsert);
      if (ptDelete.length) await supabase.from('product_tags').delete().eq('product_id', productId).in('tag_id', ptDelete);
    } catch (e) {
      console.error('[ProductEditor] syncRelations', e);
    }
  };

  const saveProduct = async () => {
    try {
setSaving(true);
      if (selectedParentIds.length === 0 || selectedSubcategoryIds.length === 0) {
        toast({ title: "Falta organización", description: "Selecciona al menos una categoría y una subcategoría.", variant: "destructive" });
        setSaving(false);
        return;
      }
      if (isEdit && form.id) {
        const { error } = await supabase
          .from("products")
          .update({
            name: form.name,
            brand: form.brand,
            description: form.description,
            slug: form.slug,
            active: form.active,
            status: form.status,
            subtitle: form.subtitle,
            bx_code: form.bx_code,
            verified_product: form.verified_product ?? false,
            verified_video: form.verified_video ?? false,
            material: form.material,
            discountable: form.discountable,
            agent_profile_id: form.agent_profile_id,
            supplier_link: form.supplier_link,
            supplier_model: form.supplier_model,
            type: form.type,
            collection: form.collection,
          })
.eq("id", form.id);
        if (error) throw error;
        await syncRelations(form.id!);
      } else {
        const { data, error } = await supabase
          .from("products")
          .insert({
            name: form.name,
            brand: form.brand,
            description: form.description,
            slug: form.slug,
            active: form.active,
            status: form.status,
            subtitle: form.subtitle,
            bx_code: form.bx_code,
            verified_product: form.verified_product ?? false,
            verified_video: form.verified_video ?? false,
            material: form.material,
            discountable: form.discountable,
            agent_profile_id: form.agent_profile_id,
            supplier_link: form.supplier_link,
            supplier_model: form.supplier_model,
            type: form.type,
            collection: form.collection,
          })
          .select("id")
          .maybeSingle();
if (error) throw error;
        const newId = (data?.id as string) || '';
        setForm((f) => ({ ...f, id: newId }));
        if (newId) await syncRelations(newId);
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

  const saveTranslations = async () => {
    if (!form.id) {
      toast({ title: "Primero guarda el producto", description: "Crea el producto antes de agregar traducciones.", variant: "default" });
      return;
    }
    try {
      const payload: any[] = [];
      (['cn','ar','co'] as const).forEach((code) => {
        const t = (translations as any)[code];
        if (!t) return;
        const hasContent = (t.title && t.title.trim()) || (t.description && t.description.trim());
        if (!hasContent) return;
        if (t.id) payload.push({ id: t.id, product_id: form.id, country_code: code, title: t.title, description: t.description });
        else payload.push({ product_id: form.id, country_code: code, title: t.title, description: t.description });
      });
      if (payload.length) await (supabase as any).from('product_translations').upsert(payload);
      toast({ title: "Guardado", description: "Traducciones guardadas." });
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "No se pudieron guardar las traducciones.", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar producto" : "Nuevo producto"}</DialogTitle>
        </DialogHeader>
          <Tabs defaultValue="producto" className="w-full">
            <TabsList>
              <TabsTrigger value="producto" className="gap-2"><Package size={16} /> Producto</TabsTrigger>
              <TabsTrigger value="multilingual" className="gap-2"><Languages size={16} /> Contenido</TabsTrigger>
              <TabsTrigger value="supplier" className="gap-2"><Truck size={16} /> Proveedor</TabsTrigger>
              <TabsTrigger value="variantes" className="gap-2"><Layers size={16} /> Variantes</TabsTrigger>
              <TabsTrigger value="agente" className="gap-2"><UserSquare size={16} /> Agente</TabsTrigger>
              <TabsTrigger value="status" className="gap-2"><Settings size={16} /> Status</TabsTrigger>
            </TabsList>

            <TabsContent value="producto" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Título</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => {
                      const newName = e.target.value;
                      setForm((prev) => {
                        const autoPrev = slugify(prev.name || "");
                        const shouldUpdateSlug = !prev.slug || prev.slug === autoPrev;
                        return { ...prev, name: newName, slug: shouldUpdateSlug ? slugify(newName) : prev.slug };
                      });
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Handle (editable)</Label>
                  <Input id="slug" value={form.slug ?? ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="bx_code">BX Code</Label>
                  <Input id="bx_code" value={form.bx_code ?? ""} onChange={(e) => setForm({ ...form, bx_code: e.target.value })} />
                </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className="flex items-center justify-between gap-3">
                      <span>Verified product</span>
                      <Switch
                        id="verified_product"
                        checked={!!form.verified_product}
                        onCheckedChange={(v) => setForm({ ...form, verified_product: !!v })}
                      />
                    </label>
                    <label className="flex items-center justify-between gap-3">
                      <span>Verified video</span>
                      <Switch
                        id="verified_video"
                        checked={!!form.verified_video}
                        onCheckedChange={(v) => setForm({ ...form, verified_video: !!v })}
                      />
                    </label>
                    <label className="flex items-center justify-between gap-3">
                      <span>Discountable</span>
                      <Switch
                        id="discountable"
                        checked={!!form.discountable}
                        onCheckedChange={(v) => setForm({ ...form, discountable: !!v })}
                      />
                    </label>
                  </div>
              </div>

              <Card className="p-3">
                <h4 className="font-medium mb-2">Organización</h4>
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2 block">Categorías</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {categories.filter((c) => !c.parent_id).map((c) => (
                        <label key={c.id} className="flex items-center gap-2">
                          <Checkbox
                            checked={selectedParentIds.includes(c.id)}
                            onCheckedChange={(v) => {
                              if (v) {
                                setSelectedParentIds((prev) => (prev.includes(c.id) ? prev : [...prev, c.id]));
                              } else {
                                setSelectedParentIds((prev) => prev.filter((id) => id !== c.id));
                                setSelectedSubcategoryIds((prev) => prev.filter((sid) => {
                                  const sc = categories.find((x) => x.id === sid);
                                  return sc?.parent_id !== c.id;
                                }));
                              }
                            }}
                          />
                          <span>{c.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="mb-2 block">Subcategorías</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {categories
                        .filter((sc) => sc.parent_id && selectedParentIds.includes(sc.parent_id))
                        .map((sc) => (
                          <label key={sc.id} className="flex items-center gap-2">
                            <Checkbox
                              checked={selectedSubcategoryIds.includes(sc.id)}
                              onCheckedChange={(v) => {
                                if (v) {
                                  setSelectedSubcategoryIds((prev) => (prev.includes(sc.id) ? prev : [...prev, sc.id]));
                                  if (sc.parent_id) setSelectedParentIds((prev) => (prev.includes(sc.parent_id!) ? prev : [...prev, sc.parent_id!]));
                                } else {
                                  setSelectedSubcategoryIds((prev) => prev.filter((id) => id !== sc.id));
                                }
                              }}
                            />
                            <span>{sc.name}</span>
                          </label>
                        ))}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <Label htmlFor="collection">Colección (opcional)</Label>
                  <Input
                    id="collection"
                    value={form.collection ?? ""}
                    onChange={(e) => setForm({ ...form, collection: e.target.value })}
                    placeholder="Ej: Verano 2025"
                  />
                </div>
              </Card>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>Cerrar</Button>
                <Button onClick={saveProduct} disabled={saving}>{saving ? "Guardando…" : "Guardar"}</Button>
              </div>
            </TabsContent>

            <TabsContent value="multilingual" className="space-y-4">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <img src="/images/flags/ar.svg" alt="Bandera Argentina" className="h-4 w-6" />
                      <h4 className="font-medium">Español (AR)</h4>
                    </div>
                    <Input
                      placeholder="Título (AR)"
                      value={translations.ar.title}
                      onChange={(e) => setTranslations({ ...translations, ar: { ...translations.ar, title: e.target.value } })}
                    />
                    <Textarea
                      placeholder="Descripción (AR)"
                      value={translations.ar.description}
                      onChange={(e) => setTranslations({ ...translations, ar: { ...translations.ar, description: e.target.value } })}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <img src="/images/flags/co.svg" alt="Bandera Colombia" className="h-4 w-6" />
                      <h4 className="font-medium">Español (CO)</h4>
                    </div>
                    <Input
                      placeholder="Título (CO)"
                      value={translations.co.title}
                      onChange={(e) => setTranslations({ ...translations, co: { ...translations.co, title: e.target.value } })}
                    />
                    <Textarea
                      placeholder="Descripción (CO)"
                      value={translations.co.description}
                      onChange={(e) => setTranslations({ ...translations, co: { ...translations.co, description: e.target.value } })}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-4 w-6 items-center justify-center rounded bg-muted text-xs">CN</span>
                      <h4 className="font-medium">Chino (CN)</h4>
                    </div>
                    <Input
                      placeholder="Título (CN)"
                      value={translations.cn.title}
                      onChange={(e) => setTranslations({ ...translations, cn: { ...translations.cn, title: e.target.value } })}
                    />
                    <Textarea
                      placeholder="Descripción (CN)"
                      value={translations.cn.description}
                      onChange={(e) => setTranslations({ ...translations, cn: { ...translations.cn, description: e.target.value } })}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={onClose}>Cerrar</Button>
                  <Button onClick={saveTranslations}>Guardar traducciones</Button>
                </div>
              </TabsContent>

            <TabsContent value="supplier" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="supplier_link">Supplier Link</Label>
                  <Input id="supplier_link" value={form.supplier_link ?? ""} onChange={(e) => setForm({ ...form, supplier_link: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="supplier_model">Supplier Size/Model</Label>
                  <Input id="supplier_model" value={form.supplier_model ?? ""} onChange={(e) => setForm({ ...form, supplier_model: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>Cerrar</Button>
                <Button onClick={saveProduct} disabled={saving}>{saving ? "Guardando…" : "Guardar"}</Button>
              </div>
            </TabsContent>

            <TabsContent value="variantes">
              {form.id ? (
                <VariantsEditor productId={form.id!} />
              ) : (
                <Card className="p-4">
                  <p className="text-sm mb-3">Primero guarda el producto para poder crear variantes.</p>
                  <Button onClick={saveProduct} disabled={saving}>{saving ? "Guardando…" : "Guardar producto"}</Button>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="agente" className="space-y-4">
              <div>
                <Label>Agente</Label>
                <Select value={form.agent_profile_id ?? undefined} onValueChange={(v) => setForm({ ...form, agent_profile_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona agente" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-background">
                    {agentOptions.length === 0 && (
                      <SelectItem value="no-agents" disabled>
                        No se encontraron agentes (Kerwin/Jessica/Gabriel)
                      </SelectItem>
                    )}
                    {agentOptions.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.display_name || p.id}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>Cerrar</Button>
                <Button onClick={saveProduct} disabled={saving}>{saving ? "Guardando…" : "Guardar"}</Button>
              </div>
            </TabsContent>

            <TabsContent value="status" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="published">Publicado</Label>
                <Switch
                  id="published"
                  checked={form.status === 'published'}
                  onCheckedChange={(v) => setForm({ ...form, status: v ? 'published' : 'draft' })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>Cerrar</Button>
                <Button onClick={saveProduct} disabled={saving}>{saving ? "Guardando…" : "Guardar"}</Button>
              </div>
            </TabsContent>
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
