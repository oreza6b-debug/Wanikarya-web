"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ---------------------------------------------------------------------------
// Tipe
// ---------------------------------------------------------------------------

export type SellerProduct = {
  id: string;
  slug: string;
  sku: string | null;
  name: string;
  description: string | null;
  price: number;
  promo_percent: number | null;
  stock: number;
  stock_unit: string;
  category_slug: string;
  image_url: string;
  weight: string | null;
  packaging: string | null;
  pirt: string | null;
  halal: string | null;
  is_active: boolean;
  created_at: string;
};

export type ProductInput = {
  name: string;
  description?: string;
  price: number;
  stock: number;
  stock_unit?: string;
  category_slug: string;
  sku?: string;
  weight?: string;
  packaging?: string;
  pirt?: string;
  halal?: string;
};

export type ProductActionResult<T = SellerProduct> = {
  ok: boolean;
  data?: T;
  error?: string;
};

// ---------------------------------------------------------------------------
// Helper: ambil store_id milik user yang sedang login
// ---------------------------------------------------------------------------

async function getMyStoreId(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("stores")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  return data?.id ?? null;
}

// ---------------------------------------------------------------------------
// Helper: buat slug unik dari nama produk
// ---------------------------------------------------------------------------

function toBaseSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    || "produk";
}

async function generateUniqueSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  name: string
): Promise<string> {
  const base = toBaseSlug(name);

  // Ambil semua slug yang berawalan base agar bisa deteksi tabrakan tanpa loop query
  const { data: existing } = await supabase
    .from("products")
    .select("slug")
    .or(`slug.eq.${base},slug.like.${base}-_%`);

  const taken = new Set((existing ?? []).map((r) => r.slug));

  if (!taken.has(base)) return base;

  let i = 2;
  while (taken.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}

// ---------------------------------------------------------------------------
// 1. Ambil daftar produk toko sendiri (deleted_at IS NULL)
// ---------------------------------------------------------------------------

export async function getMyProductsAction(): Promise<
  ProductActionResult<SellerProduct[]>
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Silakan login terlebih dahulu." };
  }

  const storeId = await getMyStoreId(supabase);
  if (!storeId) {
    return { ok: false, error: "Toko Anda belum terdaftar." };
  }

  const { data, error } = await supabase
    .from("products")
    .select(
      "id, slug, sku, name, description, price, promo_percent, stock, stock_unit, category_slug, image_url, weight, packaging, pirt, halal, is_active, created_at"
    )
    .eq("store_id", storeId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    return { ok: false, error: "Gagal memuat daftar produk." };
  }

  return { ok: true, data: (data ?? []) as SellerProduct[] };
}

// ---------------------------------------------------------------------------
// 2. Tambah produk baru
//    - store_id diambil dari sesi server
//    - is_featured dan deleted_at TIDAK dikirim
// ---------------------------------------------------------------------------

export async function createProductAction(
  input: ProductInput
): Promise<ProductActionResult<SellerProduct>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Silakan login terlebih dahulu." };
  }

  const storeId = await getMyStoreId(supabase);
  if (!storeId) {
    return { ok: false, error: "Toko Anda belum terdaftar." };
  }

  // Validasi input
  const name = input.name.trim();
  if (!name) return { ok: false, error: "Nama produk wajib diisi." };
  if (name.length > 80) return { ok: false, error: "Nama produk maksimal 80 karakter." };
  if (!input.price || input.price <= 0) return { ok: false, error: "Harga harus lebih dari 0." };
  if (input.stock < 0) return { ok: false, error: "Stok tidak boleh negatif." };
  if (!input.category_slug) return { ok: false, error: "Kategori wajib dipilih." };

  const slug = await generateUniqueSlug(supabase, name);

  const { data, error } = await supabase
    .from("products")
    .insert({
      store_id: storeId,
      slug,
      name,
      description: input.description?.trim() || null,
      price: input.price,
      stock: input.stock,
      stock_unit: input.stock_unit?.trim() || "bungkus",
      category_slug: input.category_slug,
      sku: input.sku?.trim() || null,
      weight: input.weight?.trim() || null,
      packaging: input.packaging?.trim() || null,
      pirt: input.pirt?.trim() || null,
      halal: input.halal?.trim() || null,
      image_url: "/images/keripik-salak.jpg",
      // is_featured dan deleted_at tidak dikirim — default database
    })
    .select(
      "id, slug, sku, name, description, price, promo_percent, stock, stock_unit, category_slug, image_url, weight, packaging, pirt, halal, is_active, created_at"
    )
    .single();

  if (error || !data) {
    return { ok: false, error: `Gagal menyimpan produk: ${error?.message ?? "kesalahan tidak diketahui"}.` };
  }

  revalidatePath("/her-market");
  revalidatePath("/usaha/produk");
  return { ok: true, data: data as SellerProduct };
}

// ---------------------------------------------------------------------------
// 3. Ubah data produk yang sudah ada
//    - store_id dan is_featured TIDAK dikirim dalam UPDATE
// ---------------------------------------------------------------------------

export async function updateProductAction(
  id: string,
  input: Partial<ProductInput>
): Promise<ProductActionResult<SellerProduct>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Silakan login terlebih dahulu." };
  }

  const storeId = await getMyStoreId(supabase);
  if (!storeId) {
    return { ok: false, error: "Toko Anda belum terdaftar." };
  }

  // Bangun objek update hanya dengan kolom yang diizinkan
  const patch: Record<string, unknown> = {};

  if (input.name !== undefined) {
    const name = input.name.trim();
    if (!name) return { ok: false, error: "Nama produk wajib diisi." };
    if (name.length > 80) return { ok: false, error: "Nama produk maksimal 80 karakter." };
    patch.name = name;
  }
  if (input.description !== undefined) patch.description = input.description.trim() || null;
  if (input.price !== undefined) {
    if (input.price <= 0) return { ok: false, error: "Harga harus lebih dari 0." };
    patch.price = input.price;
  }
  if (input.stock !== undefined) {
    if (input.stock < 0) return { ok: false, error: "Stok tidak boleh negatif." };
    patch.stock = input.stock;
  }
  if (input.stock_unit !== undefined) patch.stock_unit = input.stock_unit.trim() || "bungkus";
  if (input.category_slug !== undefined) patch.category_slug = input.category_slug;
  if (input.sku !== undefined) patch.sku = input.sku.trim() || null;
  if (input.weight !== undefined) patch.weight = input.weight.trim() || null;
  if (input.packaging !== undefined) patch.packaging = input.packaging.trim() || null;
  if (input.pirt !== undefined) patch.pirt = input.pirt.trim() || null;
  if (input.halal !== undefined) patch.halal = input.halal.trim() || null;
  // store_id dan is_featured tidak pernah masuk patch

  if (Object.keys(patch).length === 0) {
    return { ok: false, error: "Tidak ada perubahan untuk disimpan." };
  }

  const { data, error } = await supabase
    .from("products")
    .update(patch)
    .eq("id", id)
    .eq("store_id", storeId)
    .is("deleted_at", null)
    .select(
      "id, slug, sku, name, description, price, promo_percent, stock, stock_unit, category_slug, image_url, weight, packaging, pirt, halal, is_active, created_at"
    )
    .single();

  if (error || !data) {
    return { ok: false, error: "Gagal menyimpan perubahan produk." };
  }

  revalidatePath("/her-market");
  revalidatePath("/usaha/produk");
  return { ok: true, data: data as SellerProduct };
}

// ---------------------------------------------------------------------------
// 4. Toggle is_active
// ---------------------------------------------------------------------------

export async function toggleProductActiveAction(
  id: string,
  isActive: boolean
): Promise<ProductActionResult<SellerProduct>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Silakan login terlebih dahulu." };
  }

  const storeId = await getMyStoreId(supabase);
  if (!storeId) {
    return { ok: false, error: "Toko Anda belum terdaftar." };
  }

  const { data, error } = await supabase
    .from("products")
    .update({ is_active: isActive })
    .eq("id", id)
    .eq("store_id", storeId)
    .is("deleted_at", null)
    .select(
      "id, slug, sku, name, description, price, promo_percent, stock, stock_unit, category_slug, image_url, weight, packaging, pirt, halal, is_active, created_at"
    )
    .single();

  if (error || !data) {
    return { ok: false, error: "Gagal mengubah status produk." };
  }

  revalidatePath("/her-market");
  revalidatePath("/usaha/produk");
  return { ok: true, data: data as SellerProduct };
}

// ---------------------------------------------------------------------------
// 5. Soft delete (isi deleted_at = now())
// ---------------------------------------------------------------------------

export async function softDeleteProductAction(
  id: string
): Promise<ProductActionResult<null>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Silakan login terlebih dahulu." };
  }

  const storeId = await getMyStoreId(supabase);
  if (!storeId) {
    return { ok: false, error: "Toko Anda belum terdaftar." };
  }

  const { error } = await supabase
    .from("products")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("store_id", storeId)
    .is("deleted_at", null);

  if (error) {
    return { ok: false, error: `Gagal menghapus produk: ${error.message}.` };
  }

  revalidatePath("/her-market");
  revalidatePath("/usaha/produk");
  return { ok: true, data: null };
}
