-- ============================================================================
-- 0004_storage_product_images.sql
-- Bucket penyimpanan foto produk & galeri toko ('product-images')
-- Public read; upload/ubah/hapus hanya oleh womanpreneur pada folder <store_id>/...
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- Maksimal 5 MB per file
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Pastikan RLS aktif pada storage.objects (default Supabase sudah aktif)
DROP POLICY IF EXISTS product_images_public_select ON storage.objects;
CREATE POLICY product_images_public_select
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS product_images_seller_insert ON storage.objects;
CREATE POLICY product_images_seller_insert
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'product-images'
    AND public.auth_role() = 'womanpreneur'
    AND public.auth_store_id() IS NOT NULL
    AND (storage.foldername(name))[1] = public.auth_store_id()::text
  );

DROP POLICY IF EXISTS product_images_seller_update ON storage.objects;
CREATE POLICY product_images_seller_update
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'product-images'
    AND public.auth_role() = 'womanpreneur'
    AND public.auth_store_id() IS NOT NULL
    AND (storage.foldername(name))[1] = public.auth_store_id()::text
  )
  WITH CHECK (
    bucket_id = 'product-images'
    AND public.auth_role() = 'womanpreneur'
    AND public.auth_store_id() IS NOT NULL
    AND (storage.foldername(name))[1] = public.auth_store_id()::text
  );

DROP POLICY IF EXISTS product_images_seller_delete ON storage.objects;
CREATE POLICY product_images_seller_delete
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'product-images'
    AND public.auth_role() = 'womanpreneur'
    AND public.auth_store_id() IS NOT NULL
    AND (storage.foldername(name))[1] = public.auth_store_id()::text
  );
