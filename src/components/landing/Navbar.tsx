import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu, Search, ChevronDown } from "lucide-react";

const TEXTS = {
  AR: { cart: "Carrito", orders: "Pedidos", profile: "Perfil", us: "Nosotros", search: "Buscar productos, categorías, marcas…" },
  CO: { cart: "Carrito", orders: "Pedidos", profile: "Perfil", us: "Nosotros", search: "Buscar productos, categorías, marcas…" },
} as const;

type Country = keyof typeof TEXTS;

const Navbar = () => {
  const [country, setCountry] = React.useState<Country>(() => (localStorage.getItem("country") as Country) || "AR");
  React.useEffect(() => { localStorage.setItem("country", country); }, [country]);
  return (
    <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
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
              placeholder={TEXTS[country].search}
              aria-label="Buscar"
              className="h-11 w-full bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
            />
            <Button variant="brand" className="h-12 rounded-none rounded-r-full px-5" aria-label="Buscar">
              <Search size={22} />
            </Button>
          </div>
        </div>

          <div className="hidden md:flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full border px-2 py-1" aria-label="Seleccionar país">
                  <img src={country === "AR" ? "/images/flags/ar.svg" : "/images/flags/co.svg"} alt={`Bandera de ${country === "AR" ? "Argentina" : "Colombia"}`} className="h-8 w-8 rounded-full object-cover" loading="lazy" />
                  <ChevronDown className="opacity-70" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="z-[60] bg-background">
                <DropdownMenuItem onSelect={() => setCountry("AR")} className="gap-2">
                  <img src="/images/flags/ar.svg" alt="Argentina" className="h-5 w-5 rounded-full" /> Argentina
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setCountry("CO")} className="gap-2">
                  <img src="/images/flags/co.svg" alt="Colombia" className="h-5 w-5 rounded-full" /> Colombia
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          <div className="hidden lg:flex items-center gap-6 text-base font-medium">
            <div className="flex flex-col items-center">
              <img src="/lovable-uploads/e2255b3e-fa3e-47a1-89ec-bb042bcdd4e0.png" alt="Icono Carrito" className="h-7 w-7 object-contain" loading="lazy" />
              <span>{TEXTS[country].cart}</span>
            </div>
            <div className="flex flex-col items-center">
              <img src="/lovable-uploads/1647953f-698c-4c75-a3ac-c9ae11334c69.png" alt="Icono Pedidos" className="h-7 w-7 object-contain" loading="lazy" />
              <span>{TEXTS[country].orders}</span>
            </div>
            <div className="flex flex-col items-center">
              <img src="/lovable-uploads/c21caebf-b694-4e86-b07c-b08a51d325ab.png" alt="Icono Perfil" className="h-7 w-7 object-contain" loading="lazy" />
              <span>{TEXTS[country].profile}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2 */}
      <div>
        <div className="container mx-auto flex flex-wrap items-center gap-4 py-3 text-sm">
          <a href="#trends" className="flex items-center"><img src="/lovable-uploads/573f686c-7492-4309-a3ef-8a941e81ec6e.png" alt="B2BOX TRENDS" className="h-6 w-auto" loading="lazy" /></a>
          <a href="#academy" className="flex items-center"><img src="/lovable-uploads/a43adb22-d4de-4fa7-bc78-f8ac44f2dc81.png" alt="B2BOX ACADEMY" className="h-6 w-auto" loading="lazy" /></a>
          <a href="#brands" className="flex items-center"><img src="/lovable-uploads/f311b60a-adbd-4b8b-8fce-7615166a2895.png" alt="B2BOX BRANDS" className="h-6 w-auto" loading="lazy" /></a>
          <span className="mx-2 hidden h-4 w-px bg-border md:inline-block" />
          <a href="#nosotros" className="font-medium text-base">{TEXTS[country].us}</a>
          <a href="#moda-fem" className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium text-base"><img src="/lovable-uploads/ca6fd2f2-92d9-43f6-955b-e4f140912e9e.png" alt="Icono Moda femenina" className="h-5 w-5 object-contain" loading="lazy" /> Moda femenina</a>
          <a href="#moda-mas" className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium text-base"><img src="/lovable-uploads/32edb77f-ead7-4e0e-9638-b2049b7f5e31.png" alt="Icono Moda masculina" className="h-5 w-5 object-contain" loading="lazy" /> Moda masculina</a>
          <a href="#salud" className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium text-base"><img src="/lovable-uploads/af8639df-1761-4ec1-b905-8d948d403ae4.png" alt="Icono Salud y bienestar" className="h-5 w-5 object-contain" loading="lazy" /> Salud y bienestar</a>
          <a href="#wearable" className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium text-base"><img src="/lovable-uploads/1487d271-1ed1-4085-afb4-b90508b2221e.png" alt="Icono Tecnología wearable" className="h-5 w-5 object-contain" loading="lazy" /> Tecnología wearable</a>
        </div>
      </div>
    </header>
  );
};

export default Navbar;