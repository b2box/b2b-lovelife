import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { slugify } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { NumericInput } from "@/components/ui/numeric-input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Languages, Truck, Layers, UserSquare, Settings, Tag, Shirt, Smartphone, Sparkles, HeartPulse, Watch, Gem, Gift, Calendar, PartyPopper, PawPrint, Home, Dumbbell, Briefcase, PencilRuler, Plug, Car, Wrench, Video } from "lucide-react";
import { VideoManager } from "./VideoManager";
import { ImageManager, ImageItem } from "./ImageManager";
import { VariantImages as VariantImagesComponent } from "./VariantImages";
import { usePricingSettings } from "@/hooks/usePricingSettings";
import { ensureMarkets as calcEnsureMarkets, recomputeMarkets, computeMarketPrice, computePercentFromPrice } from "@/lib/pricing";

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
  video_url?: string | null;
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
  attributes?: any;
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
    video_url: (product as any)?.video_url ?? null,
  });

  const [productImages, setProductImages] = useState<ImageItem[]>([]);

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

  const categoryIcon = (name: string) => {
    const n = (name || '').toLowerCase();
    const cls = "h-4 w-4 text-muted-foreground";
    if (n.includes('moda')) return <Shirt className={cls} />;
    if (n.includes('electrónica')) return <Smartphone className={cls} />;
    if (n.includes('belleza') || n.includes('cuidado personal')) return <Sparkles className={cls} />;
    if (n.includes('salud')) return <HeartPulse className={cls} />;
    if (n.includes('wearable') || n.includes('reloj')) return <Watch className={cls} />;
    if (n.includes('joyería')) return <Gem className={cls} />;
    if (n.includes('juguetes')) return <Gift className={cls} />;
    if (n.includes('temporada')) return <Calendar className={cls} />;
    if (n.includes('evento') || n.includes('fiesta')) return <PartyPopper className={cls} />;
    if (n.includes('mascotas')) return <PawPrint className={cls} />;
    if (n.includes('hogar')) return <Home className={cls} />;
    if (n.includes('deporte')) return <Dumbbell className={cls} />;
    if (n.includes('maletas') || n.includes('bolsos')) return <Briefcase className={cls} />;
    if (n.includes('escolar') || n.includes('oficina')) return <PencilRuler className={cls} />;
    if (n.includes('electrodomésticos')) return <Plug className={cls} />;
    if (n.includes('vehículos') || n.includes('motos') || n.includes('bicicletas')) return <Car className={cls} />;
    if (n.includes('herramientas')) return <Wrench className={cls} />;
    return <Tag className={cls} />;
  };

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
    const base = (form.name || '').trim() || (translations.ar?.title || '').trim() || (translations.co?.title || '').trim();
    if (!form.slug && base) {
      setForm((prev) => ({ ...prev, slug: slugify(base) }));
    }
  }, [form.name, form.slug, translations.ar?.title, translations.co?.title]);

  useEffect(() => {
    // Load agents, categories, tags and translations when opening
    if (!open) return;
    (async () => {
      const { data: profs } = await supabase
        .from('profiles')
        .select('id, display_name')
        .or('display_name.ilike.kerwin%,display_name.ilike.jessica%,display_name.ilike.gabriel%');
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
            video_url: form.video_url,
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
            video_url: form.video_url,
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
      <DialogContent className="w-[95vw] max-w-5xl max-h-[85vh] overflow-y-auto card-glass">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar producto" : "Nuevo producto"}</DialogTitle>
        </DialogHeader>
          <Tabs defaultValue="producto" className="w-full">
            <TabsList>
              <TabsTrigger value="producto" className="gap-2"><Package size={16} /> Producto</TabsTrigger>
              <TabsTrigger value="multilingual" className="gap-2"><Languages size={16} /> Contenido</TabsTrigger>
              <TabsTrigger value="supplier" className="gap-2"><Truck size={16} /> Proveedor</TabsTrigger>
              <TabsTrigger value="media" className="gap-2"><Video size={16} /> Media</TabsTrigger>
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
                      setForm((prev) => ({ ...prev, name: newName, slug: slugify(newName) }));
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Handle (automático)</Label>
                  <Input id="slug" value={form.slug ?? ""} readOnly />
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
                          <span className="inline-flex items-center gap-2">{categoryIcon(c.name)}{c.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="mb-2 block">Subcategorías</Label>
                    <div className="space-y-3">
                      {selectedParentIds.map((pid) => {
                        const parent = categories.find((c) => c.id === pid);
                        if (!parent) return null;
                        const subs = categories.filter((sc) => sc.parent_id === pid);
                        return (
                          <div key={pid} className="rounded-md border p-2">
                            <div className="mb-1 text-sm font-medium inline-flex items-center gap-2">
                              {categoryIcon(parent.name)} {parent.name}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {subs.map((sc) => (
                                <label key={sc.id} className="flex items-center gap-2">
                                  <Checkbox
                                    checked={selectedSubcategoryIds.includes(sc.id)}
                                    onCheckedChange={(v) => {
                                      if (v) {
                                        setSelectedSubcategoryIds((prev) => (prev.includes(sc.id) ? prev : [...prev, sc.id]));
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
                        );
                      })}
                      {selectedParentIds.length === 0 && (
                        <p className="text-sm text-muted-foreground">Selecciona una categoría para ver sus subcategorías.</p>
                      )}
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

            <TabsContent value="media" className="space-y-4">
              <div className="grid gap-6">
                <VideoManager
                  productId={form.id || 'temp'}
                  currentVideoUrl={form.video_url}
                  onVideoUpdate={(videoUrl) => setForm({ ...form, video_url: videoUrl })}
                />
                
                <ImageManager
                  images={productImages}
                  onImagesUpdate={setProductImages}
                  productId={form.id}
                  maxImages={15}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>Cerrar</Button>
                <Button onClick={saveProduct} disabled={saving}>{saving ? "Guardando…" : "Guardar producto"}</Button>
              </div>
            </TabsContent>

            <TabsContent value="agente" className="space-y-4">
              <div>
                <Label className="mb-2 block">Agente</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {(() => {
                    const p = agentOptions.find(p => (p.display_name || '').toLowerCase().includes('gabriel'));
                    const id = p?.id;
                    const checked = form.agent_profile_id === id;
                    return (
                      <label className="flex items-center justify-between gap-3">
                        <span>Gabriel</span>
                        <Switch
                          checked={!!checked}
                          disabled={!id}
                          onCheckedChange={(v) => setForm({ ...form, agent_profile_id: v ? (id || null) : null })}
                        />
                      </label>
                    );
                  })()}
                  {(() => {
                    const p = agentOptions.find(p => (p.display_name || '').toLowerCase().includes('kerwin'));
                    const id = p?.id;
                    const checked = form.agent_profile_id === id;
                    return (
                      <label className="flex items-center justify-between gap-3">
                        <span>Kerwin</span>
                        <Switch
                          checked={!!checked}
                          disabled={!id}
                          onCheckedChange={(v) => setForm({ ...form, agent_profile_id: v ? (id || null) : null })}
                        />
                      </label>
                    );
                  })()}
                  {(() => {
                    const p = agentOptions.find(p => (p.display_name || '').toLowerCase().includes('jessica'));
                    const id = p?.id;
                    const checked = form.agent_profile_id === id;
                    return (
                      <label className="flex items-center justify-between gap-3">
                        <span>Jessica</span>
                        <Switch
                          checked={!!checked}
                          disabled={!id}
                          onCheckedChange={(v) => setForm({ ...form, agent_profile_id: v ? (id || null) : null })}
                        />
                      </label>
                    );
                  })()}
                </div>
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
  const [edit, setEdit] = useState<AdminVariant | null>(null);

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
    if (data) {
      setVariants((v) => [...v, data as any]);
      setEdit(data as any);
    }
  };

  const toggleActive = async (id: string, val: boolean) => {
    const { error } = await supabase.from('product_variants').update({ active: val }).eq('id', id);
    if (error) {
      console.error(error);
      toast({ title: 'Error', description: 'No se pudo actualizar el estado.', variant: 'destructive' });
      return;
    }
    setVariants((prev) => prev.map((x) => (x.id === id ? { ...x, active: val } : x)));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Variantes</h3>
        <Button size="sm" onClick={createVariant}>Agregar variante</Button>
      </div>
      {loading && <p>Cargando…</p>}
      {!loading && (
        <Card className="p-0 card-glass">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>PA Code</TableHead>
                <TableHead className="w-[120px]">Activo</TableHead>
                <TableHead className="w-[120px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variants.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.name ?? "-"}</TableCell>
                  <TableCell>{row.sku ?? "-"}</TableCell>
                  <TableCell>
                    <Switch checked={!!row.active} onCheckedChange={(val) => toggleActive(row.id, !!val)} />
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => setEdit(row)}>Editar</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent className="w-[95vw] max-w-5xl max-h-[85vh] overflow-y-auto">
          {edit && <VariantCard variant={edit} onChanged={() => { load(); setEdit(null); }} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const VariantCard: React.FC<{ variant: AdminVariant; onChanged: () => void }> = ({ variant, onChanged }) => {
  const { toast } = useToast();
  const [v, setV] = useState<AdminVariant>(variant);
  const [saving, setSaving] = useState(false);
  const [imgVersion, setImgVersion] = useState(0);
  const [tierPrices, setTierPrices] = useState<number[]>([0, 0, 0]);
  const { data: pricing } = usePricingSettings();

  // Load CNY base prices per tier for calculations in markets
  useEffect(() => {
    const loadTierPrices = async () => {
      const orderEs = ["inicial", "mayorista", "distribuidor"] as const;
      const orderEn = ["initial", "wholesale", "distributor"] as const;
      const idx = (t: string) => {
        const i1 = orderEs.indexOf(t as any); if (i1 !== -1) return i1;
        const i2 = orderEn.indexOf(t as any); if (i2 !== -1) return i2;
        return 99;
      };
      const { data } = await (supabase as any)
        .from("variant_price_tiers")
        .select("tier, unit_price")
        .eq("product_variant_id", variant.id);
      const arr = [0, 0, 0];
      (data || []).sort((a: any, b: any) => idx(a.tier) - idx(b.tier)).slice(0, 3).forEach((r: any, i: number) => {
        arr[i] = Number(r.unit_price) || 0;
      });
      setTierPrices(arr);
    };
    loadTierPrices();
  }, [variant.id]);


  const recalcMarketPrices = (baseArr: number[], pkgOverride?: any) => {
    const settingsData = {
      arRate: pricing?.arRate ?? 1,
      coRate: pricing?.coRate ?? 1,
      arPercents: pricing?.arPercents ?? [300, 300, 300],
      coPercents: pricing?.coPercents ?? [200, 200, 200],
    };
    const p = pkgOverride ?? (v.attributes?.packaging ?? { packed: true, required: false, cny_price: 0 });
    const add = !p.packed && p.required ? Number(p.cny_price) || 0 : 0;
    const effectiveBase = baseArr.map((b) => (b || 0) + add);
    const next = recomputeMarkets(v.attributes?.markets, effectiveBase, settingsData);
    setV((prev) => ({ ...prev, attributes: { ...(prev.attributes || {}), markets: next } }));
  };

  const handleBasePricesChange = (arr: number[]) => {
    setTierPrices(arr);
    recalcMarketPrices(arr);
  };

  useEffect(() => {
    if (tierPrices) recalcMarketPrices(tierPrices);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tierPrices]);

  useEffect(() => {
    if (pricing) recalcMarketPrices(tierPrices);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pricing]);

  const onImageFiles = async (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files)) {
      const path = `variants/${v.id}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from('product-images').upload(path, file);
      if (upErr) {
        console.error(upErr);
        toast({ title: "Error", description: "No se pudo subir la imagen.", variant: "destructive" });
        continue;
      }
      const { data: pub } = supabase.storage.from('product-images').getPublicUrl(path);
      const { error } = await (supabase as any)
        .from("product_variant_images")
        .insert({ product_variant_id: v.id, url: pub.publicUrl, alt: file.name });
      if (error) {
        console.error(error);
        toast({ title: "Error", description: "No se pudo guardar la imagen.", variant: "destructive" });
      }
    }
    setImgVersion((n) => n + 1);
  };

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
          attributes: v.attributes,
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

  const attrs: any = v.attributes ?? {};
  const pkg = attrs.packaging ?? { packed: true, cny_price: 0, required: false };
  const settingsData = {
    arRate: pricing?.arRate ?? 1,
    coRate: pricing?.coRate ?? 1,
    arPercents: pricing?.arPercents ?? [300, 300, 300],
    coPercents: pricing?.coPercents ?? [200, 200, 200],
  };
  const addPkg = !pkg.packed && pkg.required ? Number(pkg.cny_price) || 0 : 0;
  const effectiveBase = tierPrices.map((b) => (b || 0) + addPkg);
  const markets = calcEnsureMarkets(attrs.markets, effectiveBase, settingsData);
  const formatThousands = (num: number) => new Intl.NumberFormat('es-AR').format(Number(num || 0));
  const onVideoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const path = `variants/${v.id}/videos/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from('product-images').upload(path, file);
    if (upErr) {
      console.error(upErr);
      toast({ title: "Error", description: "No se pudo subir el video.", variant: "destructive" });
      return;
    }
    const { data: pub } = supabase.storage.from('product-images').getPublicUrl(path);
    setV({ ...v, attributes: { ...attrs, video_url: pub.publicUrl } });
  };
  return (
    <Card className="p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <Label>Título</Label>
          <Input value={v.name ?? ""} onChange={(e) => setV({ ...v, name: e.target.value })} />
        </div>
        <div>
          <Label>PA Code</Label>
          <Input value={v.sku ?? ""} onChange={(e) => setV({ ...v, sku: e.target.value })} />
        </div>
        <div className="flex items-end">
          <label className="flex items-center justify-between w-full">
            <span>Activo</span>
            <Switch checked={!!v.active} onCheckedChange={(val) => setV({ ...v, active: !!val })} />
          </label>
        </div>
      </div>

      {/* Sección 1: Dimensiones */}
      <div>
        <h4 className="font-medium mb-2">Dimensiones</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-3">
            <h5 className="text-sm font-medium mb-2">Producto</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
            </div>
          </Card>
          <Card className="p-3">
            <h5 className="text-sm font-medium mb-2">Caja</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
          </Card>
        </div>
      </div>

      {/* Sección 2: Packaging */}
      <Card className="p-3">
        <h4 className="font-medium mb-2">Packaging individual</h4>
        <div className="flex items-center justify-between mb-3">
          <Label>Empaque incluido</Label>
          <Switch
            checked={!!pkg.packed}
            onCheckedChange={(val) => {
              const next = { ...attrs, packaging: { ...pkg, packed: !!val } };
              setV({ ...v, attributes: next });
              recalcMarketPrices(tierPrices, next.packaging);
            }}
          />
        </div>
        {!pkg.packed && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label>Precio empaque (CNY)</Label>
              <NumericInput
                value={Number(pkg.cny_price ?? 0)}
                decimals={2}
                onValueChange={(val) => {
                  const next = { ...attrs, packaging: { ...pkg, cny_price: Number(val) } };
                  setV({ ...v, attributes: next });
                  recalcMarketPrices(tierPrices, next.packaging);
                }}
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center justify-between w-full">
                <span>Requerido</span>
                <Switch
                  checked={!!pkg.required}
                  onCheckedChange={(val) => {
                    const next = { ...attrs, packaging: { ...pkg, required: !!val } };
                    setV({ ...v, attributes: next });
                    recalcMarketPrices(tierPrices, next.packaging);
                  }}
                />
              </label>
            </div>
          </div>
        )}
      </Card>

      {/* Sección 3: Extras */}
      <Card className="p-3">
        <h4 className="font-medium mb-2">Extras</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center justify-between">
            <Label className="mr-3">Batería</Label>
            <Switch checked={!!v.has_battery} onCheckedChange={(val) => setV({ ...v, has_battery: !!val })} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="mr-3">Ropa</Label>
            <Switch checked={!!v.is_clothing} onCheckedChange={(val) => setV({ ...v, is_clothing: !!val })} />
          </div>
          <div className="md:col-span-2">
            <Label className="mr-3">Material</Label>
            <Input
              value={attrs.material ?? ""}
              onChange={(e) => setV({ ...v, attributes: { ...attrs, material: e.target.value } })}
              placeholder="Ej: plástico, metal, algodón"
            />
          </div>
        </div>
      </Card>

      {/* Sección 4: Packaging atributos */}
      <Card className="p-3">
        <h4 className="font-medium mb-2">Master Packaging</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <Label>PCS/CTN</Label>
            <NumericInput value={Number(v.pcs_per_carton ?? 0)} decimals={0} onValueChange={(val) => setV({ ...v, pcs_per_carton: Number(val) })} />
          </div>
          <div>
            <Label>CBM/CTN</Label>
            <NumericInput value={Number(v.cbm_per_carton ?? 0)} decimals={3} onValueChange={(val) => setV({ ...v, cbm_per_carton: Number(val) })} />
          </div>
        </div>
      </Card>

      {/* Sección 5: Supplier tiers */}
      <Card className="p-3">
        <h4 className="font-medium mb-2">Proveedor (3 tiers)</h4>
        <VariantTiers variantId={v.id} onBasePricesChange={handleBasePricesChange} />
      </Card>

      {/* Sección 6: Precio por mercado (AR, COL) */}
      <Card className="p-3">
        <h4 className="font-medium mb-2">Precio por mercado</h4>
          <div className="grid grid-cols-1 gap-4">
          {(["AR", "COL"] as const).map((mk) => (
            <Card key={mk} className="p-3">
              <h5 className="text-sm font-medium mb-2">{mk === 'AR' ? 'AR (USD)' : 'COL (COP)'}</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {markets[mk].map((t, i) => (
                  <div key={i} className="space-y-2">
                    <div className="text-xs text-muted-foreground">Tier {i + 1}</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>% incremento</Label>
                        <Input
                          type="number"
                          value={t.percent}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const base = effectiveBase[i] ?? 0;
                            const rate = mk === 'AR' ? settingsData.arRate : settingsData.coRate;
                            const price = computeMarketPrice(base, val, rate);
                            const next = calcEnsureMarkets(v.attributes?.markets, effectiveBase, settingsData);
                            next[mk][i] = { percent: val, price };
                            setV({ ...v, attributes: { ...attrs, markets: next } });
                          }}
                        />
                      </div>
                      <div>
                        <Label>Precio</Label>
                        <NumericInput
                          value={Number(t.price)}
                          decimals={2}
                          onValueChange={(priceVal) => {
                            const base = tierPrices[i] ?? 0;
                            const rate = mk === 'AR' ? settingsData.arRate : settingsData.coRate;
                            const percent = computePercentFromPrice(Number(priceVal) || 0, base, rate);
                            const next = calcEnsureMarkets(v.attributes?.markets, tierPrices, settingsData);
                            next[mk][i] = { percent, price: Number(priceVal) || 0 };
                            setV({ ...v, attributes: { ...attrs, markets: next } });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Sección 7: Media */}
      <Card className="p-3 card-glass">
        <h4 className="font-medium mb-2">Imágenes</h4>
        <VariantImagesComponent key={imgVersion} variantId={v.id} onImagesChange={() => setImgVersion(prev => prev + 1)} />
      </Card>

      <div className="flex justify-end gap-2">
        <Button onClick={save} disabled={saving}>{saving ? "Guardando…" : "Guardar Variante"}</Button>
      </div>
    </Card>
  );
};

const VariantTiers: React.FC<{ variantId: string; onBasePricesChange?: (arr: number[]) => void }> = ({ variantId, onBasePricesChange }) => {
  const { toast } = useToast();
  const [rows, setRows] = useState<VariantPriceTier[]>([]);
  const [loading, setLoading] = useState(true);

  const ORDER_ES = ["inicial", "mayorista", "distribuidor"] as const;
  const ORDER_EN = ["initial", "wholesale", "distributor"] as const;
  const LABELS: Record<string, string> = {
    inicial: "Inicial",
    mayorista: "Mayorista",
    distribuidor: "Distribuidor",
    initial: "Inicial",
    wholesale: "Mayorista",
    distributor: "Distribuidor",
  };

  const orderIndex = (tier: string) => {
    const idxEs = ORDER_ES.indexOf(tier as any);
    if (idxEs !== -1) return idxEs;
    const idxEn = ORDER_EN.indexOf(tier as any);
    return idxEn !== -1 ? idxEn : 99;
  };

  const sortRows = (data: any[]) => [...data].sort((a, b) => orderIndex(a.tier) - orderIndex(b.tier));

  const createDefaults = async () => {
    // Try Spanish enum values first, then fallback to English
    const payloadEs = ORDER_ES.map((t) => ({ product_variant_id: variantId, tier: t as any, min_qty: 1, currency: "CNY", unit_price: 0 }));
    let inserted = false;
    let lastErr: any = null;
    const tryInsert = async (payload: any[]) => {
      const { error } = await (supabase as any).from("variant_price_tiers").insert(payload);
      if (error) throw error;
    };
    try {
      await tryInsert(payloadEs);
      inserted = true;
    } catch (e: any) {
      lastErr = e;
      const payloadEn = ORDER_EN.map((t) => ({ product_variant_id: variantId, tier: t as any, min_qty: 1, currency: "CNY", unit_price: 0 }));
      try {
        await tryInsert(payloadEn);
        inserted = true;
      } catch (e2: any) {
        lastErr = e2;
      }
    }
    if (!inserted) {
      console.error(lastErr);
      toast({ title: "Error", description: "No se pudieron crear los tiers por defecto.", variant: "destructive" });
    }
  };

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("variant_price_tiers")
      .select("*")
      .eq("product_variant_id", variantId);
    if (error) {
      setLoading(false);
      console.error(error);
      toast({ title: "Error", description: "No se pudieron cargar precios.", variant: "destructive" });
      return;
    }
    const list = (data || []) as any[];
    if (!list.length) {
      await createDefaults();
      const { data: data2 } = await (supabase as any)
        .from("variant_price_tiers")
        .select("*")
        .eq("product_variant_id", variantId);
      setRows(sortRows(data2 || []));
      setLoading(false);
      return;
    }
    setRows(sortRows(list));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [variantId]);

  useEffect(() => {
    if (!rows.length) return;
    const ordered = [...rows].sort((a, b) => orderIndex(a.tier) - orderIndex(b.tier)).slice(0, 3);
    onBasePricesChange?.(ordered.map((r) => Number(r.unit_price) || 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

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

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Proveedor (CNY) — 3 tiers</h4>
      </div>
      {loading && <p>Cargando precios…</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {rows.slice(0, 3).map((row, idx) => (
          <Card key={row.id} className="p-3">
            <div className="text-sm font-medium mb-2">{LABELS[row.tier] || `Tier ${idx + 1}`}</div>
            <div className="space-y-2">
              <div>
                <Label>Precio (CNY)</Label>
                <NumericInput
                  value={Number(row.unit_price)}
                  decimals={2}
                  onValueChange={(val) => setRows((rs) => rs.map((r) => r.id === row.id ? { ...r, unit_price: Number(val) } : r))}
                  onBlur={() => updateRow(rows.find((r) => r.id === row.id)!)}
                />
              </div>
              <div>
                <Label>Mínimo unidades</Label>
                <NumericInput
                  value={Number(row.min_qty)}
                  decimals={0}
                  onValueChange={(val) => setRows((rs) => rs.map((r) => r.id === row.id ? { ...r, min_qty: Number(val) } : r))}
                  onBlur={() => updateRow(rows.find((r) => r.id === row.id)!)}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const VariantImages: React.FC<{ variantId: string; hideHeader?: boolean }> = ({ variantId, hideHeader }) => {
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

  const setThumbnail = async (id: string) => {
    try {
      const sorted = [ ...images ].sort((a, b) => (a.id === id ? -1 : b.id === id ? 1 : (a.sort_order ?? 999) - (b.sort_order ?? 999)));
      await Promise.all(sorted.map((img, idx) => (supabase as any)
        .from('product_variant_images')
        .update({ sort_order: idx })
        .eq('id', img.id)
      ));
      await load();
      toast({ title: 'Actualizado', description: 'Thumbnail establecido.' });
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'No se pudo marcar thumbnail.', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-2">
      {!hideHeader && (
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Imágenes</h4>
          <Input type="file" accept="image/*" onChange={onFile} />
        </div>
      )}
      {loading && <p>Cargando imágenes…</p>}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {images.map((img) => {
          const isThumb = img.sort_order === 0;
          return (
            <Card key={img.id} className="p-2 space-y-2">
              <div className="relative">
                <img src={img.url} alt={img.alt ?? 'imagen variante'} className="w-full h-24 object-cover rounded" />
                {isThumb && (
                  <span className="absolute top-1 right-1 text-xs px-2 py-0.5 rounded bg-primary text-primary-foreground">Thumbnail</span>
                )}
              </div>
              <div className="flex justify-between items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => setThumbnail(img.id)} disabled={isThumb} className="w-full">
                  {isThumb ? 'Principal' : 'Hacer thumbnail'}
                </Button>
                <Button size="sm" variant="destructive" onClick={() => remove(img.id)} className="w-full">Eliminar</Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
