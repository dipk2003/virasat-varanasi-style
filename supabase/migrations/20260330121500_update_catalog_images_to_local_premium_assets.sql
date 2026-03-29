-- Use stable local premium images from /public/premium instead of seeded stock URLs.

UPDATE public.categories
SET
  image_url = CASE slug
    WHEN 'banarasi-silk' THEN '/premium/premium-sarees.jpg'
    WHEN 'designer-kurtis' THEN '/premium/premium-kurtis.jpg'
    ELSE image_url
  END,
  updated_at = now()
WHERE slug IN ('banarasi-silk', 'designer-kurtis');

UPDATE public.products AS p
SET
  images = ARRAY[
    '/premium/premium-sarees.jpg',
    '/premium/bridal-red-silk.jpg',
    '/premium/zari-brocade.jpg'
  ]::text[],
  updated_at = now()
FROM public.categories AS c
WHERE p.category_id = c.id
  AND c.slug = 'banarasi-silk';

UPDATE public.products AS p
SET
  images = ARRAY[
    '/premium/premium-kurtis.jpg',
    '/premium/ivory-chikankari.jpg',
    '/premium/teal-kalamkari.jpg',
    '/premium/soft-casual.jpg'
  ]::text[],
  updated_at = now()
FROM public.categories AS c
WHERE p.category_id = c.id
  AND c.slug = 'designer-kurtis';
