
import React from "react";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Package, ShoppingCart, Boxes, Users, Percent, Tag, Settings as SettingsIcon } from "lucide-react";
import ProductsPanel from "@/components/admin/ProductsPanel";
import OrdersPanel from "@/components/admin/OrdersPanel";
import InventoryPanel from "@/components/admin/InventoryPanel";
import CustomersPanel from "@/components/admin/CustomersPanel";
import PromotionsPanel from "@/components/admin/PromotionsPanel";
import PriceListsPanel from "@/components/admin/PriceListsPanel";
import SettingsPanel from "@/components/admin/SettingsPanel";

type AdminSection =
  | "products"
  | "orders"
  | "inventory"
  | "customers"
  | "promotions"
  | "pricelists"
  | "settings";

const MENU: { key: AdminSection; label: string; icon: React.ReactNode; adminOnly?: boolean }[] = [
  { key: "products", label: "Productos", icon: <Package className="size-4" /> },
  { key: "orders", label: "Pedidos", icon: <ShoppingCart className="size-4" />, adminOnly: true },
  { key: "inventory", label: "Inventario", icon: <Boxes className="size-4" />, adminOnly: true },
  { key: "customers", label: "Clientes", icon: <Users className="size-4" />, adminOnly: true },
  { key: "promotions", label: "Promociones", icon: <Percent className="size-4" />, adminOnly: true },
  { key: "pricelists", label: "Listas de precios", icon: <Tag className="size-4" />, adminOnly: true },
  { key: "settings", label: "Ajustes", icon: <SettingsIcon className="size-4" />, adminOnly: true },
];

const Admin: React.FC = () => {
  const { loading, allowed, userRole } = useAdminGuard();
  const [section, setSection] = React.useState<AdminSection>("products");

  // Filtrar menú según el rol del usuario
  const availableMenu = React.useMemo(() => {
    if (userRole === 'admin') {
      return MENU; // Admin ve todo
    }
    // Agentes solo ven productos
    return MENU.filter(item => !item.adminOnly);
  }, [userRole]);

  React.useEffect(() => {
    if (!loading && !allowed) {
      toast.error("No tenés permisos para acceder al panel de administración.");
    }
  }, [loading, allowed]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-8 card-glass">Verificando permisos…</Card>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-8 card-glass">
          <p className="text-sm text-muted-foreground">
            Acceso denegado. Inicia sesión con una cuenta administradora.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 font-sans">
      <header className="sticky top-2 z-10 mb-4 rounded-xl card-glass px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight">
          Panel de {userRole === 'admin' ? 'administración' : 'agente'}
        </h1>
        <span className="text-sm text-muted-foreground capitalize">
          {userRole === 'admin' ? 'Administrador' : 'Agente'}
        </span>
      </header>
      <div className="flex gap-4">
        {/* Lateral menu */}
        <aside className="w-64 shrink-0">
          <Card className="p-2 card-glass">
            <nav className="flex flex-col gap-1">
              {availableMenu.map((item) => {
                const active = section === item.key;
                return (
                  <Button
                    key={item.key}
                    variant={active ? "secondary" : "ghost"}
                    className={`justify-start gap-2 rounded-lg ${active ? "font-medium" : ""}`}
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
          {section === "orders" && userRole === 'admin' && <OrdersPanel />}
          {section === "inventory" && userRole === 'admin' && <InventoryPanel />}
          {section === "customers" && userRole === 'admin' && <CustomersPanel />}
          {section === "promotions" && userRole === 'admin' && <PromotionsPanel />}
          {section === "pricelists" && userRole === 'admin' && <PriceListsPanel />}
          {section === "settings" && userRole === 'admin' && <SettingsPanel />}
        </main>
      </div>
    </div>
  );
};

export default Admin;

