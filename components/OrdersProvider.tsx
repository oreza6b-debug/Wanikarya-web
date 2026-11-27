"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import {
  acceptOrderAction,
  completeOrderAction,
  shipOrderAction,
  type OrderStatusActionResult,
} from "@/app/actions/order-status";
import { useSession } from "@/components/AuthProvider";
import { fetchOrders } from "@/lib/orders-db";
import type { Order } from "@/lib/orders";

// TAHAP 5b: terima, kirim, dan konfirmasiDiterima tersambung ke RPC Supabase via server action.
// Aksi tolak dan batalkan masih stub (ditunda).
type Ctx = {
  orders: Order[];
  loaded: boolean;
  busyKode: string | null;
  refresh: () => Promise<void>;
  getOrder: (kode: string) => Order | undefined;
  terima: (kode: string) => Promise<OrderStatusActionResult>;
  tolak: (kode: string, reason: string) => void;
  kirim: (kode: string, ekspedisi: string, resi: string) => Promise<OrderStatusActionResult>;
  batalkan: (kode: string) => void;
  konfirmasiDiterima: (kode: string) => Promise<OrderStatusActionResult>;
};

const OrdersCtx = createContext<Ctx | null>(null);

export function useOrders() {
  const c = useContext(OrdersCtx);
  if (!c) throw new Error("useOrders harus dipakai di dalam <OrdersProvider>");
  return c;
}

const belumAktif = () =>
  window.alert("Aksi ini baru tersambung ke database di Tahap 5b. Untuk sekarang belum berfungsi.");

export default function OrdersProvider({ children }: { children: ReactNode }) {
  const { session } = useSession();
  const userId = session?.userId;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [busyKode, setBusyKode] = useState<string | null>(null);
  const busyRef = useRef(false);

  const refresh = useCallback(async () => {
    if (!userId) {
      setOrders([]);
      setLoaded(true);
      return;
    }
    try {
      setOrders(await fetchOrders());
    } catch (e) {
      console.error("Gagal memuat pesanan:", e);
    } finally {
      setLoaded(true);
    }
  }, [userId]);

  useEffect(() => {
    setLoaded(false);
    void refresh();
  }, [refresh]);

  // Muat ulang saat tab kembali dibuka (mis. penjual mengecek pesanan baru).
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refresh]);

  const runAction = useCallback(
    async (kode: string, fn: () => Promise<OrderStatusActionResult>): Promise<OrderStatusActionResult> => {
      if (busyRef.current) return { ok: false, error: "Sedang memproses pesanan lain." };
      busyRef.current = true;
      setBusyKode(kode);
      try {
        const res = await fn();
        if (!res.ok) {
          window.alert(res.error || "Terjadi kesalahan saat memproses pesanan.");
          return res;
        }
        await refresh();
        return res;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Terjadi kesalahan jaringan.";
        window.alert(msg);
        return { ok: false, error: msg };
      } finally {
        busyRef.current = false;
        setBusyKode(null);
      }
    },
    [busyKode, refresh]
  );

  const value: Ctx = {
    orders,
    loaded,
    busyKode,
    refresh,
    getOrder: (kode) => orders.find((o) => o.kode === kode),
    terima: (kode) => runAction(kode, () => acceptOrderAction(kode)),
    tolak: belumAktif,
    kirim: (kode, ekspedisi, resi) => runAction(kode, () => shipOrderAction(kode, ekspedisi, resi)),
    batalkan: belumAktif,
    konfirmasiDiterima: (kode) => runAction(kode, () => completeOrderAction(kode)),
  };

  return <OrdersCtx.Provider value={value}>{children}</OrdersCtx.Provider>;
}
