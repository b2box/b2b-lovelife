import { CheckCircle2 } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface OrderSummaryPanelProps {
  content: {
    cartButtonText: string;
    currencySymbol: string;
    features: {
      shipping: { description: string };
      customization: { description: string };
    };
  };
  totals: {
    total: number;
    items: number;
    products: number;
    complements: number;
  };
  minOrder: number;
  addToCart: () => void;
}

export function OrderSummaryPanel({ 
  content, 
  totals, 
  minOrder, 
  addToCart 
}: OrderSummaryPanelProps) {
  return (
    <aside className="hidden md:block w-[320px] flex-shrink-0">
      <div className="sticky top-6 z-10" style={{ position: 'sticky' }}>
        
          
            {/* Encabezado con check verde */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-[22px] font-semibold text-[#0A0A0A]">Orden mínima $100</span>
              <div className="w-6 h-6 bg-[#22C55E] rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Barra de progreso verde */}
            <div className="h-[6px] bg-[#22C55E] rounded-full mb-4"></div>

            {/* Botón CTA */}
            <button
              onClick={addToCart}
              className="w-full h-16 rounded-[24px] bg-[#BBF7D0] text-[#0A0A0A] text-[20px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 mb-5"
              aria-label={content.cartButtonText}
              disabled={totals.total < minOrder}
            >
              Añadir al carrito
            </button>

            {/* Bloque de totales sin fondo */}
            <div className="px-0 py-5 mb-5">
              <div className="space-y-3">
                <div className="flex justify-between text-[18px] text-[#0A0A0A]">
                  <span>Productos ({totals.items})</span>
                  <span>{content.currencySymbol}{totals.products.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-[18px] text-[#0A0A0A]">
                  <span>Complementos</span>
                  <span>{content.currencySymbol}{totals.complements.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-[22px] font-bold text-[#0A0A0A] pt-2">
                  <span>Total</span>
                  <span>{content.currencySymbol}{totals.total.toFixed(0)}</span>
                </div>
              </div>
            </div>

            {/* Tarjetas de features */}
            <div className="grid grid-cols-3 gap-2">
              {/* Método de envío */}
              <HoverCard>
                <HoverCardTrigger asChild>
                  <div className="relative w-[100px] h-[100px] rounded-[20px] border border-[#E5E7EB] bg-white p-3 cursor-default flex flex-col items-center justify-center text-center opacity-60">
                    <img src="/lovable-uploads/bcaad47c-1390-4a6e-a192-4c5279337cf3.png" alt="Método de envío" className="h-6 w-auto mb-2" loading="lazy" />
                    <span className="text-[12px] text-[#6B7280] leading-tight">Método de envío</span>
                    <div className="absolute top-2 right-2 w-4 h-4 bg-[#6B7280] text-white rounded-full flex items-center justify-center text-[10px] font-bold">?</div>
                  </div>
                </HoverCardTrigger>
                <HoverCardContent side="top" align="end" className="w-64 p-3 text-xs">
                  {content.features.shipping.description}
                </HoverCardContent>
              </HoverCard>

              {/* Personalizar producto */}
              <HoverCard>
                <HoverCardTrigger asChild>
                  <div className="relative w-[100px] h-[100px] rounded-[20px] border border-[#E5E7EB] bg-white p-3 cursor-default flex flex-col items-center justify-center text-center opacity-60">
                    <img src="/lovable-uploads/e176248e-ec33-4374-8df2-39c6d1d81194.png" alt="Personalizar producto" className="h-6 w-auto mb-2" loading="lazy" />
                    <span className="text-[12px] text-[#6B7280] leading-tight">Personalizar producto</span>
                    <div className="absolute top-2 right-2 w-4 h-4 bg-[#6B7280] text-white rounded-full flex items-center justify-center text-[10px] font-bold">?</div>
                  </div>
                </HoverCardTrigger>
                <HoverCardContent side="top" align="center" className="w-64 p-3 text-xs">
                  {content.features.customization.description}
                </HoverCardContent>
              </HoverCard>

              {/* Precios sin sorpresas */}
              <HoverCard>
                <HoverCardTrigger asChild>
                  <div className="relative w-[100px] h-[100px] rounded-[20px] border border-[#E5E7EB] bg-white p-3 cursor-default flex flex-col items-center justify-center text-center opacity-60">
                    <img src="/lovable-uploads/6a45e477-73d7-45a9-9eda-470e2c37a6cb.png" alt="Precios sin sorpresas" className="h-6 w-auto mb-2" loading="lazy" />
                    <span className="text-[12px] text-[#6B7280] leading-tight">Precios sin sorpresas</span>
                    <div className="absolute top-2 right-2 w-4 h-4 bg-[#6B7280] text-white rounded-full flex items-center justify-center text-[10px] font-bold">?</div>
                  </div>
                </HoverCardTrigger>
                <HoverCardContent side="top" align="start" className="w-64 p-3 text-xs">
                  Transparencia total: desglose de costos, sin cargos ocultos al confirmar tu orden.
                </HoverCardContent>
              </HoverCard>
        </div>
      </div>
    </aside>
  );
}