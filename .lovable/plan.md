

## Plan: HeroV2 sin Apple Watch grid

### Cambios

1. **Crear `src/components/landing/HeroV2.tsx`**
   - Full-width text-centered hero (sin grid de productos, sin FloatingProducts)
   - Layout vertical centrado:
     - H1 grande bold: "Si vendés online, necesitás importar."
     - Subheadline muted: "B2BOX lo hace por vos. Comprás al por mayor en China y recibís en Argentina con precio final."
     - Bloque de impacto con fondo sutil/borde: "30% para confirmar. Saldo cuando la mercadería está por liberarse. Sin aduana. Sin trámites. Sin excusas."
     - Mini aclaración italic: "No es dropshipping. No es stock local. Es importación mayorista gestionada por B2BOX."
     - Botón verde CTA: "Ver catálogo mayorista"
     - Microcopy: "Compra desde USD 1000. Precio final en Argentina."
   - Mismo contenedor con gradient border del Hero actual

2. **Actualizar `src/pages/IndexARv2.tsx`**
   - Importar `HeroV2` en lugar de `Hero`

3. **Agregar ruta `/ar-v2` en `src/App.tsx`**

