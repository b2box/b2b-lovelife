import React, { useState, useEffect } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Collection {
  id: string;
  name: string;
  slug: string | null;
}

interface CollectionSelectorProps {
  selectedCollections: string[];
  onCollectionsChange: (collections: string[]) => void;
  placeholder?: string;
}

export const CollectionSelector: React.FC<CollectionSelectorProps> = ({
  selectedCollections,
  onCollectionsChange,
  placeholder = "Seleccionar colecciones..."
}) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("collection")
        .select("id, name, slug")
        .order("name", { ascending: true });

      if (error) throw error;
      setCollections(data || []);
    } catch (error) {
      console.error("Error loading collections:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las colecciones",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleCollection = (collectionId: string) => {
    const isSelected = selectedCollections.includes(collectionId);
    if (isSelected) {
      onCollectionsChange(selectedCollections.filter(id => id !== collectionId));
    } else {
      onCollectionsChange([...selectedCollections, collectionId]);
    }
  };

  const removeCollection = (collectionId: string) => {
    onCollectionsChange(selectedCollections.filter(id => id !== collectionId));
  };

  const selectedCollectionNames = collections
    .filter(collection => selectedCollections.includes(collection.id))
    .map(collection => collection.name);

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-left font-normal"
          >
            <span className="truncate">
              {selectedCollections.length === 0
                ? placeholder
                : `${selectedCollections.length} colección${selectedCollections.length !== 1 ? 'es' : ''} seleccionada${selectedCollections.length !== 1 ? 's' : ''}`
              }
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 bg-background border shadow-md" style={{ width: 'var(--radix-popover-trigger-width)' }}>
          <Command>
            <CommandInput placeholder="Buscar colecciones..." />
            <CommandList>
              {loading ? (
                <CommandEmpty>Cargando colecciones...</CommandEmpty>
              ) : collections.length === 0 ? (
                <CommandEmpty>No hay colecciones disponibles.</CommandEmpty>
              ) : (
                <>
                  <CommandEmpty>No se encontraron colecciones.</CommandEmpty>
                  <CommandGroup>
                    {collections.map((collection) => (
                      <CommandItem
                        key={collection.id}
                        value={collection.name}
                        onSelect={() => toggleCollection(collection.id)}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center space-x-2">
                          <div className={`w-4 h-4 border-2 rounded ${
                            selectedCollections.includes(collection.id) 
                              ? 'bg-primary border-primary' 
                              : 'border-muted-foreground'
                          }`}>
                            {selectedCollections.includes(collection.id) && (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                              </div>
                            )}
                          </div>
                          <span>{collection.name}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected Collections */}
      {selectedCollections.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCollectionNames.map((name, index) => {
            const collectionId = selectedCollections[index];
            return (
              <Badge key={collectionId} variant="secondary" className="flex items-center gap-1">
                {name}
                <button
                  type="button"
                  onClick={() => removeCollection(collectionId)}
                  className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
};