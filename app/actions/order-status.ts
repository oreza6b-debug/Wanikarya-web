"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type OrderStatusActionResult = { ok: boolean; error?: string };

const ALLOWED_COURIERS = new Set(["J&T Express", "Kurir BUMDes Gabugan"]);

function revalidateOrderPaths() {
  revalidatePath("/pesanan");
  revalidatePath("/pesanan/[kode]", "page");
  revalidatePath("/usaha/pesanan");
  revalidatePath("/usaha/dashboard");
  revalidatePath("/usaha/keuangan");
}

async function getAuthenticatedClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase: null, error: "Silakan login terlebih dahulu." };
  return { supabase, error: null };
}

/** Penjual menerima pesanan (dibayarkan -> dikemas) via rpc_accept_order. */
export async function acceptOrderAction(orderCode: string): Promise<OrderStatusActionResult> {
  const code = orderCode.trim();
  if (!code) return { ok: false, error: "Kode pesanan tidak valid." };

  const { supabase, error: authErr } = await getAuthenticatedClient();
  if (!supabase) return { ok: false, error: authErr ?? "Autentikasi diperlukan." };

  const { error } = await supabase.rpc("rpc_accept_order", { p_order_code: code });
  if (error) return { ok: false, error: error.message || "Gagal menerima pesanan." };

  revalidateOrderPaths();
  return { ok: true };
}

/** Penjual mengirim pesanan (dikemas -> dikirim) via rpc_ship_order. */
export async function shipOrderAction(
  orderCode: string,
  courierName: string,
  trackingNumber: string
): Promise<OrderStatusActionResult> {
  const code = orderCode.trim();
  const courier = courierName.trim();
  const tracking = trackingNumber.trim();

  if (!code) return { ok: false, error: "Kode pesanan tidak valid." };
  if (!ALLOWED_COURIERS.has(courier)) {
    return { ok: false, error: 'Pilihan ekspedisi harus "J&T Express" atau "Kurir BUMDes Gabugan".' };
  }
  if (!tracking) return { ok: false, error: "Nomor resi wajib diisi." };

  const { supabase, error: authErr } = await getAuthenticatedClient();
  if (!supabase) return { ok: false, error: authErr ?? "Autentikasi diperlukan." };

  const { error } = await supabase.rpc("rpc_ship_order", {
    p_order_code: code,
    p_courier_name: courier,
    p_tracking_number: tracking,
  });
  if (error) return { ok: false, error: error.message || "Gagal mengirim pesanan." };

  revalidateOrderPaths();
  return { ok: true };
}

/** Pembeli mengonfirmasi pesanan diterima (dikirim -> selesai) via rpc_complete_order. */
export async function completeOrderAction(orderCode: string): Promise<OrderStatusActionResult> {
  const code = orderCode.trim();
  if (!code) return { ok: false, error: "Kode pesanan tidak valid." };

  const { supabase, error: authErr } = await getAuthenticatedClient();
  if (!supabase) return { ok: false, error: authErr ?? "Autentikasi diperlukan." };

  const { error } = await supabase.rpc("rpc_complete_order", { p_order_code: code });
  if (error) return { ok: false, error: error.message || "Gagal mengonfirmasi pesanan diterima." };

  revalidateOrderPaths();
  return { ok: true };
}
