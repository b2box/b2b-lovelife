import productImg from "@/assets/product-organizer.jpg";
import type { Product } from "./ProductCard";

const baseProduct: Product = {
  id: "p-0",
  name: "Estantería vibrante de dos niveles para almacenamiento",
  price: 0.58,
  image: productImg,
  badge: "B2BOX verified",
};

const repeat = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    ...baseProduct,
    id: `p-${i + 1}`,
  }));

export const categories: Record<string, Product[]> = {
  "Principales productos": repeat(10),
  "Más vendidos": repeat(10),
  "Moda femenina": repeat(10),
  "Moda masculina": repeat(10),
  "Salud y bienestar": repeat(10),
};
