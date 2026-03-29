INSERT INTO public.store_settings (
  store_name,
  brand_slug,
  theme_config
)
SELECT
  'Brand Store',
  'brand-store',
  jsonb_build_object(
    'homepage',
    jsonb_build_object(
      'announcement_bar',
      jsonb_build_object(
        'enabled', true,
        'message_primary', '✦ Limited Collection — Flat 30% Off on Banarasi Silk ✦',
        'message_secondary', '✦ Free Shipping on Orders Above ₹2,999 ✦'
      ),
      'sale_banner',
      jsonb_build_object(
        'enabled', true,
        'eyebrow', 'Festival Special',
        'title_prefix', 'Flat',
        'title_highlight', '30% Off',
        'description', 'On our entire Banarasi Silk Kurti Collection. Limited stock available.',
        'countdown_label', 'Offer Ends In',
        'countdown_days', '02',
        'countdown_hours', '14',
        'countdown_minutes', '36',
        'countdown_seconds', '52',
        'button_label', 'Shop The Sale',
        'button_link', '/shop?category=banarasi-silk'
      ),
      'testimonial_banner',
      jsonb_build_object(
        'enabled', true,
        'eyebrow', 'Voices of Our Patrons',
        'quote', '"The moment I wore my Virasat kurti, I felt like I was draped in history itself."',
        'author', '— Priya Sharma, New Delhi'
      ),
      'collection_cta',
      jsonb_build_object(
        'enabled', true,
        'eyebrow', 'Discover Your Style',
        'title', 'Browse Our Full Collection',
        'description', 'From everyday elegance to festive grandeur — find the perfect kurti for every occasion.',
        'button_label', 'Shop All Products',
        'button_link', '/shop'
      )
    )
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.store_settings
  WHERE brand_slug = 'brand-store'
);

UPDATE public.store_settings
SET theme_config = jsonb_set(
  jsonb_set(
    COALESCE(theme_config, '{}'::jsonb),
    '{homepage,announcement_bar}',
    jsonb_build_object(
      'enabled', true,
      'message_primary', '✦ Limited Collection — Flat 30% Off on Banarasi Silk ✦',
      'message_secondary', '✦ Free Shipping on Orders Above ₹2,999 ✦'
    ) || COALESCE(theme_config #> '{homepage,announcement_bar}', '{}'::jsonb),
    true
  ),
  '{homepage,sale_banner}',
  jsonb_build_object(
    'enabled', true,
    'eyebrow', 'Festival Special',
    'title_prefix', 'Flat',
    'title_highlight', '30% Off',
    'description', 'On our entire Banarasi Silk Kurti Collection. Limited stock available.',
    'countdown_label', 'Offer Ends In',
    'countdown_days', '02',
    'countdown_hours', '14',
    'countdown_minutes', '36',
    'countdown_seconds', '52',
    'button_label', 'Shop The Sale',
    'button_link', '/shop?category=banarasi-silk'
  ) || COALESCE(theme_config #> '{homepage,sale_banner}', '{}'::jsonb),
  true
);
