
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Edit, Trash2, Copy, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import ProductEditor, { AdminProduct } from "./ProductEditor";

type Product = {
  id: string;
  name: string;
  bx_code: string;
  slug: string;
  status: "draft" | "published";
  collection: string;
  created_at: string;
  updated_at: string;
  product_variants: Array<{
    id: string;
    name: string;
    sku: string;
    product_variant_images: Array<{
      id: string;
      url: string;
      alt: string;
      sort_order: number;
    }>;
  }>;
  product_categories: Array<{
    category_id: string;
    categories: {
      id: string;
      name: string;
    };
  }>;
  product_collections: Array<{
    collection_id: string;
    collection: {
      id: string;
      name: string;
    };
  }>;
};

const ITEMS_PER_PAGE = 50;

const fetchProducts = async (page: number, search: string, statusFilter: string, categoryFilter: string, collectionFilter: string) => {
  const offset = (page - 1) * ITEMS_PER_PAGE;
  
  let query = supabase
    .from("products")
    .select(`
      id,
      name,
      bx_code,
      slug,
      status,
      collection,
      created_at,
      updated_at,
      product_variants!left(
        id,
        name,
        sku,
        product_variant_images!left(
          id,
          url,
          alt,
          sort_order
        )
      ),
      product_categories:product_categories(
        category_id,
        categories:categories(id, name)
      ),
      product_collections:product_collections(
        collection_id,
        collection:collection(id, name)
      )
    `, { count: 'exact' })
    .order("updated_at", { ascending: false })
    .range(offset, offset + ITEMS_PER_PAGE - 1);

  // Apply filters
  if (search.trim()) {
    query = query.or(`name.ilike.%${search}%,bx_code.ilike.%${search}%`);
  }
  
  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter as "draft" | "published");
  }
  
  if (collectionFilter && collectionFilter !== "all") {
    const { data: productIds } = await supabase
      .from("product_collections")
      .select("product_id")
      .eq("collection_id", collectionFilter);
    
    if (productIds && productIds.length > 0) {
      query = query.in("id", productIds.map(pt => pt.product_id));
    } else {
      // No products with this tag
      return { products: [], totalCount: 0 };
    }
  }

  if (categoryFilter && categoryFilter !== "all") {
    const { data: productIds } = await supabase
      .from("product_categories")
      .select("product_id")
      .eq("category_id", categoryFilter);
    
    if (productIds && productIds.length > 0) {
      query = query.in("id", productIds.map(pc => pc.product_id));
    } else {
      // No products in this category
      return { products: [], totalCount: 0 };
    }
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching products:", error);
    throw new Error("Error al cargar productos");
  }

  return { 
    products: data as Product[] || [], 
    totalCount: count || 0 
  };
};

const fetchFilterOptions = async () => {
  const [categoriesRes, collectionsRes] = await Promise.all([
    supabase.from("categories").select("id, name, parent_id").is("parent_id", null).order("name"),
    supabase.from("collection").select("id, name").order("name")
  ]);

  const categories = categoriesRes.data || [];
  const collections = collectionsRes.data || [];

  return { categories, collections };
};


const ProductsPanel: React.FC = () => {
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Product | null>(null);
  const [duplicateConfirm, setDuplicateConfirm] = useState<Product | null>(null);
  
  // Filters and search
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [collectionFilter, setCollectionFilter] = useState("all");

  const { data: filterOptions } = useQuery({
    queryKey: ["filter-options"],
    queryFn: fetchFilterOptions,
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["products", currentPage, searchTerm, statusFilter, categoryFilter, collectionFilter],
    queryFn: () => fetchProducts(currentPage, searchTerm, statusFilter, categoryFilter, collectionFilter),
  });

  const products = data?.products || [];
  const totalPages = Math.ceil((data?.totalCount || 0) / ITEMS_PER_PAGE);


  const duplicateProduct = async (product: Product) => {
    try {
      console.log("Starting duplication for product:", product.id, product.name);
      
      // Fetch complete product data with variants and images
      const { data: fullProduct, error: fetchError } = await supabase
        .from("products")
        .select(`
          *,
          product_variants!inner(
            *,
            product_variant_images!left(*)
          )
        `)
        .eq("id", product.id)
        .maybeSingle();

      console.log("Fetch result:", { fullProduct, fetchError });

      if (fetchError) throw fetchError;
      if (!fullProduct) throw new Error("Producto no encontrado");

      // Create unique bx_code by appending timestamp
      const timestamp = Date.now();
      const newBxCode = fullProduct.bx_code ? `${fullProduct.bx_code}-${timestamp}` : `DUP-${timestamp}`;

      console.log("Creating product with new BX code:", newBxCode);

      // Duplicate the main product (exclude nested relationships)
      const productData = {
        name: `${fullProduct.name} (Copia)`,
        slug: `${fullProduct.slug}-copia-${timestamp}`,
        bx_code: newBxCode,
        description: fullProduct.description,
        brand: fullProduct.brand,
        subtitle: fullProduct.subtitle,
        material: fullProduct.material,
        supplier_link: fullProduct.supplier_link,
        supplier_model: fullProduct.supplier_model,
        type: fullProduct.type,
        collection: fullProduct.collection,
        verified_product: fullProduct.verified_product,
        verified_video: fullProduct.verified_video,
        video_url: fullProduct.video_url,
        agent_profile_id: fullProduct.agent_profile_id,
        discountable: fullProduct.discountable,
        status: fullProduct.status
      };

      const { data: newProduct, error: productError } = await supabase
        .from("products")
        .insert(productData)
        .select("id")
        .maybeSingle();

      console.log("Product creation result:", { newProduct, productError });

      if (productError) throw productError;
      if (!newProduct?.id) throw new Error("Error al crear producto duplicado");

      console.log("New product created with ID:", newProduct.id);
      console.log("Variants to duplicate:", fullProduct.product_variants?.length || 0);

      // Duplicate variants and their images
      for (const variant of fullProduct.product_variants || []) {
        console.log("Duplicating variant:", variant.id, variant.name);
        
        const { data: newVariant, error: variantError } = await supabase
          .from("product_variants")
          .insert({
            ...variant,
            id: undefined,
            product_id: newProduct.id,
            created_at: undefined,
            updated_at: undefined,
          })
          .select("id")
          .maybeSingle();

        console.log("Variant creation result:", { newVariant, variantError });

        if (variantError) {
          console.error("Error duplicating variant:", variantError);
          continue;
        }

        if (!newVariant?.id) continue;

        console.log("New variant created with ID:", newVariant.id);
        console.log("Images to duplicate:", variant.product_variant_images?.length || 0);

        // Duplicate variant images
        for (const image of variant.product_variant_images || []) {
          console.log("Duplicating image:", image.id, image.url);
          
          const { error: imageError } = await supabase
            .from("product_variant_images")
            .insert({
              ...image,
              id: undefined,
              product_variant_id: newVariant.id,
              created_at: undefined,
            });

          if (imageError) {
            console.error("Error duplicating variant image:", imageError);
          } else {
            console.log("Image duplicated successfully");
          }
        }
      }

      console.log("Duplication completed successfully");
      toast.success("Producto duplicado correctamente");
      refetch();
    } catch (error: any) {
      console.error("Error duplicating product:", error);
      toast.error(`No se pudo duplicar el producto: ${error.message}`);
    }
  };

  const deleteProduct = async (product: Product) => {
    try {
      const { error } = await supabase.from("products").delete().eq("id", product.id);
      if (error) throw error;
      toast.success("Producto eliminado");
      setDeleteConfirm(null);
      refetch();
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast.error("No se pudo eliminar el producto.");
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (type: string, value: string) => {
    if (type === "status") setStatusFilter(value);
    else if (type === "category") setCategoryFilter(value);
    else if (type === "collection") setCollectionFilter(value);
    setCurrentPage(1);
  };

  const getProductThumbnail = (product: Product) => {
    const firstVariant = product.product_variants?.[0];
    const firstImage = firstVariant?.product_variant_images?.[0];
    return firstImage?.url || "/placeholder.svg";
  };

  const getProductCategories = (product: Product) => {
    return product.product_categories?.map(pc => pc.categories?.name).filter(Boolean).join(", ") || "-";
  };

  const getProductCollections = (product: Product) => {
    return product.product_collections?.map(pc => pc.collection?.name).filter(Boolean).join(", ") || "-";
  };

  return (
    <Card className="p-6 card-glass">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Productos</h2>
        <Button onClick={() => { setEditingProduct(null); setShowEditor(true); }}>
          Nuevo producto
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, BX CODE o PA CODE..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Filter className="h-4 w-4 text-muted-foreground" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select value={statusFilter} onValueChange={(value) => handleFilterChange("status", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="draft">Borrador</SelectItem>
              <SelectItem value="published">Publicado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={(value) => handleFilterChange("category", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {filterOptions?.categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={collectionFilter} onValueChange={(value) => handleFilterChange("collection", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Colección" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las colecciones</SelectItem>
              {filterOptions?.collections.map((collection) => (
                <SelectItem key={collection.id} value={collection.id}>
                  {collection.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Products Table */}
      {isLoading ? (
        <div className="text-center py-8">Cargando productos...</div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Imagen</TableHead>
                  <TableHead>BX CODE</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Categorías</TableHead>
                  <TableHead>Colección</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <img
                        src={getProductThumbnail(product)}
                        alt={product.name}
                        className="w-10 h-10 object-cover object-center rounded"
                      />
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {product.bx_code || "-"}
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <Badge variant={product.status === "published" ? "default" : "secondary"}>
                        {product.status === "published" ? "Publicado" : "Borrador"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {getProductCategories(product)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {getProductCollections(product)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingProduct(product as AdminProduct);
                            setShowEditor(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDuplicateConfirm(product)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm(product)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={() => setCurrentPage(pageNum)}
                        isActive={currentPage === pageNum}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
          
          <div className="text-sm text-muted-foreground text-center">
            Página {currentPage} de {totalPages} ({data?.totalCount || 0} productos en total)
          </div>
        </div>
      )}

      {/* Product Editor */}
      <ProductEditor
        open={showEditor}
        onClose={() => setShowEditor(false)}
        onSaved={() => {
          refetch();
          // Don't close the editor after saving
        }}
        product={editingProduct}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El producto "{deleteConfirm?.name}" será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteConfirm && deleteProduct(deleteConfirm)}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Duplicate Confirmation */}
      <AlertDialog open={!!duplicateConfirm} onOpenChange={(open) => !open && setDuplicateConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar duplicación?</AlertDialogTitle>
            <AlertDialogDescription>
              Se creará una copia del producto "{duplicateConfirm?.name}" con todas sus variantes e imágenes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (duplicateConfirm) {
                duplicateProduct(duplicateConfirm);
                setDuplicateConfirm(null);
              }
            }}>
              Duplicar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default ProductsPanel;

