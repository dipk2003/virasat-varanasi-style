WITH category_seed AS (
  SELECT *
  FROM (
    VALUES
      (
        'Banarasi Silk',
        'banarasi-silk',
        'Premium Banarasi sarees and drapes with zari-rich craftsmanship for bridal and festive wardrobes.',
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
        true,
        1
      ),
      (
        'Cotton Elegance',
        'cotton-elegance',
        'Breathable cotton edits, office kurtas, and graceful daily-wear silhouettes with artisan detailing.',
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1200&q=80',
        true,
        2
      ),
      (
        'Festive Collection',
        'festive-collection',
        'Celebration-ready anarkalis, occasion sets, and heirloom sarees for haldi, mehendi, and wedding functions.',
        'https://images.unsplash.com/photo-1621786030484-4c855eed6974?auto=format&fit=crop&w=1200&q=80',
        true,
        3
      ),
      (
        'Designer Kurtis',
        'designer-kurtis',
        'Fusion kurtis, statement coordinates, and elevated separates designed for contemporary ethnic wardrobes.',
        'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80',
        true,
        4
      ),
      (
        'Casual Comfort',
        'casual-comfort',
        'Comfort-first everyday wear with refined color stories, practical tailoring, and easy repeat styling.',
        'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80',
        true,
        5
      )
  ) AS t(name, slug, description, image_url, is_active, sort_order)
)
INSERT INTO public.categories (
  name,
  slug,
  description,
  image_url,
  is_active,
  sort_order
)
SELECT
  category_seed.name,
  category_seed.slug,
  category_seed.description,
  category_seed.image_url,
  category_seed.is_active,
  category_seed.sort_order
FROM category_seed
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

WITH product_seed AS (
  SELECT *
  FROM (
    VALUES
      (
        'royal-rani-jangla-saree',
        'Royal Rani Jangla Banarasi Saree',
        'Hand-finished Banarasi saree with classic jangla zari work, contrast blouse fabric, and celebratory drape weight.',
        12999::numeric,
        15999::numeric,
        12,
        'Banarasi Silk',
        ARRAY['Free Size']::text[],
        ARRAY['Rani Pink']::text[],
        true,
        true,
        false,
        ARRAY[
          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=1200&q=80'
        ]::text[],
        'banarasi-silk'
      ),
      (
        'kashi-meenakari-tissue-saree',
        'Kashi Meenakari Tissue Saree',
        'Soft shimmer tissue saree with meenakari motifs designed for receptions, sangeet edits, and luxury gifting.',
        11499::numeric,
        14499::numeric,
        10,
        'Tissue Silk',
        ARRAY['Free Size']::text[],
        ARRAY['Champagne Gold']::text[],
        true,
        true,
        false,
        ARRAY[
          'https://images.unsplash.com/photo-1610047402714-2f1d4f5d457f?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1583391733981-1e3e7f6681c6?auto=format&fit=crop&w=1200&q=80'
        ]::text[],
        'banarasi-silk'
      ),
      (
        'ivory-chikankari-kurta-set',
        'Ivory Chikankari Kurta Set',
        'Breathable cotton kurta set with tonal chikankari detailing, straight pants, and easy festive-to-office styling.',
        3599::numeric,
        4499::numeric,
        28,
        'Cotton',
        ARRAY['XS','S','M','L','XL','XXL']::text[],
        ARRAY['Ivory','Powder Blue']::text[],
        true,
        true,
        false,
        ARRAY[
          'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1618244972963-dbad68f6d6f5?auto=format&fit=crop&w=1200&q=80'
        ]::text[],
        'cotton-elegance'
      ),
      (
        'indigo-ajrakh-coord-set',
        'Indigo Ajrakh Co-ord Set',
        'Relaxed festive co-ord with handblock inspired print language, soft lining, and elevated everyday wearability.',
        4299::numeric,
        5299::numeric,
        24,
        'Cotton Linen',
        ARRAY['S','M','L','XL']::text[],
        ARRAY['Indigo','Rust']::text[],
        true,
        false,
        false,
        ARRAY[
          'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80'
        ]::text[],
        'casual-comfort'
      ),
      (
        'gulnaar-zari-anarkali',
        'Gulnaar Zari Anarkali',
        'Swirl-ready festive anarkali with zari borders, flowing flare, and statement dupatta pairing for ceremonies.',
        6999::numeric,
        8499::numeric,
        18,
        'Silk Blend',
        ARRAY['S','M','L','XL','XXL']::text[],
        ARRAY['Deep Maroon','Bottle Green']::text[],
        true,
        true,
        true,
        ARRAY[
          'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1200&q=80'
        ]::text[],
        'festive-collection'
      ),
      (
        'bridal-kadwa-red-saree',
        'Bridal Kadwa Red Banarasi Saree',
        'Heavy kadwa weave saree for bridal trousseau with heirloom texture, rich contrast pallu, and ceremonial finish.',
        18499::numeric,
        22999::numeric,
        8,
        'Pure Banarasi Silk',
        ARRAY['Free Size']::text[],
        ARRAY['Bridal Red']::text[],
        true,
        true,
        false,
        ARRAY[
          'https://images.unsplash.com/photo-1621786030484-4c855eed6974?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1610189020382-6688c1d7df15?auto=format&fit=crop&w=1200&q=80'
        ]::text[],
        'festive-collection'
      ),
      (
        'teal-kalamkari-fusion-kurti',
        'Teal Kalamkari Fusion Kurti',
        'Contemporary fusion kurti with statement yoke, artisanal print story, and elevated day-to-evening silhouette.',
        3899::numeric,
        4799::numeric,
        20,
        'Viscose Silk',
        ARRAY['S','M','L','XL']::text[],
        ARRAY['Teal','Mustard']::text[],
        true,
        false,
        true,
        ARRAY[
          'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80'
        ]::text[],
        'designer-kurtis'
      ),
      (
        'rose-gota-occasion-set',
        'Rose Gota Occasion Set',
        'Elegant occasion set with gota highlights, tonal dupatta, and flattering cut for daytime wedding functions.',
        5499::numeric,
        6799::numeric,
        16,
        'Chanderi',
        ARRAY['S','M','L','XL']::text[],
        ARRAY['Dusty Rose','Peach']::text[],
        true,
        true,
        true,
        ARRAY[
          'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80'
        ]::text[],
        'festive-collection'
      ),
      (
        'handloom-stripe-office-kurta',
        'Handloom Stripe Office Kurta',
        'Clean everyday kurta with handloom-inspired stripes, practical side pockets, and workday comfort.',
        2499::numeric,
        3199::numeric,
        30,
        'Cotton Slub',
        ARRAY['S','M','L','XL','XXL']::text[],
        ARRAY['Clay','Olive']::text[],
        true,
        false,
        false,
        ARRAY[
          'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80'
        ]::text[],
        'casual-comfort'
      ),
      (
        'festive-bandhej-kurti',
        'Festive Bandhej Kurti',
        'Bright festive kurti with bandhej-inspired print, zari accents, and flattering straight silhouette.',
        3199::numeric,
        3999::numeric,
        22,
        'Georgette',
        ARRAY['S','M','L','XL']::text[],
        ARRAY['Magenta','Yellow']::text[],
        true,
        false,
        true,
        ARRAY[
          'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80'
        ]::text[],
        'designer-kurtis'
      ),
      (
        'soft-gold-zari-dupatta',
        'Soft Gold Zari Dupatta',
        'Versatile zari dupatta to elevate kurtas and lehenga looks with a lightweight festive finish.',
        1899::numeric,
        2399::numeric,
        35,
        'Organza',
        ARRAY['Free Size']::text[],
        ARRAY['Soft Gold']::text[],
        true,
        false,
        false,
        ARRAY[
          'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80'
        ]::text[],
        'designer-kurtis'
      ),
      (
        'loom-story-cotton-saree',
        'Loom Story Cotton Saree',
        'Easy drape cotton saree for gifting and daily elegance with contrast temple border and breathable body.',
        2999::numeric,
        3699::numeric,
        20,
        'Handloom Cotton',
        ARRAY['Free Size']::text[],
        ARRAY['Indigo White']::text[],
        true,
        false,
        false,
        ARRAY[
          'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1583391733981-1e3e7f6681c6?auto=format&fit=crop&w=1200&q=80'
        ]::text[],
        'cotton-elegance'
      )
  ) AS t(
    slug,
    name,
    description,
    price,
    compare_at_price,
    stock_quantity,
    fabric,
    sizes,
    colors,
    is_active,
    is_featured,
    is_custom_designable,
    images,
    category_slug
  )
)
INSERT INTO public.products (
  category_id,
  name,
  slug,
  description,
  price,
  compare_at_price,
  stock_quantity,
  low_stock_threshold,
  images,
  sizes,
  colors,
  fabric,
  is_active,
  is_featured,
  is_custom_designable
)
SELECT
  categories.id,
  product_seed.name,
  product_seed.slug,
  product_seed.description,
  product_seed.price,
  product_seed.compare_at_price,
  product_seed.stock_quantity,
  5,
  product_seed.images,
  product_seed.sizes,
  product_seed.colors,
  product_seed.fabric,
  product_seed.is_active,
  product_seed.is_featured,
  product_seed.is_custom_designable
FROM product_seed
JOIN public.categories ON categories.slug = product_seed.category_slug
ON CONFLICT (slug) DO UPDATE
SET
  category_id = EXCLUDED.category_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  compare_at_price = EXCLUDED.compare_at_price,
  stock_quantity = EXCLUDED.stock_quantity,
  low_stock_threshold = EXCLUDED.low_stock_threshold,
  images = EXCLUDED.images,
  sizes = EXCLUDED.sizes,
  colors = EXCLUDED.colors,
  fabric = EXCLUDED.fabric,
  is_active = EXCLUDED.is_active,
  is_featured = EXCLUDED.is_featured,
  is_custom_designable = EXCLUDED.is_custom_designable,
  updated_at = now();

WITH variant_seed AS (
  SELECT *
  FROM (
    VALUES
      ('royal-rani-jangla-saree', 'Free Size', 'Rani Pink', 'VRS-RRJS-FS-RP', 12999::numeric, 15999::numeric, 12),
      ('kashi-meenakari-tissue-saree', 'Free Size', 'Champagne Gold', 'VRS-KMTS-FS-CG', 11499::numeric, 14499::numeric, 10),
      ('ivory-chikankari-kurta-set', 'S', 'Ivory', 'VRS-ICKS-S-IV', 3599::numeric, 4499::numeric, 6),
      ('ivory-chikankari-kurta-set', 'M', 'Ivory', 'VRS-ICKS-M-IV', 3599::numeric, 4499::numeric, 7),
      ('ivory-chikankari-kurta-set', 'L', 'Ivory', 'VRS-ICKS-L-IV', 3599::numeric, 4499::numeric, 6),
      ('ivory-chikankari-kurta-set', 'XL', 'Powder Blue', 'VRS-ICKS-XL-PB', 3699::numeric, 4499::numeric, 4),
      ('indigo-ajrakh-coord-set', 'S', 'Indigo', 'VRS-IACS-S-IN', 4299::numeric, 5299::numeric, 5),
      ('indigo-ajrakh-coord-set', 'M', 'Indigo', 'VRS-IACS-M-IN', 4299::numeric, 5299::numeric, 6),
      ('indigo-ajrakh-coord-set', 'L', 'Rust', 'VRS-IACS-L-RS', 4299::numeric, 5299::numeric, 6),
      ('indigo-ajrakh-coord-set', 'XL', 'Rust', 'VRS-IACS-XL-RS', 4299::numeric, 5299::numeric, 7),
      ('gulnaar-zari-anarkali', 'M', 'Deep Maroon', 'VRS-GZA-M-DM', 6999::numeric, 8499::numeric, 4),
      ('gulnaar-zari-anarkali', 'L', 'Deep Maroon', 'VRS-GZA-L-DM', 6999::numeric, 8499::numeric, 4),
      ('gulnaar-zari-anarkali', 'XL', 'Bottle Green', 'VRS-GZA-XL-BG', 7199::numeric, 8499::numeric, 5),
      ('bridal-kadwa-red-saree', 'Free Size', 'Bridal Red', 'VRS-BKRS-FS-BR', 18499::numeric, 22999::numeric, 8),
      ('teal-kalamkari-fusion-kurti', 'S', 'Teal', 'VRS-TKFK-S-TE', 3899::numeric, 4799::numeric, 5),
      ('teal-kalamkari-fusion-kurti', 'M', 'Teal', 'VRS-TKFK-M-TE', 3899::numeric, 4799::numeric, 5),
      ('teal-kalamkari-fusion-kurti', 'L', 'Mustard', 'VRS-TKFK-L-MU', 3999::numeric, 4799::numeric, 5),
      ('rose-gota-occasion-set', 'S', 'Dusty Rose', 'VRS-RGOS-S-DR', 5499::numeric, 6799::numeric, 4),
      ('rose-gota-occasion-set', 'M', 'Dusty Rose', 'VRS-RGOS-M-DR', 5499::numeric, 6799::numeric, 4),
      ('rose-gota-occasion-set', 'L', 'Peach', 'VRS-RGOS-L-PE', 5599::numeric, 6799::numeric, 4),
      ('handloom-stripe-office-kurta', 'M', 'Clay', 'VRS-HSOK-M-CL', 2499::numeric, 3199::numeric, 8),
      ('handloom-stripe-office-kurta', 'L', 'Clay', 'VRS-HSOK-L-CL', 2499::numeric, 3199::numeric, 8),
      ('handloom-stripe-office-kurta', 'XL', 'Olive', 'VRS-HSOK-XL-OL', 2599::numeric, 3199::numeric, 7),
      ('festive-bandhej-kurti', 'S', 'Magenta', 'VRS-FBK-S-MA', 3199::numeric, 3999::numeric, 6),
      ('festive-bandhej-kurti', 'M', 'Magenta', 'VRS-FBK-M-MA', 3199::numeric, 3999::numeric, 6),
      ('festive-bandhej-kurti', 'L', 'Yellow', 'VRS-FBK-L-YE', 3199::numeric, 3999::numeric, 5),
      ('soft-gold-zari-dupatta', 'Free Size', 'Soft Gold', 'VRS-SGZD-FS-SG', 1899::numeric, 2399::numeric, 20),
      ('loom-story-cotton-saree', 'Free Size', 'Indigo White', 'VRS-LSCS-FS-IW', 2999::numeric, 3699::numeric, 20)
  ) AS t(
    product_slug,
    size,
    color,
    sku,
    price_override,
    compare_at_price_override,
    stock_quantity
  )
)
INSERT INTO public.product_variants (
  product_id,
  size,
  color,
  sku,
  price_override,
  compare_at_price_override,
  stock_quantity,
  is_active
)
SELECT
  products.id,
  variant_seed.size,
  variant_seed.color,
  variant_seed.sku,
  variant_seed.price_override,
  variant_seed.compare_at_price_override,
  variant_seed.stock_quantity,
  true
FROM variant_seed
JOIN public.products ON products.slug = variant_seed.product_slug
ON CONFLICT (product_id, size, color) DO UPDATE
SET
  sku = EXCLUDED.sku,
  price_override = EXCLUDED.price_override,
  compare_at_price_override = EXCLUDED.compare_at_price_override,
  stock_quantity = EXCLUDED.stock_quantity,
  is_active = EXCLUDED.is_active,
  updated_at = now();
