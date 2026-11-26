// Katalog produk dari Supabase (hanya dipakai di server).
import { createClient } from "@/lib/supabase/server";
import { stores, type Product } from "./data";

export async function getDbProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, stores!inner(slug)")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Gagal memuat produk: ${error.message}`);

  return (data ?? [])
    .map((r): Product => ({
      slug: r.slug,
      name: r.name,
      description: r.description,
      price: r.price,
      promoPercent: r.promo_percent ?? undefined,
      stock: r.stock,
      categorySlug: r.category_slug,
      storeSlug: r.stores.slug,
      image: r.image_url,
      label: r.label ?? "",
      highlights: [r.highlights?.[0] ?? "", r.highlights?.[1] ?? ""],
      featured: r.is_featured,
      createdAt: r.created_at,
      weight: r.weight ?? undefined,
      packaging: r.packaging ?? undefined,
      pirt: r.pirt ?? undefined,
      halal: r.halal ?? undefined,
    }))
    // Profil toko di tampilan masih data mock, jadi toko yang belum ada di sana dilewati dulu.
    .filter((p) => stores.some((s) => s.slug === p.storeSlug));
}
