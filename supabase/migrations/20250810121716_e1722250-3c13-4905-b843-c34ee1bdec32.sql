-- 1) Add parent_id to categories and index
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS parent_id uuid NULL;
ALTER TABLE public.categories
  ADD CONSTRAINT categories_parent_fk FOREIGN KEY (parent_id)
  REFERENCES public.categories(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);

-- Ensure slug uniqueness for upserts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'categories_slug_unique'
  ) THEN
    CREATE UNIQUE INDEX categories_slug_unique ON public.categories(slug);
  END IF;
END$$;

-- 2) Seed taxonomy (parents and subcategories)
DO $$
DECLARE
  item jsonb;
  sub text;
  parent_name text;
  parent_slug text;
  sub_slug text;
  parent_id uuid;
  data jsonb := '[
    {"p":"Moda femenina","subs":["Prendas de vestir","Accesorios de moda","Bolsos y carteras","Ropa deportiva","Ropa interior y de dormir","Ropa de playa"]},
    {"p":"Moda masculina","subs":["Prendas de vestir","Accesorios de moda","Bolsos y carteras","Ropa deportiva","Ropa interior y de dormir","Ropa de playa"]},
    {"p":"Electrónica","subs":["Accesorios para celular","Accesorios para computadora","Accesorios para tabletas","Hogar inteligente","Audio","Gaming"]},
    {"p":"Cuidado personal y belleza","subs":["Artículos eróticos","Uñas","Cuidado de piel","Cuidados de cabello","Accesorios de maquillaje","Cuidado dental"]},
    {"p":"Salud y bienestar","subs":["Vitaminas y suplementos","Productos de primeros auxilios","Cuidado personal","Relajación y bienestar"]},
    {"p":"Tecnología wearable","subs":["Relojes inteligentes (smartwatches)","Pulseras de actividad","Auriculares inalámbricos","Accesorios para wearables"]},
    {"p":"Joyería y bisutería","subs":["Anillos","Collares","Pulseras","Aretes","Organizadores de joyería"]},
    {"p":"Relojes","subs":["Relojes masculinos","Relojes femeninos","Relojes infantiles","Accesorios para relojes"]},
    {"p":"Bebés y Niños","subs":["Ropa para bebés","Ropa para niños","Accesorios para bebé","Accesorios para niños","Artículos de cuidado","Muebles infantiles"]},
    {"p":"Juguetes y juegos","subs":["Juguetes para bebés","Juegos de mesa","Juguetes educativos","Muñecas y figuras de acción","Control remoto y drones","Peluches"]},
    {"p":"Temporada","subs":["Navidad","Halloween","Juninho","Día de la Madre/Padre","San Valentín","Día de los Niños","Pascua"]},
    {"p":"Eventos y fiesta","subs":["Decoraciones para fiestas","Accesorios para disfraces","Artículos para bodas","Regalos para eventos","Artículos para cumpleaños"]},
    {"p":"Mascotas","subs":["Accesorios para perros","Accesorios para gatos","Accesorios para pájaros","Accesorios para peces","Accesorios para roedores"]},
    {"p":"Hogar","subs":["Muebles","Decoración","Cocina y comedor","Baño","Organización y almacenamiento","Limpieza","Textiles","Iluminación","Habitación"]},
    {"p":"Deportes y Fitness","subs":["Ciclismo","Camping","Fitness y gimnasio","Fútbol","Básquetbol","Tenis","Tenis de mesa","Pádel","Yoga","Accesorios","Natación","Esquí"]},
    {"p":"Maletas de viaje y bolsos","subs":["Maletas de viaje","Mochilas","Carteras","Accesorios de viaje"]},
    {"p":"Material escolar y oficina","subs":["Papelería","Escolar","Oficina"]},
    {"p":"Electrodomésticos","subs":["Cocina","Limpieza","Belleza y salud","Clima"]},
    {"p":"Vehículos, motos y bicicletas","subs":["Accesorios para vehículos","Accesorios para moto","Accesorios para bicicleta"]},
    {"p":"Herramientas","subs":["Herramientas manuales","Accesorios para herramientas","Kits de herramientas pequeñas","Herramientas eléctricas"]}
  ]'::jsonb;
BEGIN
  FOR item IN SELECT jsonb_array_elements(data) AS item LOOP
    parent_name := item->>'p';
    parent_slug := regexp_replace(lower(parent_name), '[^a-z0-9]+', '-', 'g');
    INSERT INTO public.categories (name, slug)
    VALUES (parent_name, parent_slug)
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, updated_at = now();
    SELECT id INTO parent_id FROM public.categories WHERE slug = parent_slug;

    FOR sub IN SELECT jsonb_array_elements_text(item->'subs') LOOP
      sub_slug := regexp_replace(lower(sub), '[^a-z0-9]+', '-', 'g');
      INSERT INTO public.categories (name, slug, parent_id)
      VALUES (sub, parent_slug || '-' || sub_slug, parent_id)
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, parent_id = EXCLUDED.parent_id, updated_at = now();
    END LOOP;
  END LOOP;
END $$;