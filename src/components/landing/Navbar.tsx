import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, Search, ShoppingBag, ShoppingCart, ClipboardList, UserRound, ChevronDown, Heart, Watch, Shirt } from "lucide-react";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Row 1 */}
      <div className="container mx-auto flex h-20 items-center justify-between gap-4">
        {/* Left cluster */}
        <div className="flex items-center gap-4 md:gap-6">
          <Link to="/" className="flex items-center gap-3">
            <img src="/lovable-uploads/a6ada814-1660-4b53-ba08-afcb29e598eb.png" alt="B2BOX logo" className="h-9 w-auto object-contain" />
          </Link>

          {/* Categorías chip */}
          <Button variant="brand" className="pill hidden sm:inline-flex h-12 px-6 font-semibold" aria-label="Ver categorías">
            <Menu size={22} /> Categorías
          </Button>
        </div>

        {/* Search */}
        <div className="flex flex-1 max-w-3xl items-center">
          <div className="hidden md:flex w-full items-center overflow-hidden rounded-full border border-foreground">
            <Search className="ml-3 size-5 opacity-60" />
            <input
              type="text"
              placeholder="Buscar productos, categorías, marcas…"
              aria-label="Buscar"
              className="h-11 w-full bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
            />
            <ShoppingBag className="mr-2 hidden md:block size-5 opacity-60" />
            <Button variant="brand" className="h-12 rounded-none rounded-r-full px-5" aria-label="Buscar">
              <Search size={22} />
            </Button>
          </div>
        </div>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2">
            <img src="/images/flags/ar.svg" alt="Bandera de Argentina" className="h-8 w-8 rounded-full object-cover border" loading="lazy" />
            <ChevronDown className="opacity-70" />
          </div>
          <div className="hidden lg:flex items-center gap-6 text-base font-medium">
            <div className="flex flex-col items-center">
              <ShoppingCart />
              <span>Carrito</span>
            </div>
            <div className="flex flex-col items-center">
              <ClipboardList />
              <span>Pedidos</span>
            </div>
            <div className="flex flex-col items-center">
              <UserRound />
              <span>Perfil</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2 */}
      <div className="border-t">
        <div className="container mx-auto flex flex-wrap items-center gap-4 py-3 text-sm">
          <a href="#trends" className="flex items-center"><img src="/lovable-uploads/573f686c-7492-4309-a3ef-8a941e81ec6e.png" alt="B2BOX TRENDS" className="h-6 w-auto" loading="lazy" /></a>
          <a href="#academy" className="flex items-center"><img src="/lovable-uploads/a43adb22-d4de-4fa7-bc78-f8ac44f2dc81.png" alt="B2BOX ACADEMY" className="h-6 w-auto" loading="lazy" /></a>
          <a href="#brands" className="flex items-center"><img src="/lovable-uploads/f311b60a-adbd-4b8b-8fce-7615166a2895.png" alt="B2BOX BRANDS" className="h-6 w-auto" loading="lazy" /></a>
          <span className="mx-2 hidden h-4 w-px bg-border md:inline-block" />
          <a href="#nosotros" className="font-medium text-base">Nosotros</a>
          <a href="#moda-fem" className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium text-base"><img src="/lovable-uploads/3540fd6e-b065-4aa3-88ba-0f846e478aa4.png" alt="Icono Moda femenina" className="h-5 w-5 object-contain" loading="lazy" /> Moda femenina</a>
          <a href="#moda-mas" className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium text-base"><img src="/lovable-uploads/ace1cdfb-9b6b-4d0d-9704-94deadd382ca.png" alt="Icono Moda masculina" className="h-5 w-5 object-contain" loading="lazy" /> Moda masculina</a>
          <a href="#salud" className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium text-base"><img src="/lovable-uploads/02411991-41a0-44d3-9a3b-f28e1ccd340f.png" alt="Icono Salud y bienestar" className="h-5 w-5 object-contain" loading="lazy" /> Salud y bienestar</a>
          <a href="#wearable" className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium text-base"><img src="/lovable-uploads/f8e92033-43e5-4587-a12d-3936192f4be6.png" alt="Icono Tecnología wearable" className="h-5 w-5 object-contain" loading="lazy" /> Tecnología wearable</a>
        </div>
      </div>
    </header>
  );
};

export default Navbar;