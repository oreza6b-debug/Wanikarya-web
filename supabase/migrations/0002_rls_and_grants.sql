-- ============================================================================
-- 0002_rls_and_grants.sql
-- Pencabutan grant otomatis, hak akses minimal (least privilege),
-- pengaktifan RLS ketat per peran, dan proteksi kolom sensitif.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. FUNGSI HELPER PERAN & TOKO (SECURITY DEFINER + search_path aman)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.auth_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT CASE
    WHEN auth.uid() IS NULL THEN NULL
    ELSE (SELECT role FROM public.profiles WHERE id = auth.uid())
  END;
$$;

CREATE OR REPLACE FUNCTION public.auth_store_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT CASE
    WHEN auth.uid() IS NULL THEN NULL
    ELSE (SELECT id FROM public.stores WHERE owner_id = auth.uid())
  END;
$$;

REVOKE ALL ON FUNCTION public.auth_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_role() TO anon, authenticated;

REVOKE ALL ON FUNCTION public.auth_store_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_store_id() TO anon, authenticated;

-- ----------------------------------------------------------------------------
-- 2. TRIGGER PROTEKSI KOLOM SENSITIF (Defense-in-Depth)
--    Catatan: SQL Editor / service_role memiliki auth.uid() IS NULL.
-- ----------------------------------------------------------------------------

-- A. Cegah user mengubah kolom role miliknya sendiri di profiles
CREATE OR REPLACE FUNCTION public.guard_profiles_protected_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND public.auth_role() IS DISTINCT FROM 'admin' THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Perubahan peran akun tidak diizinkan.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.guard_profiles_protected_columns() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_guard_profiles_protected_columns ON public.profiles;
CREATE TRIGGER trg_guard_profiles_protected_columns
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profiles_protected_columns();

-- B. Cegah pemilik toko mengubah verified, owner_id, exclude_spotlight
CREATE OR REPLACE FUNCTION public.guard_stores_protected_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND public.auth_role() IS DISTINCT FROM 'admin' THEN
    IF NEW.verified IS DISTINCT FROM OLD.verified THEN
      RAISE EXCEPTION 'Status verifikasi toko hanya dapat diubah oleh Admin.';
    END IF;
    IF NEW.owner_id IS DISTINCT FROM OLD.owner_id THEN
      RAISE EXCEPTION 'Pemilik toko tidak dapat diubah.';
    END IF;
    IF NEW.exclude_spotlight IS DISTINCT FROM OLD.exclude_spotlight THEN
      RAISE EXCEPTION 'Pengaturan Spotlight hanya dapat diubah oleh Admin.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.guard_stores_protected_columns() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_guard_stores_protected_columns ON public.stores;
CREATE TRIGGER trg_guard_stores_protected_columns
  BEFORE UPDATE ON public.stores
  FOR EACH ROW EXECUTE FUNCTION public.guard_stores_protected_columns();

-- C. Cegah penjual mengubah is_featured atau memindahkan store_id produk
CREATE OR REPLACE FUNCTION public.guard_products_protected_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_my_store_id uuid;
BEGIN
  IF auth.uid() IS NOT NULL AND public.auth_role() IS DISTINCT FROM 'admin' THEN
    IF TG_OP = 'INSERT' THEN
      v_my_store_id := public.auth_store_id();
      IF v_my_store_id IS NULL OR NEW.store_id IS DISTINCT FROM v_my_store_id THEN
        RAISE EXCEPTION 'Anda hanya dapat menambah produk untuk toko milik sendiri.';
      END IF;
      NEW.is_featured := false;
    ELSIF TG_OP = 'UPDATE' THEN
      IF NEW.is_featured IS DISTINCT FROM OLD.is_featured THEN
        RAISE EXCEPTION 'Status produk pilihan (is_featured) hanya dapat diatur oleh Admin.';
      END IF;
      IF NEW.store_id IS DISTINCT FROM OLD.store_id THEN
        RAISE EXCEPTION 'Pemindahan produk ke toko lain tidak diizinkan.';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.guard_products_protected_columns() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_guard_products_protected_columns ON public.products;
CREATE TRIGGER trg_guard_products_protected_columns
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.guard_products_protected_columns();

-- ----------------------------------------------------------------------------
-- 3. CABUT GRANT OTOMATIS PADA SELURUH TABEL & BERI HAK MINIMAL
-- ----------------------------------------------------------------------------
REVOKE ALL ON TABLE
  public.profiles,
  public.user_addresses,
  public.villages,
  public.stores,
  public.categories,
  public.products,
  public.order_daily_counters,
  public.orders,
  public.order_items,
  public.order_status_history,
  public.financial_records
FROM PUBLIC, anon, authenticated;

-- Publik + Terautentikasi (Baca katalog)
GRANT SELECT ON public.villages TO anon, authenticated;
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT SELECT ON public.stores TO anon, authenticated;
GRANT SELECT ON public.products TO anon, authenticated;

-- Profil & Alamat (hanya authenticated; role di profiles tidak di-grant UPDATE)
GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE (full_name, phone, avatar_url) ON public.profiles TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_addresses TO authenticated;

-- Toko: pemilik hanya boleh update kolom operasional/profil (tanpa owner_id, verified, exclude_spotlight)
GRANT UPDATE (
  owner_name,
  business_name,
  business_model,
  category,
  address,
  whatsapp_phone,
  instagram_handle,
  quote,
  description,
  story_intro,
  story_background,
  story_focus,
  story_uniqueness,
  story_impact,
  photo_url,
  gallery_urls,
  since_year,
  shipping_cost,
  is_active
) ON public.stores TO authenticated;

-- Produk: penjual boleh tambah/ubah/hapus produknya (tanpa is_featured & tanpa pindah store_id saat update)
GRANT INSERT (
  store_id,
  category_slug,
  slug,
  sku,
  name,
  description,
  price,
  promo_percent,
  stock,
  stock_unit,
  image_url,
  gallery_urls,
  label,
  highlights,
  weight,
  main_ingredient,
  packaging,
  pirt,
  halal,
  is_active
) ON public.products TO authenticated;

GRANT UPDATE (
  category_slug,
  slug,
  sku,
  name,
  description,
  price,
  promo_percent,
  stock,
  stock_unit,
  image_url,
  gallery_urls,
  label,
  highlights,
  weight,
  main_ingredient,
  packaging,
  pirt,
  halal,
  is_active,
  deleted_at
) ON public.products TO authenticated;

GRANT DELETE ON public.products TO authenticated;

-- Pesanan & Keuangan: HANYA BACA (mutasi wajib lewat RPC / trigger DB)
GRANT SELECT ON public.orders TO authenticated;
GRANT SELECT ON public.order_items TO authenticated;
GRANT SELECT ON public.order_status_history TO authenticated;
GRANT SELECT ON public.financial_records TO authenticated;

-- order_daily_counters: tidak ada GRANT sama sekali untuk anon / authenticated.

-- ----------------------------------------------------------------------------
-- 4. AKTIFKAN RLS PADA SELURUH TABEL & PASANG POLICY KETAT
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.villages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_daily_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_records ENABLE ROW LEVEL SECURITY;

-- ---- profiles ----
DROP POLICY IF EXISTS profiles_select_own_or_admin ON public.profiles;
CREATE POLICY profiles_select_own_or_admin
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR public.auth_role() = 'admin');

DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ---- user_addresses ----
DROP POLICY IF EXISTS user_addresses_own_all ON public.user_addresses;
CREATE POLICY user_addresses_own_all
  ON public.user_addresses FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ---- villages ----
DROP POLICY IF EXISTS villages_public_select ON public.villages;
CREATE POLICY villages_public_select
  ON public.villages FOR SELECT
  TO anon, authenticated
  USING (is_approved = true OR public.auth_role() = 'admin');

-- ---- categories ----
DROP POLICY IF EXISTS categories_public_select ON public.categories;
CREATE POLICY categories_public_select
  ON public.categories FOR SELECT
  TO anon, authenticated
  USING (true);

-- ---- stores ----
DROP POLICY IF EXISTS stores_public_or_owner_select ON public.stores;
CREATE POLICY stores_public_or_owner_select
  ON public.stores FOR SELECT
  TO anon, authenticated
  USING (
    (verified = true AND is_active = true)
    OR owner_id = auth.uid()
    OR public.auth_role() = 'admin'
  );

DROP POLICY IF EXISTS stores_owner_update ON public.stores;
CREATE POLICY stores_owner_update
  ON public.stores FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid() AND public.auth_role() = 'womanpreneur')
  WITH CHECK (owner_id = auth.uid() AND public.auth_role() = 'womanpreneur');

-- ---- products ----
DROP POLICY IF EXISTS products_public_or_owner_select ON public.products;
CREATE POLICY products_public_or_owner_select
  ON public.products FOR SELECT
  TO anon, authenticated
  USING (
    (
      is_active = true
      AND deleted_at IS NULL
      AND EXISTS (
        SELECT 1 FROM public.stores s
        WHERE s.id = products.store_id
          AND s.verified = true
          AND s.is_active = true
      )
    )
    OR (
      -- Catatan query seller: daftar produk penjual wajib memfilter deleted_at IS NULL
      store_id = public.auth_store_id()
      AND public.auth_role() = 'womanpreneur'
    )
    OR public.auth_role() = 'admin'
  );

DROP POLICY IF EXISTS products_owner_insert ON public.products;
CREATE POLICY products_owner_insert
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (
    store_id = public.auth_store_id()
    AND public.auth_role() = 'womanpreneur'
  );

DROP POLICY IF EXISTS products_owner_update ON public.products;
CREATE POLICY products_owner_update
  ON public.products FOR UPDATE
  TO authenticated
  USING (
    store_id = public.auth_store_id()
    AND public.auth_role() = 'womanpreneur'
  )
  WITH CHECK (
    store_id = public.auth_store_id()
    AND public.auth_role() = 'womanpreneur'
  );

DROP POLICY IF EXISTS products_owner_delete ON public.products;
CREATE POLICY products_owner_delete
  ON public.products FOR DELETE
  TO authenticated
  USING (
    store_id = public.auth_store_id()
    AND public.auth_role() = 'womanpreneur'
  );

-- ---- orders (baca saja; mutasi lewat RPC) ----
DROP POLICY IF EXISTS orders_select_party_or_admin ON public.orders;
CREATE POLICY orders_select_party_or_admin
  ON public.orders FOR SELECT
  TO authenticated
  USING (
    buyer_id = auth.uid()
    OR (store_id = public.auth_store_id() AND public.auth_role() = 'womanpreneur')
    OR public.auth_role() = 'admin'
  );

-- ---- order_items (baca saja; mengikuti visibilitas orders) ----
DROP POLICY IF EXISTS order_items_select_party_or_admin ON public.order_items;
CREATE POLICY order_items_select_party_or_admin
  ON public.order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND (
          o.buyer_id = auth.uid()
          OR (o.store_id = public.auth_store_id() AND public.auth_role() = 'womanpreneur')
          OR public.auth_role() = 'admin'
        )
    )
  );

-- ---- order_status_history (baca saja; mengikuti visibilitas orders) ----
DROP POLICY IF EXISTS order_status_history_select_party_or_admin ON public.order_status_history;
CREATE POLICY order_status_history_select_party_or_admin
  ON public.order_status_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_status_history.order_id
        AND (
          o.buyer_id = auth.uid()
          OR (o.store_id = public.auth_store_id() AND public.auth_role() = 'womanpreneur')
          OR public.auth_role() = 'admin'
        )
    )
  );

-- ---- financial_records (privasi mutlak: hanya pemilik toko & admin, baca saja) ----
DROP POLICY IF EXISTS financial_records_select_owner_or_admin ON public.financial_records;
CREATE POLICY financial_records_select_owner_or_admin
  ON public.financial_records FOR SELECT
  TO authenticated
  USING (
    (store_id = public.auth_store_id() AND public.auth_role() = 'womanpreneur')
    OR public.auth_role() = 'admin'
  );
