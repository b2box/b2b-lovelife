import { CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import VariantsTable from "./VariantsTable";
import type { ProductVariant } from "@/hooks/useProductVariants";

export type VariantRow = {
  id: string;
  variant: ProductVariant;
  qty: number;
  comps: { labeling: boolean; barcode: boolean; photos: boolean; packaging: boolean };
};

interface OrderSidebarProps {
  rows: VariantRow[];
  selectedTier: "inicial" | "mayorista" | "distribuidor";
  selectedVariantId: string | null;
  market: string;
  content: any;
  onRowsChange: (rows: VariantRow[]) => void;
  onTierChange: (tier: "inicial" | "mayorista" | "distribuidor") => void;
  onVariantSelect: (variantId: string) => void;
  totals: {
    items: number;
    products: number;
    complements: number;
    total: number;
  };
}

const OrderSidebar = ({
  rows,
  selectedTier,
  selectedVariantId,
  market,
  content,
  onRowsChange,
  onTierChange,
  onVariantSelect,
  totals
}: OrderSidebarProps) => {
  const { toast } = useToast();
  const minOrder = 100;

  const addToCart = () => {
    if (totals.total < minOrder) {
      toast({ title: content.minOrderText, description: "Agrega más productos para continuar." });
      return;
    }
    toast({ title: "Añadido al carrito", description: `${totals.items} unidades agregadas.` });
  };

  return (
    <aside className="hidden md:block w-[320px] flex-shrink-0">
      <div className="sticky top-6 z-10" style={{ position: 'sticky' }}>
        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="bg-card border border-border rounded-3xl p-3 shadow-elevate">
            {/* Header with green check */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xl font-semibold text-foreground">Orden mínima $100</span>
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Green progress bar */}
            <div className="h-1.5 bg-green-500 rounded-full mb-4"></div>

            {/* CTA Button */}
            <button
              onClick={addToCart}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl py-3 font-medium text-base hover:from-orange-600 hover:to-red-600 transition-all duration-200 mb-4 shadow-sm"
            >
              Pedir ahora ${totals.total.toFixed(2)}
            </button>

            {/* Variants Table */}
            <VariantsTable
              rows={rows}
              selectedTier={selectedTier}
              selectedVariantId={selectedVariantId}
              market={market}
              onRowsChange={onRowsChange}
              onTierChange={onTierChange}
              onVariantSelect={onVariantSelect}
            />
          </div>
        </div>
      </div>
    </aside>
  );
};

export default OrderSidebar;