import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const Admin = () => {
  useEffect(() => {
    document.title = "Admin | B2BOX";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto py-6 md:py-8">
        <header className="mb-4">
          <h1 className="text-2xl md:text-3xl font-semibold leading-tight">Panel de administración</h1>
          <p className="text-sm text-muted-foreground">Gestiona productos, pedidos, inventario, clientes y promociones.</p>
        </header>

        <Tabs defaultValue="productos" className="w-full">
          <TabsList>
            <TabsTrigger value="productos">Productos</TabsTrigger>
            <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
            <TabsTrigger value="inventario">Inventario</TabsTrigger>
            <TabsTrigger value="clientes">Clientes</TabsTrigger>
            <TabsTrigger value="promos">Promociones</TabsTrigger>
          </TabsList>

          <TabsContent value="productos" className="mt-4">
            <section className="rounded-2xl border p-4">
              <h2 className="text-lg font-semibold mb-2">Productos</h2>
              <p className="text-sm text-muted-foreground mb-4">Crea y edita productos, imágenes, variantes y precios por tramo.</p>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 rounded-xl border p-3">
                  <div className="text-sm text-muted-foreground">Listado (conectar a Supabase posteriormente)</div>
                </div>
                <form className="rounded-xl border p-3 space-y-2" aria-label="Crear producto">
                  <input className="w-full rounded-md border px-3 py-2" placeholder="Nombre" />
                  <input className="w-full rounded-md border px-3 py-2" placeholder="Marca" />
                  <textarea className="w-full rounded-md border px-3 py-2" placeholder="Descripción" rows={4} />
                  <button type="button" className="w-full rounded-md bg-foreground text-background py-2">Guardar</button>
                </form>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="pedidos" className="mt-4">
            <section className="rounded-2xl border p-4">
              <h2 className="text-lg font-semibold mb-2">Pedidos</h2>
              <div className="text-sm text-muted-foreground">Listado y gestión de estados.</div>
            </section>
          </TabsContent>

          <TabsContent value="inventario" className="mt-4">
            <section className="rounded-2xl border p-4">
              <h2 className="text-lg font-semibold mb-2">Inventario</h2>
              <div className="text-sm text-muted-foreground">Ajustes de stock por variante.</div>
            </section>
          </TabsContent>

          <TabsContent value="clientes" className="mt-4">
            <section className="rounded-2xl border p-4">
              <h2 className="text-lg font-semibold mb-2">Clientes</h2>
              <div className="text-sm text-muted-foreground">Perfiles de clientes y direcciones.</div>
            </section>
          </TabsContent>

          <TabsContent value="promos" className="mt-4">
            <section className="rounded-2xl border p-4">
              <h2 className="text-lg font-semibold mb-2">Promociones</h2>
              <div className="text-sm text-muted-foreground">Códigos, descuentos y campañas.</div>
            </section>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
