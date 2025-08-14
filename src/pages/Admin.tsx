
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Package, ShoppingCart, Boxes, Users, Percent, Tag, Settings as SettingsIcon, FolderTree, Layers3 } from "lucide-react";
import ProductsPanel from "@/components/admin/ProductsPanel";
import OrdersPanel from "@/components/admin/OrdersPanel";
import InventoryPanel from "@/components/admin/InventoryPanel";
import CustomersPanel from "@/components/admin/CustomersPanel";
import PromotionsPanel from "@/components/admin/PromotionsPanel";
import PriceListsPanel from "@/components/admin/PriceListsPanel";
import SettingsPanel from "@/components/admin/SettingsPanel";
import CategoriesPanel from "@/components/admin/CategoriesPanel";
import CollectionsPanel from "@/components/admin/CollectionsPanel";
import { UserHeader } from "@/components/admin/UserHeader";

type AdminSection =
  | "products"
  | "orders"
  | "inventory"
  | "customers"
  | "promotions"
  | "pricelists"
  | "categories"
  | "collections"
  | "settings";

const MENU: { key: AdminSection; label: string; icon: React.ReactNode; adminOnly?: boolean }[] = [
  { key: "products", label: "Productos", icon: <Package className="size-4" /> },
  { key: "categories", label: "Categorías", icon: <FolderTree className="size-4" /> },
  { key: "collections", label: "Colecciones", icon: <Layers3 className="size-4" /> },
  { key: "orders", label: "Pedidos", icon: <ShoppingCart className="size-4" />, adminOnly: true },
  { key: "inventory", label: "Inventario", icon: <Boxes className="size-4" />, adminOnly: true },
  { key: "customers", label: "Clientes", icon: <Users className="size-4" />, adminOnly: true },
  { key: "promotions", label: "Promociones", icon: <Percent className="size-4" />, adminOnly: true },
  { key: "pricelists", label: "Listas de precios", icon: <Tag className="size-4" />, adminOnly: true },
  { key: "settings", label: "Ajustes", icon: <SettingsIcon className="size-4" />, adminOnly: true },
];

const Admin: React.FC = () => {
  const [section, setSection] = React.useState<AdminSection>("products");

  // Show all menu items without restrictions
  const availableMenu = MENU;

  return (
    <div className="container mx-auto p-4 md:p-6 font-sans">
      <header className="sticky top-2 z-10 mb-4 rounded-xl card-glass px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold tracking-tight">
            Panel de administración
          </h1>
        </div>
        <UserHeader />
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
          {section === "categories" && <CategoriesPanel />}
          {section === "collections" && <CollectionsPanel />}
          {section === "orders" && <OrdersPanel />}
          {section === "inventory" && <InventoryPanel />}
          {section === "customers" && <CustomersPanel />}
          {section === "promotions" && <PromotionsPanel />}
          {section === "pricelists" && <PriceListsPanel />}
          {section === "settings" && <SettingsPanel />}
        </main>
      </div>
    </div>
  );
};

export default Admin;

