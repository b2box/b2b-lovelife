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
import { VariantPricingEditor } from "./VariantPricingEditor";
import { CollectionSelector } from "./CollectionSelector";
import { useUserRole } from "@/hooks/useUserRole";
import { VariantEditor } from "./VariantEditor";

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
  const { userRole } = useUserRole();

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

  const [initialForm, setInitialForm] = useState<AdminProduct>(form);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [edit, setEdit] = useState<AdminVariant | null>(null);
  const [productImages, setProductImages] = useState<ImageItem[]>([]);
  const [verifiedImages, setVerifiedImages] = useState<ImageItem[]>([]);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([]);
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
    const currentForm = {
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
    };
    
    setForm(currentForm);
    setInitialForm(currentForm);
    setHasUnsavedChanges(false);

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
        
        // Load collections for this product
        const { data: productCollections } = await supabase
          .from("product_collections")
          .select("collection_id")
          .eq("product_id", product.id);
        
        if (productCollections) {
          setSelectedCollectionIds(productCollections.map(pc => pc.collection_id));
        }

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
        setSelectedCollectionIds([]);
        setTranslations({ cn: { title: "", description: "" }, ar: { title: "", description: "" }, co: { title: "", description: "" } });
      }
    })();
  }, [open, product?.id]);

  // Track changes for unsaved warning
  useEffect(() => {
    if (!open) return;
    
    // Create initial state for collections and categories if editing
    const initialCollectionIds = product?.id ? selectedCollectionIds : [];
    const initialParentIds = product?.id ? selectedParentIds : [];
    const initialSubcategoryIds = product?.id ? selectedSubcategoryIds : [];
    
    const hasFormChanges = JSON.stringify(form) !== JSON.stringify(initialForm);
    const hasCollectionChanges = product?.id && JSON.stringify(selectedCollectionIds) !== JSON.stringify(initialCollectionIds);
    const hasCategoryChanges = product?.id && (
      JSON.stringify(selectedParentIds) !== JSON.stringify(initialParentIds) ||
      JSON.stringify(selectedSubcategoryIds) !== JSON.stringify(initialSubcategoryIds)
    );
    
    setHasUnsavedChanges(hasFormChanges || hasCollectionChanges || hasCategoryChanges);
  }, [form, initialForm, selectedCollectionIds, selectedParentIds, selectedSubcategoryIds, open, product?.id]);

  // Auto-generate slug when name changes
  const handleNameChange = (name: string) => {
    const newSlug = slugify(name);
    setForm(prev => ({ 
      ...prev, 
      name, 
      slug: newSlug 
    }));
  };

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

      // Handle collections
      // Delete existing product_collections
      await supabase.from("product_collections").delete().eq("product_id", productId);
      
      // Insert new product_collections
      if (selectedCollectionIds.length > 0) {
        const productCollectionsToInsert = selectedCollectionIds.map(collectionId => ({
          product_id: productId,
          collection_id: collectionId,
        }));
        
        const { error: collectionsError } = await supabase
          .from("product_collections")
          .insert(productCollectionsToInsert);
        
        if (collectionsError) {
          console.error("Error saving product collections:", collectionsError);
        }
      }
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
            agent_profile_id: form.agent_profile_id || null,
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
            agent_profile_id: form.agent_profile_id || null,
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
      
      // Update initial form state to reflect saved state
      const updatedForm = { ...form };
      setInitialForm(updatedForm);
      setHasUnsavedChanges(false);
      
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
      <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
        <DialogContent className="w-[95vw] max-w-5xl max-h-[85vh] overflow-y-auto bg-background border border-border shadow-lg">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Editar producto" : "Nuevo producto"}</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="producto" className="w-full">
            <TabsList>
              <TabsTrigger value="producto" className="gap-2"><Package size={16} /> Producto</TabsTrigger>
              <TabsTrigger value="multilingual" className="gap-2"><Languages size={16} /> Contenido</TabsTrigger>
              <TabsTrigger value="supplier" className="gap-2"><Truck size={16} /> Proveedor</TabsTrigger>
              <TabsTrigger value="variantes" className="gap-2"><Layers size={16} /> Variantes</TabsTrigger>
              <TabsTrigger value="media" className="gap-2"><Video size={16} /> Media</TabsTrigger>
              {userRole === 'admin' && <TabsTrigger value="agente" className="gap-2"><UserSquare size={16} /> Agente</TabsTrigger>}
              {userRole === 'admin' && <TabsTrigger value="status" className="gap-2"><Settings size={16} /> Status</TabsTrigger>}
            </TabsList>

            <TabsContent value="producto" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Título</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug (generado automáticamente)</Label>
                  <Input 
                    id="slug" 
                    value={form.slug ?? ""} 
                    readOnly 
                    className="bg-muted text-muted-foreground" 
                    placeholder="Se genera automáticamente del título..."
                  />
                </div>
                <div>
                  <Label htmlFor="bx_code">BX Code</Label>
                  <Input id="bx_code" value={form.bx_code ?? ""} onChange={(e) => setForm({ ...form, bx_code: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="mb-2 block">Categorías padre</Label>
                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto border rounded p-2">
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
                    <div className="space-y-3 max-h-48 overflow-y-auto border rounded p-2">
                      {selectedParentIds.map((parentId) => {
                        const parent = categories.find(c => c.id === parentId);
                        const subcategories = categories.filter((c) => c.parent_id === parentId);
                        if (!parent || subcategories.length === 0) return null;
                        
                        return (
                          <div key={parentId} className="space-y-2">
                            <div className="text-xs font-medium text-muted-foreground border-b pb-1">
                              {parent.name}
                            </div>
                            <div className="grid grid-cols-1 gap-1 pl-2">
                              {subcategories.map((subcat) => (
                                <label key={subcat.id} className="flex items-center gap-2 p-1 rounded cursor-pointer hover:bg-muted/50">
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
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="collections">Colecciones</Label>
                <CollectionSelector
                  selectedCollections={selectedCollectionIds}
                  onCollectionsChange={setSelectedCollectionIds}
                  placeholder="Seleccionar colecciones..."
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleClose}>Cerrar</Button>
                <Button onClick={saveProduct} disabled={saving}>{saving ? "Guardando…" : "Guardar"}</Button>
              </div>
            </TabsContent>

            <TabsContent value="multilingual" className="space-y-4">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <img src="/images/flags/ar.svg" alt="Argentina" className="w-6 h-4 rounded-sm border" />
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
                    <img src="/images/flags/co.svg" alt="Colombia" className="w-6 h-4 rounded-sm border" />
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
                    <div className="w-6 h-4 bg-red-600 rounded-sm border flex items-center justify-center text-xs text-white font-bold">中</div>
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
                <Button variant="outline" onClick={handleClose}>Cerrar</Button>
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
                <Button variant="outline" onClick={handleClose}>Cerrar</Button>
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
                  <p className="text-sm text-muted-foreground mb-3">Guarda el producto primero para poder gestionar variantes.</p>
                  <Button onClick={saveProduct} disabled={saving || !form.name.trim()}>
                    {saving ? "Guardando…" : "Guardar producto"}
                  </Button>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="media" className="space-y-6">
              {/* Video Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Video del producto
                </h3>
                <VideoManager
                  productId={form.id || 'temp'}
                  currentVideoUrl={form.video_url}
                  onVideoUpdate={(videoUrl) => setForm({ ...form, video_url: videoUrl })}
                />
              </div>

              {/* Regular Images Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Imágenes del producto
                </h3>
                <p className="text-sm text-muted-foreground">
                  Imágenes principales del producto que serán visibles para los clientes
                </p>
                <Card className="p-4">
                  <ImageManager
                    productId={form.id || 'temp'}
                    images={productImages}
                    onImagesUpdate={setProductImages}
                  />
                </Card>
              </div>

              {/* Verified Images Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-green-600" />
                  Imágenes verificadas
                </h3>
                <p className="text-sm text-muted-foreground">
                  Imágenes que han sido verificadas y aprobadas para mostrar como contenido premium
                </p>
                <Card className="p-4 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                  <ImageManager
                    productId={form.id || 'temp'}
                    images={verifiedImages}
                    onImagesUpdate={setVerifiedImages}
                  />
                </Card>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleClose}>Cerrar</Button>
                <Button onClick={saveProduct} disabled={saving}>{saving ? "Guardando…" : "Guardar producto"}</Button>
              </div>
            </TabsContent>


            {userRole === 'admin' && (
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
                  <Button variant="outline" onClick={handleClose}>Cerrar</Button>
                  <Button onClick={saveProduct} disabled={saving}>{saving ? "Guardando…" : "Guardar"}</Button>
                </div>
              </TabsContent>
            )}

            {userRole === 'admin' && (
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
                  <Button variant="outline" onClick={handleClose}>Cerrar</Button>
                  <Button onClick={saveProduct} disabled={saving}>{saving ? "Guardando…" : "Guardar"}</Button>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </DialogContent>
      </Dialog>

      <VariantEditor 
        variant={edit} 
        isOpen={!!edit} 
        onClose={() => setEdit(null)}
        onSave={() => setEdit(null)}
      />
    </>
  );
};

export default ProductEditor;