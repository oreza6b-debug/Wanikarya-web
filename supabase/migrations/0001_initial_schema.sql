-- ============================================================================
-- 0001_initial_schema.sql
-- Skema dasar database MVP Marketplace WaniKarya (Supabase / PostgreSQL)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Helper timestamp updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- ----------------------------------------------------------------------------
-- 1. PROFILES (1:1 dengan auth.users)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT 'Pengguna WaniKarya',
  phone text,
  role text NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'womanpreneur', 'admin')),
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 2. USER_ADDRESSES (Alamat Pengiriman Pembeli)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT 'Rumah',
  recipient_name text NOT NULL CHECK (char_length(trim(recipient_name)) > 0),
  recipient_phone text NOT NULL CHECK (char_length(trim(recipient_phone)) > 0),
  full_address text NOT NULL CHECK (char_length(trim(full_address)) > 0),
  notes text,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON public.user_addresses(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_primary_address_per_user
  ON public.user_addresses(user_id)
  WHERE is_primary = true;

DROP TRIGGER IF EXISTS trg_user_addresses_updated_at ON public.user_addresses;
CREATE TRIGGER trg_user_addresses_updated_at
  BEFORE UPDATE ON public.user_addresses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3. VILLAGES (Desa Wisata Mitra)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.villages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  location text NOT NULL,
  description text NOT NULL,
  clusters integer NOT NULL DEFAULT 0 CHECK (clusters >= 0),
  facilities text,
  badge text,
  elevation text,
  families text,
  water_source text,
  image_url text,
  maps_url text,
  is_approved boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_villages_updated_at ON public.villages;
CREATE TRIGGER trg_villages_updated_at
  BEFORE UPDATE ON public.villages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 4. STORES (Toko / Profil Usaha Womanpreneur; cocok dengan /usaha/profil)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid UNIQUE REFERENCES public.profiles(id) ON DELETE RESTRICT,
  village_id uuid NOT NULL REFERENCES public.villages(id) ON DELETE RESTRICT,
  slug text UNIQUE NOT NULL,
  owner_name text NOT NULL,
  business_name text NOT NULL,
  business_model text NOT NULL DEFAULT 'keduanya' CHECK (business_model IN ('produk', 'jasa', 'keduanya')),
  category text NOT NULL,
  address text,
  whatsapp_phone text,
  instagram_handle text,
  quote text,
  description text NOT NULL,
  story_intro text,
  story_background text,
  story_focus text,
  story_uniqueness text,
  story_impact text,
  photo_url text,
  gallery_urls text[] NOT NULL DEFAULT '{}',
  since_year integer,
  shipping_cost integer NOT NULL DEFAULT 15000 CHECK (shipping_cost >= 0),
  verified boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  exclude_spotlight boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stores_village_id ON public.stores(village_id);

DROP TRIGGER IF EXISTS trg_stores_updated_at ON public.stores;
CREATE TRIGGER trg_stores_updated_at
  BEFORE UPDATE ON public.stores
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 5. CATEGORIES (Master Kategori Produk)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  slug text PRIMARY KEY,
  name text NOT NULL,
  sub text,
  sort_order integer NOT NULL DEFAULT 0
);

-- ----------------------------------------------------------------------------
-- 6. PRODUCTS (Katalog Produk; cocok dengan /usaha/produk & HerMarket)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  category_slug text NOT NULL REFERENCES public.categories(slug) ON DELETE RESTRICT,
  slug text UNIQUE NOT NULL,
  sku text,
  name text NOT NULL CHECK (char_length(trim(name)) BETWEEN 1 AND 80),
  description text NOT NULL,
  price integer NOT NULL CHECK (price > 0),
  promo_percent integer CHECK (promo_percent IS NULL OR (promo_percent >= 1 AND promo_percent <= 90)),
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  stock_unit text NOT NULL DEFAULT 'bungkus',
  image_url text NOT NULL,
  gallery_urls text[] NOT NULL DEFAULT '{}',
  label text,
  highlights text[] NOT NULL DEFAULT '{}',
  weight text,
  main_ingredient text,
  packaging text,
  pirt text,
  halal text,
  is_active boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_store_id ON public.products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_category_slug ON public.products(category_slug);
CREATE INDEX IF NOT EXISTS idx_products_public_list
  ON public.products(is_active, created_at DESC)
  WHERE deleted_at IS NULL;

DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 7. ORDER_DAILY_COUNTERS (Internal generator kode WK-YYYYMMDD-nnnnn)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_daily_counters (
  counter_date date PRIMARY KEY,
  last_seq integer NOT NULL DEFAULT 0
);

-- ----------------------------------------------------------------------------
-- 8. ORDERS (Pesanan per Toko; snapshot harga/alamat/ongkir saat checkout)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code text UNIQUE NOT NULL,
  checkout_group_id uuid,
  buyer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE RESTRICT,
  store_slug_snapshot text NOT NULL,
  store_name_snapshot text NOT NULL,
  buyer_name_snapshot text NOT NULL,
  buyer_phone_snapshot text NOT NULL,
  shipping_address_snapshot text NOT NULL,
  buyer_note text,
  subtotal_amount integer NOT NULL CHECK (subtotal_amount > 0),
  shipping_cost integer NOT NULL CHECK (shipping_cost >= 0),
  total_amount integer NOT NULL CHECK (total_amount = subtotal_amount + shipping_cost),
  status text NOT NULL DEFAULT 'dibayarkan' CHECK (status IN ('dibayarkan', 'dikemas', 'dikirim', 'selesai', 'dibatalkan')),
  payment_method text NOT NULL DEFAULT 'qris' CHECK (payment_method IN ('qris', 'va', 'cod')),
  payment_status text NOT NULL DEFAULT 'paid_demo' CHECK (payment_status IN ('paid_demo', 'refunded_demo')),
  courier_name text CHECK (courier_name IS NULL OR courier_name IN ('J&T Express', 'Kurir BUMDes Gabugan')),
  tracking_number text,
  cancel_reason text,
  cancelled_by text CHECK (cancelled_by IS NULL OR cancelled_by IN ('Buyer', 'Womanpreneur', 'Sistem')),
  paid_at timestamptz NOT NULL DEFAULT now(),
  packed_at timestamptz,
  shipped_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_buyer_created ON public.orders(buyer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_store_status_created ON public.orders(store_id, status, created_at DESC);

DROP TRIGGER IF EXISTS trg_orders_updated_at ON public.orders;
CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 9. ORDER_ITEMS (Snapshot Item Pesanan)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name_snapshot text NOT NULL,
  product_image_snapshot text,
  category_slug_snapshot text NOT NULL,
  unit_price integer NOT NULL CHECK (unit_price > 0),
  normal_price integer,
  promo_label text,
  quantity integer NOT NULL CHECK (quantity > 0),
  line_total integer GENERATED ALWAYS AS (unit_price * quantity) STORED
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- ----------------------------------------------------------------------------
-- 10. ORDER_STATUS_HISTORY (Jejak Perubahan Status & Pelaku)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('dibayarkan', 'dikemas', 'dikirim', 'selesai', 'dibatalkan')),
  actor_role text NOT NULL CHECK (actor_role IN ('Buyer', 'Womanpreneur', 'Sistem')),
  actor_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id
  ON public.order_status_history(order_id, created_at ASC);

-- ----------------------------------------------------------------------------
-- 11. FINANCIAL_RECORDS (Catatan Pendapatan Otomatis, Baca Saja, Imutabel)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.financial_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE RESTRICT,
  order_id uuid UNIQUE NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT,
  order_code text NOT NULL,
  amount integer NOT NULL CHECK (amount > 0),
  shipping_cost_info integer NOT NULL CHECK (shipping_cost_info >= 0),
  completed_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_financial_records_store_completed
  ON public.financial_records(store_id, completed_at DESC);
