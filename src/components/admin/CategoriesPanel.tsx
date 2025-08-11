import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Edit, Trash2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { slugify } from "@/lib/utils";

type Category = {
  id: string;
  name: string;
  slug: string | null;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
};

const CategoriesPanel: React.FC = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", parent_id: "" });

  const loadCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");
    
    if (error) {
      toast({ title: "Error", description: "No se pudieron cargar las categorías.", variant: "destructive" });
      return;
    }
    
    setCategories(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setForm({ name: category.name, parent_id: category.parent_id || "" });
    } else {
      setEditingCategory(null);
      setForm({ name: "", parent_id: "" });
    }
    setDialogOpen(true);
  };

  const saveCategory = async () => {
    if (!form.name.trim()) {
      toast({ title: "Error", description: "El nombre es requerido.", variant: "destructive" });
      return;
    }

    const slug = slugify(form.name);
    const payload = {
      name: form.name.trim(),
      slug,
      parent_id: form.parent_id || null,
    };

    try {
      if (editingCategory) {
        const { error } = await supabase
          .from("categories")
          .update(payload)
          .eq("id", editingCategory.id);
        
        if (error) throw error;
        toast({ title: "Éxito", description: "Categoría actualizada correctamente." });
      } else {
        const { error } = await supabase
          .from("categories")
          .insert(payload);
        
        if (error) throw error;
        toast({ title: "Éxito", description: "Categoría creada correctamente." });
      }
      
      setDialogOpen(false);
      loadCategories();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Error al guardar la categoría.", variant: "destructive" });
    }
  };

  const deleteCategory = async (category: Category) => {
    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", category.id);
      
      if (error) throw error;
      
      toast({ title: "Éxito", description: "Categoría eliminada correctamente." });
      loadCategories();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Error al eliminar la categoría.", variant: "destructive" });
    }
  };

  const parentCategories = categories.filter(c => !c.parent_id);

  const getCategoryHierarchy = (category: Category): string => {
    if (!category.parent_id) return category.name;
    const parent = categories.find(c => c.id === category.parent_id);
    return parent ? `${parent.name} → ${category.name}` : category.name;
  };

  if (loading) {
    return (
      <Card className="card-glass">
        <CardContent className="p-8">
          <p>Cargando categorías...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="card-glass">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Gestión de Categorías</CardTitle>
          <Button onClick={() => openDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Categoría
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Jerarquía</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="w-[120px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                  <TableCell>{getCategoryHierarchy(category)}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      category.parent_id ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {category.parent_id ? 'Subcategoría' : 'Categoría Padre'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDialog(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Eliminar Categoría</AlertDialogTitle>
                            <AlertDialogDescription>
                              ¿Estás seguro de que quieres eliminar "{category.name}"? Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteCategory(category)}>
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nombre de la categoría"
              />
            </div>
            <div>
              <Label htmlFor="slug">Slug (generado automáticamente)</Label>
              <Input
                id="slug"
                value={slugify(form.name)}
                readOnly
                className="bg-muted"
                placeholder="El slug se genera automáticamente"
              />
            </div>
            <div>
              <Label htmlFor="parent">Categoría Padre (opcional)</Label>
              <Select value={form.parent_id} onValueChange={(value) => setForm({ ...form, parent_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría padre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin categoría padre</SelectItem>
                  {parentCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={saveCategory}>
                {editingCategory ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoriesPanel;