import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, Search, ShoppingBag, ShoppingCart, ClipboardList, UserRound, ChevronDown, Heart, Watch, Shirt } from "lucide-react";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Row 1 */}
      <div className="container mx-auto flex h-16 items-center justify-between gap-4">
        {/* Left cluster */}
        <div className="flex items-center gap-4 md:gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-gradient-primary" aria-hidden />
            <span className="text-xl font-bold">B2BOX</span>
          </Link>

          {/* Categorías chip */}
          <Button variant="brand" className="pill hidden sm:inline-flex px-4 py-2">
            <Menu size={18} /> Categorías
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
            <Button variant="brand" className="h-11 rounded-none rounded-r-full px-4">
              <Search />
            </Button>
          </div>
        </div>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-content-center rounded-full border text-lg">🇦🇷</div>
            <ChevronDown className="opacity-70" />
          </div>
          <div className="hidden lg:flex items-center gap-6 text-sm">
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
          <a href="#trends" className="flex items-center gap-1 font-semibold text-gradient-primary"><span>🔥</span> TRENDS</a>
          <a href="#academy" className="font-semibold text-brand-2">ACADEMY</a>
          <a href="#brands" className="font-semibold text-brand-green">BRANDS</a>
          <span className="mx-2 hidden h-4 w-px bg-border md:inline-block" />
          <a href="#nosotros" className="font-semibold">Nosotros</a>
          <a href="#moda-fem" className="flex items-center gap-2 text-muted-foreground hover:text-foreground"><Shirt /> Moda femenina</a>
          <a href="#moda-mas" className="flex items-center gap-2 text-muted-foreground hover:text-foreground"><ShoppingBag /> Moda masculina</a>
          <a href="#salud" className="flex items-center gap-2 text-muted-foreground hover:text-foreground"><Heart /> Salud y bienestar</a>
          <a href="#wearable" className="flex items-center gap-2 text-muted-foreground hover:text-foreground"><Watch /> Tecnología wearable</a>
        </div>
      </div>
    </header>
  );
};

export default Navbar;