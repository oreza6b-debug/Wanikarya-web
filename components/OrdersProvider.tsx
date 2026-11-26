"use client";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useSession } from "@/components/AuthProvider";
import { fetchOrders } from "@/lib/orders-db";
import type { Order } from "@/lib/orders";

// TAHAP 5a: pesanan dibaca dari Supabase (data asli). Pembuatan pesanan ada di CheckoutModal.
// Aksi status (terima/tolak/kirim/batalkan/konfirmasi) belum tersambung: Tahap 5b.
type Ctx = {
  orders: Order[];
  loaded: boolean;
  refresh: () => Promise<void>;
  getOrder: (kode: string) => Order | undefined;
  terima: (kode: string) => void;
  tolak: (kode: string, reason: string) => void;
  kirim: (kode: string, ekspedisi: string, resi: string) => void;
  batalkan: (kode: string) => void;
  konfirmasiDiterima: (kode: string) => void;
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

  const value: Ctx = {
    orders,
    loaded,
    refresh,
    getOrder: (kode) => orders.find((o) => o.kode === kode),
    terima: belumAktif,
    tolak: belumAktif,
    kirim: belumAktif,
    batalkan: belumAktif,
    konfirmasiDiterima: belumAktif,
  };

  return <OrdersCtx.Provider value={value}>{children}</OrdersCtx.Provider>;
}
