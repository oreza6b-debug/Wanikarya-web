-- ============================================================================
-- 0003_rpcs_and_triggers.sql
-- Trigger pembuatan profil otomatis, imutabilitas keuangan, pencatatan
-- pendapatan otomatis, dan RPC transaksi pesanan + stok + state machine.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TRIGGER PEMBUATAN PROFIL OTOMATIS SAAT DAFTAR (Selalu role = 'buyer')
--    Tetap berhasil meski full_name atau phone kosong/NULL.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_full_name text;
  v_phone text;
BEGIN
  v_full_name := COALESCE(
    NULLIF(trim(NEW.raw_user_meta_data ->> 'full_name'), ''),
    NULLIF(trim(NEW.raw_user_meta_data ->> 'name'), ''),
    NULLIF(split_part(COALESCE(NEW.email, ''), '@', 1), ''),
    'Pengguna WaniKarya'
  );

  v_phone := NULLIF(trim(COALESCE(NEW.raw_user_meta_data ->> 'phone', NEW.phone, '')), '');

  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (NEW.id, v_full_name, v_phone, 'buyer')
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 2. IMUTABILITAS & PENCATATAN OTOMATIS FINANCIAL_RECORDS (FR-FIN-01, 02, 08)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.prevent_financial_record_mutation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RAISE EXCEPTION 'Catatan pendapatan bersifat permanen dan tidak dapat diubah atau dihapus.';
END;
$$;

REVOKE ALL ON FUNCTION public.prevent_financial_record_mutation() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_prevent_financial_record_mutation ON public.financial_records;
CREATE TRIGGER trg_prevent_financial_record_mutation
  BEFORE UPDATE OR DELETE ON public.financial_records
  FOR EACH ROW EXECUTE FUNCTION public.prevent_financial_record_mutation();

CREATE OR REPLACE FUNCTION public.record_finance_on_order_complete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.status = 'selesai' AND OLD.status IS DISTINCT FROM 'selesai' THEN
    INSERT INTO public.financial_records (
      store_id,
      order_id,
      order_code,
      amount,
      shipping_cost_info,
      completed_at
    ) VALUES (
      NEW.store_id,
      NEW.id,
      NEW.order_code,
      NEW.subtotal_amount, -- Subtotal produk setelah promo, TANPA ongkir (FR-FIN-02)
      NEW.shipping_cost,
      COALESCE(NEW.completed_at, now())
    )
    ON CONFLICT (order_id) DO NOTHING; -- Tepat satu kali (FR-FIN-08)
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.record_finance_on_order_complete() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_record_finance_on_order_complete ON public.orders;
CREATE TRIGGER trg_record_finance_on_order_complete
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.record_finance_on_order_complete();

-- ----------------------------------------------------------------------------
-- 3. GENERATOR KODE PESANAN UNIK HARIAN (WK-YYYYMMDD-nnnnn, zona Asia/Jakarta)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.next_order_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_today date := (now() AT TIME ZONE 'Asia/Jakarta')::date;
  v_seq integer;
BEGIN
  INSERT INTO public.order_daily_counters (counter_date, last_seq)
  VALUES (v_today, 1)
  ON CONFLICT (counter_date)
  DO UPDATE SET last_seq = public.order_daily_counters.last_seq + 1
  RETURNING last_seq INTO v_seq;

  RETURN 'WK-' || to_char(v_today, 'YYYYMMDD') || '-' || lpad(v_seq::text, 5, '0');
END;
$$;

REVOKE ALL ON FUNCTION public.next_order_code() FROM PUBLIC, anon, authenticated;

-- ----------------------------------------------------------------------------
-- 4. RPC PEMBUATAN PESANAN SIMULASI & PENGURANGAN STOK ATOMIK (FR-ORD-05, SKN-02)
--    p_items format: [{"product_id": "<uuid>", "quantity": 2}, ...]
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.rpc_create_order_demo(
  p_address_id uuid,
  p_items jsonb,
  p_payment_method text DEFAULT 'qris',
  p_buyer_note text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_addr public.user_addresses%ROWTYPE;
  v_group_id uuid := gen_random_uuid();
  v_store_id uuid;
  v_store public.stores%ROWTYPE;
  v_item record;
  v_product public.products%ROWTYPE;
  v_unit_price integer;
  v_normal_price integer;
  v_promo_label text;
  v_subtotal integer;
  v_order_id uuid;
  v_order_code text;
  v_results jsonb := '[]'::jsonb;
  v_now timestamptz := now();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Autentikasi diperlukan untuk membuat pesanan.';
  END IF;

  IF p_payment_method NOT IN ('qris', 'va', 'cod') THEN
    RAISE EXCEPTION 'Metode pembayaran simulasi tidak valid.';
  END IF;

  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Daftar item pesanan tidak boleh kosong.';
  END IF;

  -- Validasi alamat milik user login (SKN-05)
  SELECT * INTO v_addr
  FROM public.user_addresses
  WHERE id = p_address_id AND user_id = v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Alamat pengiriman tidak ditemukan atau bukan milik akun Anda.';
  END IF;

  -- Validasi struktur item & agregasi quantity per product_id dalam temp table
  CREATE TEMP TABLE IF NOT EXISTS _tmp_req_items (
    product_id uuid PRIMARY KEY,
    quantity integer NOT NULL
  ) ON COMMIT DROP;
  TRUNCATE _tmp_req_items;

  INSERT INTO _tmp_req_items (product_id, quantity)
  SELECT
    (elem ->> 'product_id')::uuid AS product_id,
    SUM((elem ->> 'quantity')::integer)::integer AS quantity
  FROM jsonb_array_elements(p_items) AS elem
  GROUP BY (elem ->> 'product_id')::uuid;

  IF EXISTS (SELECT 1 FROM _tmp_req_items WHERE quantity IS NULL OR quantity <= 0) THEN
    RAISE EXCEPTION 'Jumlah pembelian setiap produk harus minimal 1.';
  END IF;

  -- Kunci seluruh baris produk dengan urutan deterministik agar bebas deadlock & race condition
  PERFORM 1
  FROM public.products p
  JOIN _tmp_req_items r ON r.product_id = p.id
  ORDER BY p.id ASC
  FOR UPDATE OF p;

  -- Pastikan semua product_id valid, aktif, tidak terhapus, dan stok cukup
  FOR v_item IN
    SELECT r.product_id, r.quantity, p.id AS found_id, p.name, p.is_active, p.deleted_at, p.stock
    FROM _tmp_req_items r
    LEFT JOIN public.products p ON p.id = r.product_id
    ORDER BY r.product_id ASC
  LOOP
    IF v_item.found_id IS NULL THEN
      RAISE EXCEPTION 'Produk tidak ditemukan.';
    END IF;
    IF v_item.deleted_at IS NOT NULL OR v_item.is_active IS NOT TRUE THEN
      RAISE EXCEPTION 'Produk "%" sedang tidak aktif atau telah dihapus.', v_item.name;
    END IF;
    IF v_item.stock < v_item.quantity THEN
      RAISE EXCEPTION 'Stok produk "%" tidak mencukupi (tersisa %).', v_item.name, v_item.stock;
    END IF;
  END LOOP;

  -- Pecah menjadi satu pesanan per toko (mendukung Beli Sekarang MVP & keranjang multi-toko)
  FOR v_store_id IN
    SELECT DISTINCT p.store_id
    FROM public.products p
    JOIN _tmp_req_items r ON r.product_id = p.id
    ORDER BY p.store_id ASC
  LOOP
    SELECT * INTO v_store
    FROM public.stores
    WHERE id = v_store_id
    FOR SHARE;

    IF NOT FOUND OR v_store.verified IS NOT TRUE OR v_store.is_active IS NOT TRUE THEN
      RAISE EXCEPTION 'Toko "%" belum terverifikasi atau sedang tutup.', COALESCE(v_store.business_name, 'terkait');
    END IF;

    IF v_store.owner_id IS NULL THEN
      RAISE EXCEPTION 'Toko ini belum bisa menerima pesanan.';
    END IF;

    -- Larangan membeli produk toko sendiri (SKN-13)
    IF v_store.owner_id = v_user_id THEN
      RAISE EXCEPTION 'Anda tidak dapat membeli produk dari toko milik sendiri.';
    END IF;

    v_subtotal := 0;

    -- Hitung subtotal di server konsisten dengan rumus harga promo UI:
    -- Math.round((price * (100 - promoPercent)) / 100)
    FOR v_item IN
      SELECT r.product_id, r.quantity
      FROM _tmp_req_items r
      JOIN public.products p ON p.id = r.product_id
      WHERE p.store_id = v_store_id
      ORDER BY p.id ASC
    LOOP
      SELECT * INTO v_product FROM public.products WHERE id = v_item.product_id;

      IF v_product.promo_percent IS NOT NULL AND v_product.promo_percent BETWEEN 1 AND 90 THEN
        v_unit_price := round((v_product.price::numeric * (100 - v_product.promo_percent)) / 100.0)::integer;
      ELSE
        v_unit_price := v_product.price;
      END IF;

      IF v_unit_price <= 0 THEN
        RAISE EXCEPTION 'Harga akhir produk "%" tidak valid.', v_product.name;
      END IF;

      v_subtotal := v_subtotal + (v_unit_price * v_item.quantity);
    END LOOP;

    v_order_code := public.next_order_code();

    INSERT INTO public.orders (
      order_code,
      checkout_group_id,
      buyer_id,
      store_id,
      store_slug_snapshot,
      store_name_snapshot,
      buyer_name_snapshot,
      buyer_phone_snapshot,
      shipping_address_snapshot,
      buyer_note,
      subtotal_amount,
      shipping_cost,
      total_amount,
      status,
      payment_method,
      payment_status,
      paid_at
    ) VALUES (
      v_order_code,
      v_group_id,
      v_user_id,
      v_store.id,
      v_store.slug,
      v_store.business_name,
      v_addr.recipient_name,
      v_addr.recipient_phone,
      v_addr.full_address,
      NULLIF(trim(COALESCE(p_buyer_note, '')), ''),
      v_subtotal,
      v_store.shipping_cost,
      v_subtotal + v_store.shipping_cost,
      'dibayarkan',
      p_payment_method,
      'paid_demo',
      v_now
    )
    RETURNING id INTO v_order_id;

    -- Masukkan snapshot order_items dan kurangi stok produk
    FOR v_item IN
      SELECT r.product_id, r.quantity
      FROM _tmp_req_items r
      JOIN public.products p ON p.id = r.product_id
      WHERE p.store_id = v_store_id
      ORDER BY p.id ASC
    LOOP
      SELECT * INTO v_product FROM public.products WHERE id = v_item.product_id;

      IF v_product.promo_percent IS NOT NULL AND v_product.promo_percent BETWEEN 1 AND 90 THEN
        v_unit_price := round((v_product.price::numeric * (100 - v_product.promo_percent)) / 100.0)::integer;
        v_normal_price := v_product.price;
        v_promo_label := 'Diskon ' || v_product.promo_percent || '%';
      ELSE
        v_unit_price := v_product.price;
        v_normal_price := NULL;
        v_promo_label := NULL;
      END IF;

      INSERT INTO public.order_items (
        order_id,
        product_id,
        product_name_snapshot,
        product_image_snapshot,
        category_slug_snapshot,
        unit_price,
        normal_price,
        promo_label,
        quantity
      ) VALUES (
        v_order_id,
        v_product.id,
        v_product.name,
        v_product.image_url,
        v_product.category_slug,
        v_unit_price,
        v_normal_price,
        v_promo_label,
        v_item.quantity
      );

      UPDATE public.products
      SET stock = stock - v_item.quantity
      WHERE id = v_product.id;
    END LOOP;

    -- Catat riwayat status awal
    INSERT INTO public.order_status_history (
      order_id,
      status,
      actor_role,
      actor_user_id,
      note
    ) VALUES (
      v_order_id,
      'dibayarkan',
      'Sistem',
      v_user_id,
      'Pembayaran simulasi (Mode Demo) berhasil'
    );

    v_results := v_results || jsonb_build_array(
      jsonb_build_object(
        'order_id', v_order_id,
        'order_code', v_order_code,
        'store_slug', v_store.slug,
        'store_name', v_store.business_name,
        'subtotal_amount', v_subtotal,
        'shipping_cost', v_store.shipping_cost,
        'total_amount', v_subtotal + v_store.shipping_cost
      )
    );
  END LOOP;

  RETURN v_results;
END;
$$;

REVOKE ALL ON FUNCTION public.rpc_create_order_demo(uuid, jsonb, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_create_order_demo(uuid, jsonb, text, text) TO authenticated;

-- ----------------------------------------------------------------------------
-- 5. RPC STATE MACHINE PERUBAHAN STATUS PESANAN
-- ----------------------------------------------------------------------------

-- A. Penjual menerima pesanan: dibayarkan -> dikemas
CREATE OR REPLACE FUNCTION public.rpc_accept_order(p_order_code text)
RETURNS public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_store_id uuid;
  v_order public.orders%ROWTYPE;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Autentikasi diperlukan.';
  END IF;

  IF public.auth_role() IS DISTINCT FROM 'womanpreneur' THEN
    RAISE EXCEPTION 'Hanya Womanpreneur yang dapat menerima pesanan toko.';
  END IF;

  v_store_id := public.auth_store_id();
  IF v_store_id IS NULL THEN
    RAISE EXCEPTION 'Toko tidak ditemukan untuk akun ini.';
  END IF;

  SELECT * INTO v_order
  FROM public.orders
  WHERE order_code = p_order_code
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pesanan tidak ditemukan.';
  END IF;

  IF v_order.store_id IS DISTINCT FROM v_store_id THEN
    RAISE EXCEPTION 'Anda tidak berwenang memproses pesanan toko lain.';
  END IF;

  IF v_order.status IS DISTINCT FROM 'dibayarkan' THEN
    RAISE EXCEPTION 'Pesanan hanya dapat diterima saat berstatus Dibayarkan.';
  END IF;

  UPDATE public.orders
  SET status = 'dikemas',
      packed_at = now()
  WHERE id = v_order.id
  RETURNING * INTO v_order;

  INSERT INTO public.order_status_history (
    order_id, status, actor_role, actor_user_id, note
  ) VALUES (
    v_order.id, 'dikemas', 'Womanpreneur', v_user_id, 'Pesanan diterima dan sedang dikemas penjual'
  );

  RETURN v_order;
END;
$$;

REVOKE ALL ON FUNCTION public.rpc_accept_order(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_accept_order(text) TO authenticated;

-- B. Penjual mengirim pesanan: dikemas -> dikirim (ekspedisi & resi wajib)
CREATE OR REPLACE FUNCTION public.rpc_ship_order(
  p_order_code text,
  p_courier_name text,
  p_tracking_number text
)
RETURNS public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_store_id uuid;
  v_resi text := NULLIF(trim(COALESCE(p_tracking_number, '')), '');
  v_order public.orders%ROWTYPE;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Autentikasi diperlukan.';
  END IF;

  IF public.auth_role() IS DISTINCT FROM 'womanpreneur' THEN
    RAISE EXCEPTION 'Hanya Womanpreneur yang dapat mengirim pesanan toko.';
  END IF;

  v_store_id := public.auth_store_id();
  IF v_store_id IS NULL THEN
    RAISE EXCEPTION 'Toko tidak ditemukan untuk akun ini.';
  END IF;

  IF p_courier_name IS NULL OR p_courier_name NOT IN ('J&T Express', 'Kurir BUMDes Gabugan') THEN
    RAISE EXCEPTION 'Pilihan ekspedisi harus "J&T Express" atau "Kurir BUMDes Gabugan".';
  END IF;

  IF v_resi IS NULL THEN
    RAISE EXCEPTION 'Nomor resi wajib diisi.';
  END IF;

  SELECT * INTO v_order
  FROM public.orders
  WHERE order_code = p_order_code
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pesanan tidak ditemukan.';
  END IF;

  IF v_order.store_id IS DISTINCT FROM v_store_id THEN
    RAISE EXCEPTION 'Anda tidak berwenang memproses pesanan toko lain.';
  END IF;

  IF v_order.status IS DISTINCT FROM 'dikemas' THEN
    RAISE EXCEPTION 'Pesanan hanya dapat dikirim saat berstatus Dikemas.';
  END IF;

  UPDATE public.orders
  SET status = 'dikirim',
      courier_name = p_courier_name,
      tracking_number = v_resi,
      shipped_at = now()
  WHERE id = v_order.id
  RETURNING * INTO v_order;

  INSERT INTO public.order_status_history (
    order_id, status, actor_role, actor_user_id, note
  ) VALUES (
    v_order.id, 'dikirim', 'Womanpreneur', v_user_id, p_courier_name || ' • Resi: ' || v_resi
  );

  RETURN v_order;
END;
$$;

REVOKE ALL ON FUNCTION public.rpc_ship_order(text, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_ship_order(text, text, text) TO authenticated;

-- C. Pembeli mengonfirmasi pesanan diterima: dikirim -> selesai (+ trigger finance)
CREATE OR REPLACE FUNCTION public.rpc_complete_order(p_order_code text)
RETURNS public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_order public.orders%ROWTYPE;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Autentikasi diperlukan.';
  END IF;

  SELECT * INTO v_order
  FROM public.orders
  WHERE order_code = p_order_code
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pesanan tidak ditemukan.';
  END IF;

  IF v_order.buyer_id IS DISTINCT FROM v_user_id THEN
    RAISE EXCEPTION 'Hanya pembeli pemilik pesanan yang dapat mengonfirmasi penerimaan.';
  END IF;

  IF v_order.status IS DISTINCT FROM 'dikirim' THEN
    RAISE EXCEPTION 'Konfirmasi diterima hanya berlaku saat pesanan berstatus Dikirim.';
  END IF;

  UPDATE public.orders
  SET status = 'selesai',
      completed_at = now()
  WHERE id = v_order.id
  RETURNING * INTO v_order;

  INSERT INTO public.order_status_history (
    order_id, status, actor_role, actor_user_id, note
  ) VALUES (
    v_order.id, 'selesai', 'Buyer', v_user_id, 'Pesanan dikonfirmasi diterima oleh pembeli'
  );

  RETURN v_order;
END;
$$;

REVOKE ALL ON FUNCTION public.rpc_complete_order(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_complete_order(text) TO authenticated;
