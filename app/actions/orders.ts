"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type PaymentMethod = "qris" | "va" | "cod";
export type CheckoutItemInput = { slug: string; quantity: number };

export type CheckoutLine = {
  slug: string;
  name: string;
  unitPrice: number;
  quantity: number;
  stock: number;
  storeSlug: string;
  storeName: string;
  problem: string | null;
};

export type CheckoutStore = {
  storeSlug: string;
  storeName: string;
  shippingCost: number;
  subtotal: number;
};

export type CheckoutPreview = {
  lines: CheckoutLine[];
  stores: CheckoutStore[];
  subtotal: number;
  shipping: number;
  total: number;
  hasProblem: boolean;
};

export type CreatedOrder = {
  orderId: string;
  orderCode: string;
  storeSlug: string;
  storeName: string;
  subtotalAmount: number;
  shippingCost: number;
  totalAmount: number;
};

export type OrderActionResult<T> = { ok: boolean; data?: T; error?: string };

function cleanItems(items: CheckoutItemInput[]): CheckoutItemInput[] | null {
  if (!Array.isArray(items) || items.length === 0) return null;
  const out: CheckoutItemInput[] = [];
  for (const it of items) {
    const qty = Number(it?.quantity);
    if (!it?.slug || !Number.isInteger(qty) || qty < 1 || qty > 999) return null;
    out.push({ slug: String(it.slug), quantity: qty });
  }
  return out;
}

// Hitung ulang dari DB (harga, promo, stok, ongkir) supaya tampilan checkout = yang dipakai RPC.
export async function previewCheckoutAction(
  rawItems: CheckoutItemInput[]
): Promise<OrderActionResult<CheckoutPreview>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Silakan login terlebih dahulu." };

  const items = cleanItems(rawItems);
  if (!items) return { ok: false, error: "Daftar item checkout tidak valid." };

  const { data, error } = await supabase
    .from("products")
    .select(
      "slug, name, price, promo_percent, stock, is_active, deleted_at, stores!inner(slug, business_name, shipping_cost, owner_id, verified, is_active)"
    )
    .in(
      "slug",
      items.map((i) => i.slug)
    );

  if (error) return { ok: false, error: "Gagal memuat data produk." };

  const bySlug = new Map((data ?? []).map((r) => [r.slug as string, r]));
  const lines: CheckoutLine[] = [];

  for (const it of items) {
    const r = bySlug.get(it.slug);
    if (!r) {
      lines.push({
        slug: it.slug,
        name: it.slug,
        unitPrice: 0,
        quantity: it.quantity,
        stock: 0,
        storeSlug: "",
        storeName: "",
        problem: "Produk tidak ditemukan.",
      });
      continue;
    }
    const st = r.stores as unknown as {
      slug: string;
      business_name: string;
      owner_id: string | null;
      verified: boolean;
      is_active: boolean;
    };
    const unitPrice = r.promo_percent
      ? Math.round((r.price * (100 - r.promo_percent)) / 100)
      : r.price;

    let problem: string | null = null;
    if (!r.is_active || r.deleted_at) problem = "Produk sedang tidak aktif.";
    else if (!st.verified || !st.is_active || !st.owner_id) problem = "Toko ini belum bisa menerima pesanan.";
    else if (st.owner_id === user.id) problem = "Produk toko sendiri tidak dapat dibeli.";
    else if (r.stock < it.quantity) problem = r.stock === 0 ? "Stok habis." : `Stok tidak cukup (tersisa ${r.stock}).`;

    lines.push({
      slug: r.slug,
      name: r.name,
      unitPrice,
      quantity: it.quantity,
      stock: r.stock,
      storeSlug: st.slug,
      storeName: st.business_name,
      problem,
    });
  }

  const storeMap = new Map<string, CheckoutStore>();
  for (const l of lines) {
    if (!l.storeSlug) continue;
    const r = bySlug.get(l.slug)!;
    const st = r.stores as unknown as { shipping_cost: number };
    const cur = storeMap.get(l.storeSlug) ?? {
      storeSlug: l.storeSlug,
      storeName: l.storeName,
      shippingCost: st.shipping_cost,
      subtotal: 0,
    };
    cur.subtotal += l.unitPrice * l.quantity;
    storeMap.set(l.storeSlug, cur);
  }
  const stores = [...storeMap.values()];
  const subtotal = stores.reduce((a, s) => a + s.subtotal, 0);
  const shipping = stores.reduce((a, s) => a + s.shippingCost, 0);

  return {
    ok: true,
    data: {
      lines,
      stores,
      subtotal,
      shipping,
      total: subtotal + shipping,
      hasProblem: lines.some((l) => l.problem),
    },
  };
}

// Tombol "Bayar Sekarang (Mode Demo)": panggil rpc_create_order_demo (1 pesanan per toko).
export async function createDemoOrderAction(input: {
  addressId: string;
  items: CheckoutItemInput[];
  paymentMethod: PaymentMethod;
  note?: string;
}): Promise<OrderActionResult<CreatedOrder[]>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Silakan login terlebih dahulu." };

  const items = cleanItems(input.items);
  if (!items) return { ok: false, error: "Daftar item checkout tidak valid." };
  if (!input.addressId) return { ok: false, error: "Pilih alamat pengiriman dulu." };
  if (!["qris", "va", "cod"].includes(input.paymentMethod)) {
    return { ok: false, error: "Metode pembayaran tidak valid." };
  }

  const { data: prods, error: pErr } = await supabase
    .from("products")
    .select("id, slug")
    .in(
      "slug",
      items.map((i) => i.slug)
    );
  if (pErr) return { ok: false, error: "Gagal memuat data produk." };

  const idBySlug = new Map((prods ?? []).map((p) => [p.slug as string, p.id as string]));
  const rpcItems: { product_id: string; quantity: number }[] = [];
  for (const it of items) {
    const id = idBySlug.get(it.slug);
    if (!id) return { ok: false, error: "Ada produk yang tidak ditemukan." };
    rpcItems.push({ product_id: id, quantity: it.quantity });
  }

  const { data, error } = await supabase.rpc("rpc_create_order_demo", {
    p_address_id: input.addressId,
    p_items: rpcItems,
    p_payment_method: input.paymentMethod,
    p_buyer_note: input.note?.trim() || null,
  });

  if (error) return { ok: false, error: error.message || "Gagal membuat pesanan." };

  const rows = (Array.isArray(data) ? data : []) as {
    order_id: string;
    order_code: string;
    store_slug: string;
    store_name: string;
    subtotal_amount: number;
    shipping_cost: number;
    total_amount: number;
  }[];

  revalidatePath("/her-market");
  revalidatePath("/her-market/[slug]", "page");
  revalidatePath("/pesanan");

  return {
    ok: true,
    data: rows.map((r) => ({
      orderId: r.order_id,
      orderCode: r.order_code,
      storeSlug: r.store_slug,
      storeName: r.store_name,
      subtotalAmount: r.subtotal_amount,
      shippingCost: r.shipping_cost,
      totalAmount: r.total_amount,
    })),
  };
}
