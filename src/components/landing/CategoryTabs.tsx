import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductGrid from "./ProductGrid";
import { categories } from "./data";

const CategoryTabs = () => {
  const first = Object.keys(categories)[0] as keyof typeof categories;
  return (
    <section className="container mx-auto">
      <div className="rounded-2xl bg-secondary/60 p-4">
        <h2 className="mx-1 mb-3 text-center text-xl font-semibold md:text-2xl">Los productos más vendidos en las categorías más buscadas</h2>
        <Tabs defaultValue={first} className="w-full">
          <div className="flex justify-center">
            <TabsList className="max-w-full flex-wrap">
              {Object.keys(categories).map((key) => (
                <TabsTrigger key={key} value={key} className="pill m-1">{key}</TabsTrigger>
              ))}
            </TabsList>
          </div>
          {Object.entries(categories).map(([key, value]) => (
            <TabsContent key={key} value={key}>
              <ProductGrid products={value} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};

export default CategoryTabs;