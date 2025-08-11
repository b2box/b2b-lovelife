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
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Languages, Truck, Layers, UserSquare, Settings, Tag, Shirt, Smartphone, Sparkles, HeartPulse, Watch, Gem, Gift, Calendar, PartyPopper, PawPrint, Home, Dumbbell, Briefcase, PencilRuler, Plug, Car, Wrench, Video } from "lucide-react";
import { VideoManager } from "./VideoManager";
import { DraggableImageManager as ImageManager, ImageItem } from "./DraggableImageManager";
import { VariantImages as VariantImagesComponent } from "./VariantImages";
import { usePricingSettings } from "@/hooks/usePricingSettings";
import { ensureMarkets as calcEnsureMarkets, recomputeMarkets, computeMarketPrice, computePercentFromPrice } from "@/lib/pricing";
import { DraggableVariantsEditor, AdminVariant } from "./DraggableVariantsEditor";

export type AdminProduct = {
  id?: string;
  name: string;
  slug?: string;
  brand?: string;
  description?: string;
  status?: "draft" | "published";
  subtitle?: string;
  bx_code?: string;
  verified_product?: boolean;
  verified_video?: boolean;
  material?: string;
  discountable?: boolean;
  agent_profile_id?: string;
  supplier_link?: string;
  supplier_model?: string;
  type?: string;
  collection?: string;
  active?: boolean;
  video_url?: string;
};

type ProductEditorProps = {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
  product?: AdminProduct | null;
};

const ProductEditor: React.FC<ProductEditorProps> = ({ open, onClose, onSaved, product }) => {
  const isEdit = !!product?.id;
  const { toast } = useToast();

  const [form, setForm] = useState<AdminProduct>({
    name: "",
    slug: "",
    brand: "",
    description: "",
    status: "draft",
    subtitle: "",
    bx_code: "",
    verified_product: false,
    verified_video: false,
    material: "",
    discountable: true,
    agent_profile_id: "",
    supplier_link: "",
    supplier_model: "",
    type: "",
    collection: "",
    active: true,
    video_url: "",
  });

  const [saving, setSaving] = useState(false);
  const [edit, setEdit] = useState<AdminVariant | null>(null);
  const [productImages, setProductImages] = useState<ImageItem[]>([]);
  const [tagsText, setTagsText] = useState("");
  const [selectedParentIds, setSelectedParentIds] = useState<string[]>([]);
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<string[]>([]);
  const [profiles, setProfiles] = useState<{id: string; display_name: string | null}[]>([]);
  const [categories, setCategories] = useState<{id: string; name: string; parent_id: string | null}[]>([]);

  const [translations, setTranslations] = useState<Record<string, { id?: string; title: string; description: string }>>({
    cn: { title: "", description: "" },
    ar: { title: "", description: "" },
    co: { title: "", description: "" },
  });

  const agentOptions = useMemo(() => {
    return profiles.filter(p => {
      const name = (p.display_name || '').toLowerCase();
      return name.includes('kerwin') || name.includes('jessica') || name.includes('gabriel');
    });
  }, [profiles]);

  const categoryIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('tag') || lower.includes('etiqueta')) return <Tag className="h-4 w-4" />;
    if (lower.includes('shirt') || lower.includes('camisa') || lower.includes('ropa')) return <Shirt className="h-4 w-4" />;
    if (lower.includes('phone') || lower.includes('telefono') || lower.includes('móvil')) return <Smartphone className="h-4 w-4" />;
    if (lower.includes('beauty') || lower.includes('belleza') || lower.includes('cosmetico')) return <Sparkles className="h-4 w-4" />;
    if (lower.includes('health') || lower.includes('salud') || lower.includes('medical')) return <HeartPulse className="h-4 w-4" />;
    if (lower.includes('watch') || lower.includes('reloj') || lower.includes('tiempo')) return <Watch className="h-4 w-4" />;
    if (lower.includes('jewelry') || lower.includes('joya') || lower.includes('accesorio')) return <Gem className="h-4 w-4" />;
    if (lower.includes('gift') || lower.includes('regalo') || lower.includes('presente')) return <Gift className="h-4 w-4" />;
    if (lower.includes('holiday') || lower.includes('fiesta') || lower.includes('celebracion')) return <Calendar className="h-4 w-4" />;
    if (lower.includes('party') || lower.includes('evento') || lower.includes('social')) return <PartyPopper className="h-4 w-4" />;
    if (lower.includes('pet') || lower.includes('mascota') || lower.includes('animal')) return <PawPrint className="h-4 w-4" />;
    if (lower.includes('home') || lower.includes('casa') || lower.includes('hogar')) return <Home className="h-4 w-4" />;
    if (lower.includes('sport') || lower.includes('deporte') || lower.includes('fitness')) return <Dumbbell className="h-4 w-4" />;
    if (lower.includes('office') || lower.includes('oficina') || lower.includes('trabajo')) return <Briefcase className="h-4 w-4" />;
    if (lower.includes('art') || lower.includes('arte') || lower.includes('creative')) return <PencilRuler className="h-4 w-4" />;
    if (lower.includes('electronic') || lower.includes('electronico') || lower.includes('device')) return <Plug className="h-4 w-4" />;
    if (lower.includes('auto') || lower.includes('car') || lower.includes('vehiculo')) return <Car className="h-4 w-4" />;
    if (lower.includes('tool') || lower.includes('herramienta') || lower.includes('repair')) return <Wrench className="h-4 w-4" />;
    return <Package className="h-4 w-4" />;
  };

  useEffect(() => {
    if (!open) return;
    setForm({
      id: product?.id || "",
      name: product?.name || "",
      slug: product?.slug || "",
      brand: product?.brand || "",
      description: product?.description || "",
      status: product?.status || "draft",
      subtitle: product?.subtitle || "",
      bx_code: product?.bx_code || "",
      verified_product: product?.verified_product ?? false,
      verified_video: product?.verified_video ?? false,
      material: product?.material || "",
      discountable: product?.discountable ?? true,
      agent_profile_id: product?.agent_profile_id || "",
      supplier_link: product?.supplier_link || "",
      supplier_model: product?.supplier_model || "",
      type: product?.type || "",
      collection: product?.collection || "",
      active: product?.active ?? true,
      video_url: product?.video_url || "",
    });

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
    <>
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
                      setForm({ ...form, name: e.target.value });
                      if (!form.slug || form.slug === slugify(form.name)) {
                        setForm((f) => ({ ...f, slug: slugify(e.target.value), name: e.target.value }));
                      }
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input id="slug" value={form.slug ?? ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="brand">Marca</Label>
                  <Input id="brand" value={form.brand ?? ""} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="bx_code">BX Code</Label>
                  <Input id="bx_code" value={form.bx_code ?? ""} onChange={(e) => setForm({ ...form, bx_code: e.target.value })} />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea id="description" value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">Categorías padre</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {categories.filter((c) => !c.parent_id).map((cat) => (
                      <label key={cat.id} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-muted">
                        <Checkbox
                          checked={selectedParentIds.includes(cat.id)}
                          onCheckedChange={(checked) => {
                            if (checked) setSelectedParentIds((prev) => [...prev, cat.id]);
                            else setSelectedParentIds((prev) => prev.filter((id) => id !== cat.id));
                          }}
                        />
                        <span className="flex items-center gap-1 text-xs">
                          {categoryIcon(cat.name)}
                          {cat.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {selectedParentIds.length > 0 && (
                  <div>
                    <Label className="mb-2 block">Subcategorías</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {categories.filter((c) => c.parent_id && selectedParentIds.includes(c.parent_id)).map((subcat) => (
                        <label key={subcat.id} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-muted">
                          <Checkbox
                            checked={selectedSubcategoryIds.includes(subcat.id)}
                            onCheckedChange={(checked) => {
                              if (checked) setSelectedSubcategoryIds((prev) => [...prev, subcat.id]);
                              else setSelectedSubcategoryIds((prev) => prev.filter((id) => id !== subcat.id));
                            }}
                          />
                          <span className="flex items-center gap-1 text-xs">
                            {categoryIcon(subcat.name)}
                            {subcat.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="tags">Tags (separados por coma)</Label>
                  <Input
                    id="tags"
                    value={tagsText}
                    onChange={(e) => setTagsText(e.target.value)}
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>Cerrar</Button>
                <Button onClick={saveProduct} disabled={saving}>{saving ? "Guardando…" : "Guardar"}</Button>
              </div>
            </TabsContent>

            <TabsContent value="multilingual" className="space-y-4">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-4 w-6 items-center justify-center rounded bg-muted text-xs">AR</span>
                    <h4 className="font-medium">Argentina (AR)</h4>
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
                    <span className="inline-flex h-4 w-6 items-center justify-center rounded bg-muted text-xs">CO</span>
                    <h4 className="font-medium">Colombia (CO)</h4>
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
                <DraggableVariantsEditor 
                  productId={form.id!} 
                  onVariantEdit={(variant) => setEdit(variant)}
                />
              ) : (
                <Card className="p-4">
                  <p className="text-sm mb-3">Primero guarda el producto para poder crear variantes.</p>
                  <Button onClick={saveProduct} disabled={saving}>{saving ? "Guardando…" : "Guardar producto"}</Button>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="media" className="space-y-4">
              <VideoManager
                productId={form.id || 'temp'}
                currentVideoUrl={form.video_url}
                onVideoUpdate={(videoUrl) => setForm({ ...form, video_url: videoUrl })}
              />
              
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
                          onCheckedChange={(val) => setForm({ ...form, agent_profile_id: val ? id : "" })}
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
                          onCheckedChange={(val) => setForm({ ...form, agent_profile_id: val ? id : "" })}
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
                          onCheckedChange={(val) => setForm({ ...form, agent_profile_id: val ? id : "" })}
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
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Activo</Label>
                  <Switch
                    checked={!!form.active}
                    onCheckedChange={(v) => setForm({ ...form, active: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Verificado (Producto)</Label>
                  <Switch
                    checked={!!form.verified_product}
                    onCheckedChange={(v) => setForm({ ...form, verified_product: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Verificado (Video)</Label>
                  <Switch
                    checked={!!form.verified_video}
                    onCheckedChange={(v) => setForm({ ...form, verified_video: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Publicado</Label>
                  <Switch
                    checked={form.status === 'published'}
                    onCheckedChange={(v) => setForm({ ...form, status: v ? 'published' : 'draft' })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>Cerrar</Button>
                <Button onClick={saveProduct} disabled={saving}>{saving ? "Guardando…" : "Guardar"}</Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent className="w-[95vw] max-w-5xl max-h-[85vh] overflow-y-auto">
          {edit && <VariantCard variant={edit} onChanged={() => setEdit(null)} />}
        </DialogContent>
      </Dialog>
    </>
  );
};

const VariantCard: React.FC<{ variant: AdminVariant; onChanged: () => void }> = ({ variant, onChanged }) => {
  const { toast } = useToast();
  const [v, setV] = useState<AdminVariant>(variant);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from("product_variants").update({
        name: v.name,
        sku: v.sku,
        stock: v.stock,
        active: v.active,
      }).eq("id", v.id);
      if (error) throw error;
      toast({ title: "Guardado", description: "Variante guardada correctamente." });
      onChanged();
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "No se pudo guardar la variante.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => setV(variant), [variant]);

  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label>Título</Label>
          <Input value={v.name ?? ""} onChange={(e) => setV({ ...v, name: e.target.value })} />
        </div>
        <div>
          <Label>SKU</Label>
          <Input value={v.sku ?? ""} onChange={(e) => setV({ ...v, sku: e.target.value })} />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Button onClick={save} disabled={saving}>{saving ? "Guardando…" : "Guardar"}</Button>
      </div>
    </Card>
  );
};

export default ProductEditor;