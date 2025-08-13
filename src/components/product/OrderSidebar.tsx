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
          <div className="bg-white border border-[#E5E7EB] rounded-[24px] p-3 shadow-sm">
            {/* Header with green check */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-[22px] font-semibold text-[#0A0A0A]">Orden mínima $100</span>
              <div className="w-6 h-6 bg-[#22C55E] rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Green progress bar */}
            <div className="h-[6px] bg-[#22C55E] rounded-full mb-4"></div>

            {/* CTA Button */}
            <button
              onClick={addToCart}
              className="w-full bg-[#FF4D00] text-white rounded-[16px] py-3 font-medium text-[16px] hover:bg-[#E6440A] transition-colors mb-4"
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