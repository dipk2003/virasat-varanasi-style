WITH category_seed AS (
  SELECT *
  FROM (
    VALUES
      (
        'Premium Sarees',
        'banarasi-silk',
        'Luxury saree edit with premium drapes, bridal zari stories, and 360-ready product galleries.',
        'https://images.unsplash.com/photo-1621786030484-4c855eed6974?auto=format&fit=crop&w=1200&q=80',
        true,
        1
      ),
      (
        'Premium Kurtis',
        'designer-kurtis',
        'Premium kurti edit with occasion silhouettes, refined detailing, and rich multi-angle presentation.',
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1200&q=80',
        true,
        2
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

DELETE FROM public.collection_products
WHERE product_id IN (
  SELECT id
  FROM public.products
  WHERE slug NOT IN (
    'maharani-kadwa-heritage-saree',
    'noor-kora-zari-saree',
    'zeenat-resham-panel-kurti',
    'mehfil-zari-a-line-kurti'
  )
);

DELETE FROM public.product_variants
WHERE product_id IN (
  SELECT id
  FROM public.products
  WHERE slug NOT IN (
    'maharani-kadwa-heritage-saree',
    'noor-kora-zari-saree',
    'zeenat-resham-panel-kurti',
    'mehfil-zari-a-line-kurti'
  )
);

DELETE FROM public.cart_items
WHERE product_id IN (
  SELECT id
  FROM public.products
  WHERE slug NOT IN (
    'maharani-kadwa-heritage-saree',
    'noor-kora-zari-saree',
    'zeenat-resham-panel-kurti',
    'mehfil-zari-a-line-kurti'
  )
);

DELETE FROM public.wishlist
WHERE product_id IN (
  SELECT id
  FROM public.products
  WHERE slug NOT IN (
    'maharani-kadwa-heritage-saree',
    'noor-kora-zari-saree',
    'zeenat-resham-panel-kurti',
    'mehfil-zari-a-line-kurti'
  )
);

DELETE FROM public.reviews
WHERE product_id IN (
  SELECT id
  FROM public.products
  WHERE slug NOT IN (
    'maharani-kadwa-heritage-saree',
    'noor-kora-zari-saree',
    'zeenat-resham-panel-kurti',
    'mehfil-zari-a-line-kurti'
  )
);

DELETE FROM public.products
WHERE slug NOT IN (
  'maharani-kadwa-heritage-saree',
  'noor-kora-zari-saree',
  'zeenat-resham-panel-kurti',
  'mehfil-zari-a-line-kurti'
);

DELETE FROM public.categories
WHERE slug NOT IN ('banarasi-silk', 'designer-kurtis');
