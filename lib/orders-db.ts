// Baca pesanan dari Supabase (browser). RLS yang menentukan: pembeli lihat pesanannya,
// penjual lihat pesanan tokonya, admin lihat semua.
import { createClient } from "@/lib/supabase/client";
import type { Actor, Order, OrderStatus } from "@/lib/orders";

type Row = {
  order_code: string;
  store_slug_snapshot: string;
  store_name_snapshot: string;
  buyer_id: string;
  buyer_name_snapshot: string;
  buyer_phone_snapshot: string;
  shipping_address_snapshot: string;
  buyer_note: string | null;
  shipping_cost: number;
  status: OrderStatus;
  payment_method: "qris" | "va" | "cod";
  payment_status: "paid_demo" | "refunded_demo";
  courier_name: string | null;
  tracking_number: string | null;
  cancel_reason: string | null;
  cancelled_by: Actor | null;
  created_at: string;
  order_items: {
    product_name_snapshot: string;
    product_image_snapshot: string | null;
    category_slug_snapshot: string | null;
    unit_price: number;
    normal_price: number | null;
    quantity: number;
  }[];
  order_status_history: { status: OrderStatus; actor_role: Actor; created_at: string }[];
};

function mapRow(r: Row): Order {
  return {
    kode: r.order_code,
    storeSlug: r.store_slug_snapshot,
    storeName: r.store_name_snapshot,
    buyerId: r.buyer_id,
    buyerName: r.buyer_name_snapshot,
    buyerPhone: r.buyer_phone_snapshot,
    address: r.shipping_address_snapshot,
    items: (r.order_items ?? []).map((i) => ({
      name: i.product_name_snapshot,
      price: i.unit_price,
      normalPrice: i.normal_price ?? undefined,
      qty: i.quantity,
      image: i.product_image_snapshot ?? undefined,
      categorySlug: i.category_slug_snapshot ?? undefined,
    })),
    shipping: r.shipping_cost,
    status: r.status,
    createdAt: r.created_at,
    history: [...(r.order_status_history ?? [])]
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map((h) => ({ status: h.status, at: h.created_at, by: h.actor_role })),
    ekspedisi: r.courier_name ?? undefined,
    resi: r.tracking_number ?? undefined,
    cancelReason: r.cancel_reason ?? undefined,
    cancelledBy: r.cancelled_by ?? undefined,
    buyerNote: r.buyer_note ?? undefined,
    paymentMethod: r.payment_method,
    paymentStatus: r.payment_status,
  };
}

export async function fetchOrders(): Promise<Order[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*), order_status_history(*)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as Row[]).map(mapRow);
}
