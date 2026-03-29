WITH image_sets AS (
  SELECT *
  FROM (
    VALUES
      (
        'saree-royal',
        ARRAY[
          'https://images.unsplash.com/photo-1621786030484-4c855eed6974?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1610189020382-6688c1d7df15?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1610047402714-2f1d4f5d457f?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1583391733981-1e3e7f6681c6?auto=format&fit=crop&w=1200&q=80'
        ]::text[]
      ),
      (
        'saree-tissue',
        ARRAY[
          'https://images.unsplash.com/photo-1610047402714-2f1d4f5d457f?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1583391733981-1e3e7f6681c6?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1621786030484-4c855eed6974?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1610189020382-6688c1d7df15?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=1200&q=80'
        ]::text[]
      ),
      (
        'saree-bridal',
        ARRAY[
          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1621786030484-4c855eed6974?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1610189020382-6688c1d7df15?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1583391733981-1e3e7f6681c6?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1610047402714-2f1d4f5d457f?auto=format&fit=crop&w=1200&q=80'
        ]::text[]
      ),
      (
        'saree-opulent',
        ARRAY[
          'https://images.unsplash.com/photo-1583391733981-1e3e7f6681c6?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1621786030484-4c855eed6974?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1610047402714-2f1d4f5d457f?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1610189020382-6688c1d7df15?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=1200&q=80'
        ]::text[]
      ),
      (
        'kurti-ivory',
        ARRAY[
          'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1618244972963-dbad68f6d6f5?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80'
        ]::text[]
      ),
      (
        'kurti-festive',
        ARRAY[
          'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1618244972963-dbad68f6d6f5?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=1200&q=80'
        ]::text[]
      ),
      (
        'kurti-rose',
        ARRAY[
          'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1618244972963-dbad68f6d6f5?auto=format&fit=crop&w=1200&q=80'
        ]::text[]
      ),
      (
        'kurti-regal',
        ARRAY[
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1618244972963-dbad68f6d6f5?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80'
        ]::text[]
      )
  ) AS t(image_set_key, images)
),
product_seed AS (
  SELECT *
  FROM (
    VALUES
      ('rangmahal-zari-jangla-saree', 'Rangmahal Zari Jangla Saree', 'Grand Banarasi saree with ornate jangla weave, regal shine, and a six-frame premium showroom gallery.', 19899::numeric, 23999::numeric, 12, 'Pure Katan Silk', ARRAY['Free Size']::text[], ARRAY['Rani Red']::text[], true, true, false, 'saree-royal', 'banarasi-silk'),
      ('shahi-meenakari-tissue-saree', 'Shahi Meenakari Tissue Saree', 'Light-catching tissue saree with refined meenakari detailing made for reception edits and luxury gifting.', 17499::numeric, 21499::numeric, 10, 'Tissue Silk', ARRAY['Free Size']::text[], ARRAY['Champagne Rose']::text[], true, false, false, 'saree-tissue', 'banarasi-silk'),
      ('gulbahar-katan-brocade-saree', 'Gulbahar Katan Brocade Saree', 'Rich brocade saree with ceremonial drape weight, dense zari texture, and a high-end presentation stack.', 18699::numeric, 22999::numeric, 11, 'Katan Brocade', ARRAY['Free Size']::text[], ARRAY['Wine Gold']::text[], true, true, false, 'saree-opulent', 'banarasi-silk'),
      ('chandni-jamdani-silk-saree', 'Chandni Jamdani Silk Saree', 'Soft luminous silk saree with jamdani-inspired motifs and a premium look tailored for festive evenings.', 16499::numeric, 19999::numeric, 13, 'Silk Jamdani', ARRAY['Free Size']::text[], ARRAY['Moon Ivory']::text[], true, false, false, 'saree-tissue', 'banarasi-silk'),
      ('varanasi-rani-jaal-saree', 'Varanasi Rani Jaal Saree', 'Statement Banarasi saree with a classic jaal story, heirloom drape, and polished luxury visuals.', 20999::numeric, 24999::numeric, 9, 'Banarasi Silk', ARRAY['Free Size']::text[], ARRAY['Rani Magenta']::text[], true, true, false, 'saree-royal', 'banarasi-silk'),
      ('sitara-sona-roopa-saree', 'Sitara Sona Roopa Saree', 'Celebration saree layered with sona-roopa highlights and elevated imagery for a richer browsing experience.', 17999::numeric, 21999::numeric, 12, 'Silk Blend', ARRAY['Free Size']::text[], ARRAY['Soft Gold']::text[], true, false, false, 'saree-tissue', 'banarasi-silk'),
      ('padmini-cutwork-organza-saree', 'Padmini Cutwork Organza Saree', 'Sheer organza saree with cutwork borders, airy luxury, and a six-angle gallery that feels boutique-grade.', 15999::numeric, 19499::numeric, 14, 'Organza Silk', ARRAY['Free Size']::text[], ARRAY['Blush Beige']::text[], true, false, false, 'saree-opulent', 'banarasi-silk'),
      ('ambar-tilfi-bridal-saree', 'Ambar Tilfi Bridal Saree', 'Heavy bridal Banarasi saree with tilfi weave notes and richly lit frames made to signal premium craftsmanship.', 23499::numeric, 27999::numeric, 8, 'Pure Bridal Silk', ARRAY['Free Size']::text[], ARRAY['Heirloom Amber']::text[], true, true, false, 'saree-bridal', 'banarasi-silk'),
      ('roshni-kadwa-rose-saree', 'Roshni Kadwa Rose Saree', 'Rose-led festive saree finished with kadwa-inspired detailing and a modern premium product presentation.', 18999::numeric, 22999::numeric, 10, 'Kadwa Silk', ARRAY['Free Size']::text[], ARRAY['Rose Gold']::text[], true, false, false, 'saree-bridal', 'banarasi-silk'),
      ('zarina-khaddi-georgette-saree', 'Zarina Khaddi Georgette Saree', 'Fluid khaddi georgette saree with luxe zari movement for evening occasions and elevated digital merchandising.', 15499::numeric, 18999::numeric, 15, 'Khaddi Georgette', ARRAY['Free Size']::text[], ARRAY['Deep Plum']::text[], true, false, false, 'saree-opulent', 'banarasi-silk'),
      ('sonchiriya-mughal-booti-saree', 'Sonchiriya Mughal Booti Saree', 'Traditional booti saree reworked with premium imagery, rich tone, and ceremonial Banarasi character.', 17299::numeric, 20999::numeric, 12, 'Silk Brocade', ARRAY['Free Size']::text[], ARRAY['Saffron Gold']::text[], true, false, false, 'saree-royal', 'banarasi-silk'),
      ('husn-resham-kora-saree', 'Husn Resham Kora Saree', 'Refined kora silk saree with soft resham accents and an opulent six-shot gallery for premium merchandising.', 16699::numeric, 20499::numeric, 11, 'Kora Silk', ARRAY['Free Size']::text[], ARRAY['Powder Peach']::text[], true, false, false, 'saree-tissue', 'banarasi-silk'),
      ('ambika-rani-pink-saree', 'Ambika Rani Pink Saree', 'Bold rani pink Banarasi saree with celebratory richness and a premium visual stack tuned for conversion.', 19399::numeric, 23499::numeric, 9, 'Banarasi Katan', ARRAY['Free Size']::text[], ARRAY['Rani Pink']::text[], true, true, false, 'saree-bridal', 'banarasi-silk'),
      ('heirloom-tissue-zari-saree', 'Heirloom Tissue Zari Saree', 'Statement tissue zari saree with graceful shimmer, heirloom mood, and a luxury-first storefront gallery.', 18299::numeric, 22499::numeric, 10, 'Tissue Zari Silk', ARRAY['Free Size']::text[], ARRAY['Antique Champagne']::text[], true, false, false, 'saree-opulent', 'banarasi-silk'),
      ('gulnaar-chanderi-panel-kurti', 'Gulnaar Chanderi Panel Kurti', 'Premium panelled kurti with soft chanderi sheen and six rich frames that create a boutique-style product story.', 4699::numeric, 5899::numeric, 24, 'Chanderi', ARRAY['S','M','L','XL']::text[], ARRAY['Deep Rose']::text[], true, true, true, 'kurti-festive', 'designer-kurtis'),
      ('sahiba-embroidered-straight-kurti', 'Sahiba Embroidered Straight Kurti', 'Straight festive kurti with delicate embroidery placement and a premium gallery that highlights fabric fall.', 4399::numeric, 5499::numeric, 28, 'Viscose Silk', ARRAY['S','M','L','XL']::text[], ARRAY['Ivory Beige']::text[], true, false, true, 'kurti-ivory', 'designer-kurtis'),
      ('noor-jacquard-yoke-kurti', 'Noor Jacquard Yoke Kurti', 'Contemporary kurti with jacquard yoke detailing, polished finish, and rich multi-angle product imagery.', 4899::numeric, 6099::numeric, 22, 'Jacquard Blend', ARRAY['S','M','L','XL']::text[], ARRAY['Midnight Teal']::text[], true, true, true, 'kurti-regal', 'designer-kurtis'),
      ('amber-silk-flare-kurti', 'Amber Silk Flare Kurti', 'Flared silk kurti with premium movement, occasion-ready volume, and a high-end visual merchandising setup.', 5299::numeric, 6599::numeric, 18, 'Silk Blend', ARRAY['S','M','L','XL']::text[], ARRAY['Amber Gold']::text[], true, true, true, 'kurti-festive', 'designer-kurtis'),
      ('nazakat-organza-layer-kurti', 'Nazakat Organza Layer Kurti', 'Layered kurti with organza finesse, refined drape, and six premium frames for a more luxurious PDP look.', 5199::numeric, 6499::numeric, 16, 'Organza Blend', ARRAY['S','M','L','XL']::text[], ARRAY['Pearl Cream']::text[], true, false, true, 'kurti-ivory', 'designer-kurtis'),
      ('sunehri-brocade-trim-kurti', 'Sunehri Brocade Trim Kurti', 'Dress kurti with brocade trim accents and upscale imagery designed to make the silhouette feel richer online.', 4599::numeric, 5799::numeric, 23, 'Brocade Trim Blend', ARRAY['S','M','L','XL']::text[], ARRAY['Soft Gold']::text[], true, false, true, 'kurti-regal', 'designer-kurtis'),
      ('riwaayat-handwork-angrakha-kurti', 'Riwaayat Handwork Angrakha Kurti', 'Angrakha-inspired premium kurti with handwork notes and a six-shot gallery that sells craft and movement.', 5499::numeric, 6899::numeric, 17, 'Silk Cotton Blend', ARRAY['S','M','L','XL']::text[], ARRAY['Berry Plum']::text[], true, true, true, 'kurti-rose', 'designer-kurtis'),
      ('kashni-motif-anarkali-kurti', 'Kashni Motif Anarkali Kurti', 'Anarkali-style kurti with elongated flare, woven motif language, and premium product photography cues.', 5699::numeric, 7099::numeric, 15, 'Muslin Silk', ARRAY['S','M','L','XL']::text[], ARRAY['Kashni Lavender']::text[], true, true, true, 'kurti-festive', 'designer-kurtis'),
      ('tara-zari-neckline-kurti', 'Tara Zari Neckline Kurti', 'Elegant festive kurti with highlighted neckline work and elevated gallery imagery for a polished luxury feel.', 4199::numeric, 5299::numeric, 26, 'Viscose Chanderi', ARRAY['S','M','L','XL']::text[], ARRAY['Champagne Beige']::text[], true, false, true, 'kurti-ivory', 'designer-kurtis'),
      ('husnara-panelled-festive-kurti', 'Husnara Panelled Festive Kurti', 'Panelled kurti silhouette with rich festive attitude and six premium images to enhance perceived value.', 4999::numeric, 6199::numeric, 21, 'Silk Viscose', ARRAY['S','M','L','XL']::text[], ARRAY['Rosewood']::text[], true, false, true, 'kurti-rose', 'designer-kurtis'),
      ('ziya-chanderi-overlay-kurti', 'Ziya Chanderi Overlay Kurti', 'Overlay kurti with airy premium finish, occasion styling, and boutique-grade multi-angle presentation.', 4799::numeric, 5999::numeric, 22, 'Chanderi Overlay', ARRAY['S','M','L','XL']::text[], ARRAY['Ivory Gold']::text[], true, false, true, 'kurti-ivory', 'designer-kurtis'),
      ('firdaus-meenakari-print-kurti', 'Firdaus Meenakari Print Kurti', 'Premium printed kurti with meenakari-inspired palette and a six-image gallery that amplifies visual richness.', 4499::numeric, 5699::numeric, 24, 'Printed Silk Blend', ARRAY['S','M','L','XL']::text[], ARRAY['Jewel Green']::text[], true, false, true, 'kurti-regal', 'designer-kurtis'),
      ('raahi-kadwa-detail-kurti', 'Raahi Kadwa Detail Kurti', 'Refined festive kurti with kadwa-inspired accents, premium fall, and elegant multi-angle storytelling.', 5399::numeric, 6699::numeric, 18, 'Tissue Silk Blend', ARRAY['S','M','L','XL']::text[], ARRAY['Antique Rose']::text[], true, true, true, 'kurti-rose', 'designer-kurtis'),
      ('vasundhara-occasion-kurti', 'Vasundhara Occasion Kurti', 'Occasion-led premium kurti with clean luxury styling and a polished six-frame presentation for the storefront.', 5099::numeric, 6399::numeric, 20, 'Premium Viscose Silk', ARRAY['S','M','L','XL']::text[], ARRAY['Warm Sand']::text[], true, false, true, 'kurti-festive', 'designer-kurtis')
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
    image_set_key,
    category_slug
  )
),
resolved_seed AS (
  SELECT
    product_seed.slug,
    product_seed.name,
    product_seed.description,
    product_seed.price,
    product_seed.compare_at_price,
    product_seed.stock_quantity,
    product_seed.fabric,
    product_seed.sizes,
    product_seed.colors,
    product_seed.is_active,
    product_seed.is_featured,
    product_seed.is_custom_designable,
    image_sets.images,
    product_seed.category_slug
  FROM product_seed
  JOIN image_sets ON image_sets.image_set_key = product_seed.image_set_key
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
  resolved_seed.name,
  resolved_seed.slug,
  resolved_seed.description,
  resolved_seed.price,
  resolved_seed.compare_at_price,
  resolved_seed.stock_quantity,
  5,
  resolved_seed.images,
  resolved_seed.sizes,
  resolved_seed.colors,
  resolved_seed.fabric,
  resolved_seed.is_active,
  resolved_seed.is_featured,
  resolved_seed.is_custom_designable
FROM resolved_seed
JOIN public.categories ON categories.slug = resolved_seed.category_slug
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
