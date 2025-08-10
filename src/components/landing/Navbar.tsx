import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ClipboardList, UserRound, Search } from "lucide-react";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-gradient-primary" aria-hidden />
            <span className="text-xl font-bold">B2BOX</span>
          </Link>
          <ul className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
            <li><a href="#trends" className="hover:text-foreground transition-colors">Trends</a></li>
            <li><a href="#academy" className="hover:text-foreground transition-colors">Academy</a></li>
            <li><a href="#brands" className="hover:text-foreground transition-colors">Brands</a></li>
            <li><a href="#nosotros" className="hover:text-foreground transition-colors">Nosotros</a></li>
          </ul>
        </div>

        <div className="hidden lg:flex flex-1 max-w-2xl items-center gap-2">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60" size={18} />
            <Input placeholder="Buscar productos, categorías, marcas…" className="pl-9" aria-label="Buscar" />
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          <Button variant="ghost" size="icon" aria-label="Carrito"><ShoppingCart /></Button>
          <Button variant="ghost" size="icon" aria-label="Pedidos"><ClipboardList /></Button>
          <Button variant="ghost" size="icon" aria-label="Perfil"><UserRound /></Button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;