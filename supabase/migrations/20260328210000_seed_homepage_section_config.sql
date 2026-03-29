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
    '{homepage,testimonial_banner}',
    jsonb_build_object(
      'enabled', true,
      'eyebrow', 'Voices of Our Patrons',
      'quote', '"The moment I wore my Virasat kurti, I felt like I was draped in history itself."',
      'author', '— Priya Sharma, New Delhi'
    ) || COALESCE(theme_config #> '{homepage,testimonial_banner}', '{}'::jsonb),
    true
  ),
  '{homepage,collection_cta}',
  jsonb_build_object(
    'enabled', true,
    'eyebrow', 'Discover Your Style',
    'title', 'Browse Our Full Collection',
    'description', 'From everyday elegance to festive grandeur — find the perfect kurti for every occasion.',
    'button_label', 'Shop All Products',
    'button_link', '/shop'
  ) || COALESCE(theme_config #> '{homepage,collection_cta}', '{}'::jsonb),
  true
);
