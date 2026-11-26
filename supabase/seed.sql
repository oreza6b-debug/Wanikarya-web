-- ============================================================================
-- seed.sql
-- Data awal MVP WaniKarya (Desa Wisata Gabugan, kategori, toko, produk, alamat demo)
--
-- PRASYARAT WAJIB SEBELUM MENJALANKAN FILE INI:
-- Buat akun demo terlebih dahulu lewat Supabase Dashboard -> Authentication ->
-- Users -> Add user (centang "Auto Confirm User"):
--   1. sumarsih@wanikarya.id  (Penjual utama: Bu Sumarsih / Pawon Salak Lestari)
--   2. pembeli@wanikarya.id   (Pembeli demo: Rian Pratama)
-- (Opsional: hartini@wanikarya.id, wagiyem@wanikarya.id, suparni@wanikarya.id,
--  tari@wanikarya.id, darmi@wanikarya.id, ratih@wanikarya.id bila ingin login
--  sebagai penjual lain. Jika belum dibuat, toko tetap tampil di katalog publik.)
-- ============================================================================

-- 1. Kategori Produk (FR-MKT-03)
INSERT INTO public.categories (slug, name, sub, sort_order) VALUES
  ('kuliner', 'Kuliner', 'Oleh-oleh & Pawon', 1),
  ('kerajinan', 'Kerajinan', 'Anyam & Ukir', 2),
  ('fashion', 'Fashion & Aksesoris', 'Batik & Tenun', 3),
  ('pertanian', 'Pertanian & Kebun', 'Hasil Tani Alami', 4),
  ('rumah-tangga', 'Rumah Tangga', 'Perabot & Wadah', 5),
  ('lainnya', 'Lainnya', 'Herbal & Khusus', 6)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    sub = EXCLUDED.sub,
    sort_order = EXCLUDED.sort_order;

-- 2. Desa Wisata Gabugan
INSERT INTO public.villages (
  slug, name, location, description, clusters, facilities, badge,
  elevation, families, water_source, image_url, is_approved
) VALUES (
  'gabugan',
  'Desa Wisata Gabugan',
  'Kapanewon Turi, Kabupaten Sleman, D.I. Yogyakarta',
  'Terletak di lereng hijau Sleman, Desa Wisata Gabugan dikenal sebagai sentra salak pondoh dan rumah bagi para perempuan penggerak ekonomi kreatif: dari olahan kuliner, jamu tradisional, hingga kerajinan ramah lingkungan.',
  8,
  'Homestay & Pendopo Joglo',
  'Desa Wisata Mandiri Sleman',
  '450-500 m',
  '450+ KK',
  'Mata Air Alami Lereng Merapi',
  '/images/hero.jpg',
  true
)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    location = EXCLUDED.location,
    description = EXCLUDED.description,
    clusters = EXCLUDED.clusters,
    facilities = EXCLUDED.facilities,
    badge = EXCLUDED.badge,
    elevation = EXCLUDED.elevation,
    families = EXCLUDED.families,
    water_source = EXCLUDED.water_source,
    is_approved = EXCLUDED.is_approved;

-- 3. Hubungkan akun demo, set role womanpreneur, seed toko, produk, & alamat
DO $$
DECLARE
  v_village_id uuid;
  v_sumarsih_id uuid;
  v_pembeli_id uuid;
  v_hartini_id uuid;
  v_wagiyem_id uuid;
  v_suparni_id uuid;
  v_tari_id uuid;
  v_darmi_id uuid;
  v_ratih_id uuid;

  v_store_sumarsih uuid;
  v_store_hartini uuid;
  v_store_wagiyem uuid;
  v_store_suparni uuid;
  v_store_tari uuid;
  v_store_darmi uuid;
BEGIN
  SELECT id INTO v_village_id FROM public.villages WHERE slug = 'gabugan';

  SELECT id INTO v_sumarsih_id FROM auth.users WHERE email = 'sumarsih@wanikarya.id';
  SELECT id INTO v_pembeli_id  FROM auth.users WHERE email = 'pembeli@wanikarya.id';

  IF v_sumarsih_id IS NULL OR v_pembeli_id IS NULL THEN
    RAISE EXCEPTION
      'Akun demo belum lengkap. Buat dulu user "sumarsih@wanikarya.id" dan "pembeli@wanikarya.id" di Authentication -> Users, lalu jalankan ulang seed.sql.';
  END IF;

  -- Akun penjual opsional (NULL jika belum dibuat di Authentication)
  SELECT id INTO v_hartini_id FROM auth.users WHERE email = 'hartini@wanikarya.id';
  SELECT id INTO v_wagiyem_id FROM auth.users WHERE email = 'wagiyem@wanikarya.id';
  SELECT id INTO v_suparni_id FROM auth.users WHERE email = 'suparni@wanikarya.id';
  SELECT id INTO v_tari_id    FROM auth.users WHERE email = 'tari@wanikarya.id';
  SELECT id INTO v_darmi_id   FROM auth.users WHERE email = 'darmi@wanikarya.id';
  SELECT id INTO v_ratih_id   FROM auth.users WHERE email = 'ratih@wanikarya.id';

  -- Pastikan profil ada & set role penjual secara manual
  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (v_sumarsih_id, 'Bu Sumarsih', '0813-9281-7290', 'womanpreneur')
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      phone = COALESCE(NULLIF(public.profiles.phone, ''), EXCLUDED.phone),
      role = 'womanpreneur';

  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (v_pembeli_id, 'Rian Pratama', '0812-1111-2222', 'buyer')
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      phone = COALESCE(NULLIF(public.profiles.phone, ''), EXCLUDED.phone),
      role = 'buyer';

  -- Upgrade akun penjual opsional jika ada
  UPDATE public.profiles
  SET role = 'womanpreneur'
  WHERE id IN (v_hartini_id, v_wagiyem_id, v_suparni_id, v_tari_id, v_darmi_id, v_ratih_id)
    AND id IS NOT NULL;

  -- Alamat utama demo untuk Pembeli & Bu Sumarsih (agar bisa uji beli produk toko lain)
  IF NOT EXISTS (SELECT 1 FROM public.user_addresses WHERE user_id = v_pembeli_id) THEN
    INSERT INTO public.user_addresses (user_id, label, recipient_name, recipient_phone, full_address, notes, is_primary)
    VALUES (
      v_pembeli_id,
      'Rumah',
      'Rian Pratama',
      '0812-1111-2222',
      'RT 03/RW 08 Dusun Gabugan, Donokerto, Turi, Sleman, D.I. Yogyakarta 55551',
      'Dekat Pendopo Joglo Gabugan',
      true
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.user_addresses WHERE user_id = v_sumarsih_id) THEN
    INSERT INTO public.user_addresses (user_id, label, recipient_name, recipient_phone, full_address, notes, is_primary)
    VALUES (
      v_sumarsih_id,
      'Rumah & Pawon',
      'Bu Sumarsih',
      '0813-9281-7290',
      'RT 03/RW 08 Dusun Gabugan, Donokerto, Turi, Sleman, D.I. Yogyakarta 55551',
      'Sebelah utara Masjid Gabugan',
      true
    );
  END IF;

  -- Seed 7 Toko / Womanpreneur Gabugan
  INSERT INTO public.stores (
    owner_id, village_id, slug, owner_name, business_name, business_model, category,
    address, whatsapp_phone, instagram_handle, quote, description,
    story_intro, story_background, story_focus, story_uniqueness, story_impact,
    photo_url, gallery_urls, since_year, shipping_cost, verified, is_active
  ) VALUES (
    v_sumarsih_id, v_village_id, 'bu-sumarsih', 'Bu Sumarsih', 'Pawon Salak Lestari', 'keduanya', 'Kuliner',
    'RT 03 / RW 08 Dusun Gabugan, Donokerto, Turi, Sleman, D.I. Yogyakarta',
    '+62813-9281-7290', '@pawonsalaklestari_gabu',
    'Dulu salak cuma dijual mentah di pinggir jalan, sekarang bisa jadi keripik dan selai yang dikirim ke luar kota.',
    'Spesialis olahan salak pondoh. Membina 14 ibu rumah tangga di RT 03 Gabugan untuk memproduksi aneka olahan buah salak bernilai tambah tinggi.',
    'Pawon Salak Lestari didirikan oleh Bu Sumarsih bersama 6 ibu rumah tangga di RT 03 Dusun Gabugan untuk mengolah salak basah panen raya menjadi camilan bernilai tambah tinggi.',
    'Berawal saat panen raya 2017 ketika harga salak anjlok hingga Rp2.000/kg. Kami mengikuti pelatihan vacuum frying BUMDes hingga mampu memproduksi camilan tahan lama.',
    'Keripik salak vacuum frying renyah alami, selai salak gula kelapa, dodol salak tungku kayu, sirup salak, dan paket wisata petik salak.',
    'Murni 100% buah salak pondoh lereng Gunung Merapi tanpa pengawet sintetik, pemanis buatan, atau perisa kimia.',
    'Membuka penghasilan mandiri bagi ibu rumah tangga di Dusun Gabugan dan mendukung petani salak lokal.',
    '/images/bu-sumarsih.jpg',
    ARRAY['/images/bu-sumarsih.jpg', '/images/jasa-kebun-salak.jpg', '/images/jasa-batik.jpg'],
    2021, 15000, true, true
  )
  ON CONFLICT (slug) DO UPDATE
  SET owner_id = EXCLUDED.owner_id,
      owner_name = EXCLUDED.owner_name,
      business_name = EXCLUDED.business_name,
      shipping_cost = EXCLUDED.shipping_cost,
      verified = true,
      is_active = true
  RETURNING id INTO v_store_sumarsih;

  INSERT INTO public.stores (
    owner_id, village_id, slug, owner_name, business_name, business_model, category,
    quote, description, photo_url, since_year, shipping_cost, verified, is_active
  ) VALUES (
    v_hartini_id, v_village_id, 'bu-hartini', 'Bu Hartini', 'Griya Batik Sekar Wangi', 'keduanya', 'Fashion & Aksesoris',
    'Setiap helai kain kami diwarnai daun tarum, sabar menunggu warna biru itu jadi.',
    'Pembatik tulis dengan pewarna alam dari tanaman sekitar desa.',
    '/images/bu-hartini.jpg', 2022, 10000, true, true
  )
  ON CONFLICT (slug) DO UPDATE
  SET owner_id = COALESCE(EXCLUDED.owner_id, public.stores.owner_id),
      verified = true, is_active = true
  RETURNING id INTO v_store_hartini;

  INSERT INTO public.stores (
    owner_id, village_id, slug, owner_name, business_name, business_model, category,
    quote, description, photo_url, since_year, shipping_cost, verified, is_active
  ) VALUES (
    v_wagiyem_id, v_village_id, 'bu-wagiyem', 'Bu Wagiyem', 'Jamu Sekar Arum', 'keduanya', 'Kuliner',
    'Jamu kami diracik tiap subuh, supaya yang minum merasakan segarnya.',
    'Meracik jamu tradisional segar dari empon-empon pilihan.',
    '/images/bu-wagiyem.jpg', 2022, 10000, true, true
  )
  ON CONFLICT (slug) DO UPDATE
  SET owner_id = COALESCE(EXCLUDED.owner_id, public.stores.owner_id),
      verified = true, is_active = true
  RETURNING id INTO v_store_wagiyem;

  INSERT INTO public.stores (
    owner_id, village_id, slug, owner_name, business_name, business_model, category,
    quote, description, photo_url, since_year, shipping_cost, verified, is_active
  ) VALUES (
    v_suparni_id, v_village_id, 'bu-suparni', 'Bu Suparni', 'Kriya Anyam Lestari', 'produk', 'Kerajinan',
    'Dari bambu di belakang rumah, kami anyam jadi barang yang dipakai sehari-hari.',
    'Pengrajin anyaman bambu dan pandan, melatih ibu-ibu muda menganyam.',
    '/images/bu-suparni.jpg', 2023, 12000, true, true
  )
  ON CONFLICT (slug) DO UPDATE
  SET owner_id = COALESCE(EXCLUDED.owner_id, public.stores.owner_id),
      verified = true, is_active = true
  RETURNING id INTO v_store_suparni;

  INSERT INTO public.stores (
    owner_id, village_id, slug, owner_name, business_name, business_model, category,
    quote, description, photo_url, since_year, shipping_cost, verified, is_active
  ) VALUES (
    v_tari_id, v_village_id, 'bu-tari', 'Bu Tari', 'Batik Sekar Gabugan', 'produk', 'Fashion & Aksesoris',
    'Melestarikan motif khas lereng Gunung Merapi lewat goresan canting halus nan sabar bersama kelompok ibu-ibu pembatik desa.',
    'Pembatik tulis canting turi berkarakter Gunung Merapi, membimbing generasi muda pelestari canting halus.',
    '/images/bu-tari.jpg', 2020, 12000, true, true
  )
  ON CONFLICT (slug) DO UPDATE
  SET owner_id = COALESCE(EXCLUDED.owner_id, public.stores.owner_id),
      verified = true, is_active = true
  RETURNING id INTO v_store_tari;

  INSERT INTO public.stores (
    owner_id, village_id, slug, owner_name, business_name, business_model, category,
    quote, description, photo_url, since_year, shipping_cost, verified, is_active
  ) VALUES (
    v_darmi_id, v_village_id, 'ibu-darmi', 'Ibu Darmi', 'Anyam Bambu Lestari', 'produk', 'Kerajinan',
    'Mengubah rumpun bambu desa menjadi kemasan ramah lingkungan dan aneka suvenir fungsional bermartabat tinggi.',
    'Pengrajin anyaman besek bambu dan wadah ramah lingkungan serbaguna khas pedesaan.',
    '/images/ibu-darmi.jpg', 2019, 12000, true, true
  )
  ON CONFLICT (slug) DO UPDATE
  SET owner_id = COALESCE(EXCLUDED.owner_id, public.stores.owner_id),
      verified = true, is_active = true
  RETURNING id INTO v_store_darmi;

  INSERT INTO public.stores (
    owner_id, village_id, slug, owner_name, business_name, business_model, category,
    quote, description, photo_url, since_year, shipping_cost, verified, is_active
  ) VALUES (
    v_ratih_id, v_village_id, 'mbak-ratih', 'Mbak Ratih', 'Pemandu Ekowisata Turi', 'jasa', 'Pemanduan & Tour',
    'Menghubungkan para pelancong dengan denyut kehidupan warga lokal melalui jelajah susur sungai dan menginap di joglo pedesaan.',
    'Penggerak pemanduan ekowisata dan homestay desa yang ramah bagi keluarga dan rombongan tamu.',
    '/images/mbak-ratih.jpg', 2023, 10000, true, true
  )
  ON CONFLICT (slug) DO UPDATE
  SET owner_id = COALESCE(EXCLUDED.owner_id, public.stores.owner_id),
      verified = true, is_active = true;

  -- Seed 10 Produk Awal (dari lib/data.ts)
  INSERT INTO public.products (
    store_id, category_slug, slug, sku, name, description, price, promo_percent, stock, stock_unit,
    image_url, gallery_urls, label, highlights, weight, main_ingredient, packaging, pirt, halal,
    is_active, is_featured
  ) VALUES
    (
      v_store_sumarsih, 'kuliner', 'keripik-salak-madu-150g', 'PSL-CRISP-01',
      'Keripik Salak Madu 150g',
      'Dibuat dari salak pondoh matang pohon kualitas prima, diolah vacuum-frying tanpa tambahan pengawet.',
      28000, 15, 40, 'bungkus',
      '/images/keripik-salak.jpg', ARRAY['/images/keripik-salak.jpg'],
      'Pangan Alami', ARRAY['Pangan Alami', 'Pawon Tradisional'],
      '150 gram', 'Salak Pondoh & Madu Alami', 'Foil Kedap Udara',
      'P-IRT Desa No. 2143404010892-26', 'Halal Indonesia', true, true
    ),
    (
      v_store_sumarsih, 'kuliner', 'selai-salak-organik-220ml', 'PSL-JAM-02',
      'Selai Salak Organik 220ml',
      'Tekstur lembut berbulir khas salak Gabugan, dimasak perlahan di kuali tembaga menggunakan gula kelapa.',
      35000, NULL, 25, 'toples kaca',
      '/images/selai-salak.jpg', ARRAY['/images/selai-salak.jpg'],
      'Gula Kelapa Alami', ARRAY['Bebas Pemanis Buatan', 'Pawon Tradisional'],
      '220 ml', 'Salak Pondoh & Gula Kelapa', 'Jar Kaca Kedap Udara',
      NULL, NULL, true, true
    ),
    (
      v_store_hartini, 'fashion', 'syal-batik-pewarna-alam-daun-tarum', 'GBW-SYL-01',
      'Syal Batik Pewarna Alam Daun Tarum',
      'Kain katun primissima berukuran 180x50cm dengan celupan biru alami daun tarum lokal.',
      145000, NULL, 8, 'pcs',
      '/images/syal-batik.jpg', ARRAY['/images/syal-batik.jpg'],
      'Pewarna Nabati 100%', ARRAY['Karya Canting Tangan', 'Sanggar Batik'],
      '200 gram', 'Katun Primissima & Daun Tarum', 'Kotak Bambu Eksklusif',
      NULL, NULL, true, true
    ),
    (
      v_store_wagiyem, 'kuliner', 'jamu-kunyit-asem-segar-500ml', 'JSA-KNY-01',
      'Jamu Kunyit Asem Segar 500ml',
      'Kunyit empu pilihan dan asam kawak tuban dengan gula aren murni. Disangrai dan diperas segar.',
      18000, NULL, 60, 'botol',
      '/images/jamu-kunyit.jpg', ARRAY['/images/jamu-kunyit.jpg'],
      'Olahan Segar Tiap Subuh', ARRAY['Resep Leluhur', 'Dapur Herbal'],
      '500 ml', 'Kunyit Empu, Asam & Gula Aren', 'Botol Kaca Segel',
      NULL, NULL, true, true
    ),
    (
      v_store_suparni, 'kerajinan', 'keranjang-anyaman-bambu-halus', 'KAL-KRJ-01',
      'Keranjang Anyaman Bambu Halus',
      'Serat bambu tali yang diraut tipis dan dianyam dengan ketelitian tinggi. Kokoh, estetis, dan ramah lingkungan.',
      45000, NULL, 15, 'pcs',
      '/images/keranjang-bambu.jpg', ARRAY['/images/keranjang-bambu.jpg'],
      'Anyaman Apik', ARRAY['Serat Bambu Pilihan', 'Kriya Lestari'],
      '350 gram', 'Bambu Tali Pilihan', 'Kardus Daur Ulang',
      NULL, NULL, true, false
    ),
    (
      v_store_sumarsih, 'kuliner', 'dodol-salak-pondoh-asli', 'PSL-DDL-03',
      'Dodol Salak Pondoh Asli',
      'Kudapan manis legit dengan aroma khas salak pondoh segar. Dimasak selama 6 jam di atas tungku kayu.',
      25000, NULL, 0, 'bungkus',
      '/images/dodol-salak.jpg', ARRAY['/images/dodol-salak.jpg'],
      'Stok Habis', ARRAY['Tungku Kayu', 'Pawon Tradisional'],
      '200 gram', 'Salak Pondoh, Santan & Gula Kelapa', 'Kertas Minyak & Besek',
      NULL, NULL, true, false
    ),
    (
      v_store_sumarsih, 'kuliner', 'sirup-salak-pondoh-330ml', 'PSL-SRP-04',
      'Sirup Salak Pondoh 330ml',
      'Sirup kental dari sari salak pondoh, segar disajikan dingin atau dicampur air soda.',
      30000, NULL, 20, 'botol',
      '/images/sirup-salak.jpg', ARRAY['/images/sirup-salak.jpg'],
      'Tanpa Pewarna', ARRAY['Sari Buah Asli', 'Pawon Tradisional'],
      '330 ml', 'Sari Salak Pondoh & Gula Pasir', 'Botol Kaca Segel',
      NULL, NULL, true, false
    ),
    (
      v_store_suparni, 'kerajinan', 'tas-anyaman-pandan', 'KAL-TAS-02',
      'Tas Anyaman Pandan',
      'Tas jinjing dari daun pandan yang dianyam rapat, kuat dan ringan untuk dibawa harian.',
      85000, NULL, 6, 'pcs',
      '/images/tas-pandan.jpg', ARRAY['/images/tas-pandan.jpg'],
      'Karya Tangan', ARRAY['Pandan Pilihan', 'Kriya Lestari'],
      '400 gram', 'Daun Pandan Kering', 'Kardus Daur Ulang',
      NULL, NULL, true, false
    ),
    (
      v_store_tari, 'fashion', 'selendang-batik-motif-truntum', 'BSG-SLD-01',
      'Selendang Batik Tulis Motif Truntum Salak',
      'Pewarna alami indigofera dan mahoni, karya tangan perajin perempuan desa berdimensi 200 x 55 cm.',
      245000, NULL, 5, 'pcs',
      '/images/selendang-batik.jpg', ARRAY['/images/selendang-batik.jpg'],
      'Karya Canting Halus', ARRAY['Pewarna Indigofera', 'Canting Halus'],
      '250 gram', 'Katun Halus & Indigofera', 'Kotak Bambu Eksklusif',
      NULL, NULL, true, false
    ),
    (
      v_store_darmi, 'kerajinan', 'besek-bambu-kemasan-ramah-lingkungan', 'ABL-BSK-01',
      'Paket Besek Bambu & Wadah Pangan Alami',
      'Besek bambu anyaman rapi untuk kemasan hantaran, ramah lingkungan dan bebas pemutih kimiawi.',
      35000, NULL, 30, 'paket',
      '/images/besek-bambu.jpg', ARRAY['/images/besek-bambu.jpg'],
      'Serat Alami', ARRAY['Bambu Pilihan', 'Bebas Kimia'],
      '300 gram', 'Bambu Apus Alami', 'Ikat Tali Rami',
      NULL, NULL, true, false
    )
  ON CONFLICT (slug) DO UPDATE
  SET store_id = EXCLUDED.store_id,
      category_slug = EXCLUDED.category_slug,
      sku = EXCLUDED.sku,
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      price = EXCLUDED.price,
      promo_percent = EXCLUDED.promo_percent,
      stock = EXCLUDED.stock,
      stock_unit = EXCLUDED.stock_unit,
      image_url = EXCLUDED.image_url,
      weight = EXCLUDED.weight,
      main_ingredient = EXCLUDED.main_ingredient,
      packaging = EXCLUDED.packaging,
      is_active = EXCLUDED.is_active;

  RAISE NOTICE 'Seed WaniKarya selesai! Toko Bu Sumarsih ID: %, Pembeli ID: %', v_store_sumarsih, v_pembeli_id;
END;
$$;
