import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Edit, Trash2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { slugify } from "@/lib/utils";

type Collection = {
  id: string;
  name: string;
  slug: string | null;
  created_at: string;
};

const CollectionsPanel: React.FC = () => {
  const { toast } = useToast();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [form, setForm] = useState({ name: "" });

  const loadCollections = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("collection")
      .select("*")
      .order("name");
    
    if (error) {
      toast({ title: "Error", description: "No se pudieron cargar las colecciones.", variant: "destructive" });
      return;
    }
    
    setCollections(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadCollections();
  }, []);

  const openDialog = (collection?: Collection) => {
    if (collection) {
      setEditingCollection(collection);
      setForm({ name: collection.name });
    } else {
      setEditingCollection(null);
      setForm({ name: "" });
    }
    setDialogOpen(true);
  };

  const saveCollection = async () => {
    if (!form.name.trim()) {
      toast({ title: "Error", description: "El nombre es requerido.", variant: "destructive" });
      return;
    }

    const slug = slugify(form.name);
    const payload = {
      name: form.name.trim(),
      slug,
    };

    try {
      if (editingCollection) {
        const { error } = await supabase
          .from("collection")
          .update(payload)
          .eq("id", editingCollection.id);
        
        if (error) throw error;
        toast({ title: "Éxito", description: "Colección actualizada correctamente." });
      } else {
        const { error } = await supabase
          .from("collection")
          .insert(payload);
        
        if (error) throw error;
        toast({ title: "Éxito", description: "Colección creada correctamente." });
      }
      
      setDialogOpen(false);
      loadCollections();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Error al guardar la colección.", variant: "destructive" });
    }
  };

  const deleteCollection = async (collection: Collection) => {
    try {
      // Check if collection is being used
      const { data: usageData } = await supabase
        .from("product_collections")
        .select("id")
        .eq("collection_id", collection.id)
        .limit(1);

      if (usageData && usageData.length > 0) {
        toast({ 
          title: "Error", 
          description: "No se puede eliminar la colección porque está siendo usada por productos.", 
          variant: "destructive" 
        });
        return;
      }

      const { error } = await supabase
        .from("collection")
        .delete()
        .eq("id", collection.id);
      
      if (error) throw error;
      
      toast({ title: "Éxito", description: "Colección eliminada correctamente." });
      loadCollections();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Error al eliminar la colección.", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <Card className="card-glass">
        <CardContent className="p-8">
          <p>Cargando colecciones...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="card-glass">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Gestión de Colecciones</CardTitle>
          <Button onClick={() => openDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Colección
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Fecha de Creación</TableHead>
                <TableHead className="w-[120px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collections.map((collection) => (
                <TableRow key={collection.id}>
                  <TableCell className="font-medium">{collection.name}</TableCell>
                  <TableCell className="text-muted-foreground">{collection.slug}</TableCell>
                  <TableCell>{new Date(collection.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDialog(collection)}
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
                            <AlertDialogTitle>Eliminar Colección</AlertDialogTitle>
                            <AlertDialogDescription>
                              ¿Estás seguro de que quieres eliminar "{collection.name}"? Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteCollection(collection)}>
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
              {editingCollection ? "Editar Colección" : "Nueva Colección"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nombre de la colección"
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
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={saveCollection}>
                {editingCollection ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CollectionsPanel;