
import React from "react";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Package, ShoppingCart, Boxes, Users, Percent, Tag } from "lucide-react";
import ProductsPanel from "@/components/admin/ProductsPanel";
import OrdersPanel from "@/components/admin/OrdersPanel";
import InventoryPanel from "@/components/admin/InventoryPanel";
import CustomersPanel from "@/components/admin/CustomersPanel";
import PromotionsPanel from "@/components/admin/PromotionsPanel";
import PriceListsPanel from "@/components/admin/PriceListsPanel";

type AdminSection =
  | "products"
  | "orders"
  | "inventory"
  | "customers"
  | "promotions"
  | "pricelists";

const MENU: { key: AdminSection; label: string; icon: React.ReactNode }[] = [
  { key: "products", label: "Productos", icon: <Package className="size-4" /> },
  { key: "orders", label: "Pedidos", icon: <ShoppingCart className="size-4" /> },
  { key: "inventory", label: "Inventario", icon: <Boxes className="size-4" /> },
  { key: "customers", label: "Clientes", icon: <Users className="size-4" /> },
  { key: "promotions", label: "Promociones", icon: <Percent className="size-4" /> },
  { key: "pricelists", label: "Listas de precios", icon: <Tag className="size-4" /> },
];

const Admin: React.FC = () => {
  const { loading, allowed } = useAdminGuard();
  const [section, setSection] = React.useState<AdminSection>("products");

  React.useEffect(() => {
    if (!loading && !allowed) {
      toast.error("No tenés permisos para acceder al panel de administración.");
    }
  }, [loading, allowed]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-8">Verificando permisos…</Card>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-8">
          <p className="text-sm text-muted-foreground">
            Acceso denegado. Inicia sesión con una cuenta administradora.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 font-sans">
      <div className="flex gap-4">
        {/* Lateral menu */}
        <aside className="w-64 shrink-0">
          <Card className="p-2">
            <nav className="flex flex-col gap-1">
              {MENU.map((item) => {
                const active = section === item.key;
                return (
                  <Button
                    key={item.key}
                    variant={active ? "brand" : "ghost"}
                    className={`justify-start gap-2 ${active ? "font-semibold" : ""}`}
                    onClick={() => setSection(item.key)}
                  >
                    {item.icon}
                    {item.label}
                  </Button>
                );
              })}
            </nav>
          </Card>
        </aside>

        {/* Content */}
        <main className="flex-1">
          {section === "products" && <ProductsPanel />}
          {section === "orders" && <OrdersPanel />}
          {section === "inventory" && <InventoryPanel />}
          {section === "customers" && <CustomersPanel />}
          {section === "promotions" && <PromotionsPanel />}
          {section === "pricelists" && <PriceListsPanel />}
        </main>
      </div>
    </div>
  );
};

export default Admin;

