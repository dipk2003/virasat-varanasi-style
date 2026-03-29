WITH product_seed AS (
  SELECT *
  FROM (
    VALUES
      (
        'maharani-kadwa-heritage-saree',
        'Maharani Kadwa Heritage Saree',
        'Premium Banarasi saree with kadwa zari story, ceremonial drape, and a 360-ready six-frame gallery for richer product discovery.',
        21999::numeric,
        26499::numeric,
        14,
        'Pure Katan Silk',
        ARRAY['Free Size']::text[],
        ARRAY['Heritage Maroon', 'Antique Gold']::text[],
        true,
        true,
        false,
        ARRAY[
          'https://images.unsplash.com/photo-1621786030484-4c855eed6974?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1610189020382-6688c1d7df15?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1610047402714-2f1d4f5d457f?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1583391733981-1e3e7f6681c6?auto=format&fit=crop&w=1200&q=80'
        ]::text[],
        'banarasi-silk'
      ),
      (
        'noor-kora-zari-saree',
        'Noor Kora Zari Saree',
        'Soft shimmer Banarasi saree designed for receptions and gifting, with multi-angle imagery that supports the storefront 360 spin view.',
        16899::numeric,
        20999::numeric,
        11,
        'Kora Organza Silk',
        ARRAY['Free Size']::text[],
        ARRAY['Rose Beige', 'Champagne Gold']::text[],
        true,
        false,
        false,
        ARRAY[
          'https://images.unsplash.com/photo-1610047402714-2f1d4f5d457f?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1583391733981-1e3e7f6681c6?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1621786030484-4c855eed6974?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1610189020382-6688c1d7df15?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=1200&q=80'
        ]::text[],
        'banarasi-silk'
      ),
      (
        'zeenat-resham-panel-kurti',
        'Zeenat Resham Panel Kurti',
        'Premium panelled kurti with resham detailing, occasion-ready polish, and six curated frames for 360 browsing on the product page.',
        4899::numeric,
        6199::numeric,
        26,
        'Silk Blend',
        ARRAY['S', 'M', 'L', 'XL']::text[],
        ARRAY['Ivory', 'Teal']::text[],
        true,
        true,
        true,
        ARRAY[
          'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1618244972963-dbad68f6d6f5?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80'
        ]::text[],
        'designer-kurtis'
      ),
      (
        'mehfil-zari-a-line-kurti',
        'Mehfil Zari A-Line Kurti',
        'Dressy A-line kurti with zari accents, tonal movement, and a spin-friendly image stack to make the premium silhouette feel more tangible online.',
        5299::numeric,
        6699::numeric,
        22,
        'Viscose Silk',
        ARRAY['S', 'M', 'L', 'XL']::text[],
        ARRAY['Rose Plum', 'Champagne']::text[],
        true,
        false,
        true,
        ARRAY[
          'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1618244972963-dbad68f6d6f5?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=1200&q=80'
        ]::text[],
        'designer-kurtis'
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
      ('maharani-kadwa-heritage-saree', 'Free Size', 'Heritage Maroon', 'VRS-MKHS-FS-HM', 21999::numeric, 26499::numeric, 7),
      ('maharani-kadwa-heritage-saree', 'Free Size', 'Antique Gold', 'VRS-MKHS-FS-AG', 22499::numeric, 26499::numeric, 7),
      ('noor-kora-zari-saree', 'Free Size', 'Rose Beige', 'VRS-NKZS-FS-RB', 16899::numeric, 20999::numeric, 5),
      ('noor-kora-zari-saree', 'Free Size', 'Champagne Gold', 'VRS-NKZS-FS-CG', 17199::numeric, 20999::numeric, 6),
      ('zeenat-resham-panel-kurti', 'S', 'Ivory', 'VRS-ZRPK-S-IV', 4899::numeric, 6199::numeric, 6),
      ('zeenat-resham-panel-kurti', 'M', 'Ivory', 'VRS-ZRPK-M-IV', 4899::numeric, 6199::numeric, 7),
      ('zeenat-resham-panel-kurti', 'L', 'Teal', 'VRS-ZRPK-L-TE', 4999::numeric, 6199::numeric, 7),
      ('zeenat-resham-panel-kurti', 'XL', 'Teal', 'VRS-ZRPK-XL-TE', 4999::numeric, 6199::numeric, 6),
      ('mehfil-zari-a-line-kurti', 'S', 'Rose Plum', 'VRS-MZAK-S-RP', 5299::numeric, 6699::numeric, 5),
      ('mehfil-zari-a-line-kurti', 'M', 'Rose Plum', 'VRS-MZAK-M-RP', 5299::numeric, 6699::numeric, 6),
      ('mehfil-zari-a-line-kurti', 'L', 'Champagne', 'VRS-MZAK-L-CH', 5399::numeric, 6699::numeric, 6),
      ('mehfil-zari-a-line-kurti', 'XL', 'Champagne', 'VRS-MZAK-XL-CH', 5399::numeric, 6699::numeric, 5)
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
