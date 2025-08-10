import type { Product } from "./ProductCard";

const PRODUCT_IMG = "/lovable-uploads/ad0ec971-01f5-42c2-b284-ab98be2f3919.png";

const baseProduct: Product = {
  id: "p-0",
  name: "Estantería vibrante de dos niveles para almacenamiento",
  price: 0.58,
  image: PRODUCT_IMG,
  badge: "B2BOX verified",
};

const repeat = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    ...baseProduct,
    id: `p-${i + 1}`,
    viral: i === 0,
  }));

export const categories: Record<string, Product[]> = {
  "Principales productos": repeat(10),
  "Más vendidos": repeat(10),
  "Moda femenina": repeat(10),
  "Moda masculina": repeat(10),
  "Salud y bienestar": repeat(10),
};
