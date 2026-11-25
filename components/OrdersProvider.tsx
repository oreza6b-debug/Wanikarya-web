"use client";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { mockOrders, type Actor, type Order, type OrderStatus } from "@/lib/orders";

// STATE SEMENTARA (mock, hilang saat refresh). Saat BE siap, ganti isi fungsi di bawah
// dengan pemanggilan Supabase. Aturan sebenarnya (validasi stok, siapa boleh mengubah status,
// batas 2x24 jam / 7x24 jam, pencatatan pendapatan) ditegakkan di BE.
type Ctx = {
  orders: Order[];
  getOrder: (kode: string) => Order | undefined;
  addOrder: (order: Order) => void;
  terima: (kode: string) => void; // Dibayarkan -> Dikemas (penjual)
  tolak: (kode: string, reason: string) => void; // Dibayarkan -> Dibatalkan (penjual, alasan wajib)
  kirim: (kode: string, ekspedisi: string, resi: string) => void; // Dikemas -> Dikirim (penjual)
  batalkan: (kode: string) => void; // Dibayarkan -> Dibatalkan (buyer)
  konfirmasiDiterima: (kode: string) => void; // Dikirim -> Pesanan Selesai (buyer)
};

const OrdersCtx = createContext<Ctx | null>(null);

export function useOrders() {
  const c = useContext(OrdersCtx);
  if (!c) throw new Error("useOrders harus dipakai di dalam <OrdersProvider>");
  return c;
}

export default function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(mockOrders);

  // Hanya berubah bila status saat ini == from (mencegah klik ganda / lompat status).
  const move = useCallback(
    (kode: string, from: OrderStatus, to: OrderStatus, by: Actor, patch: Partial<Order> = {}) =>
      setOrders((prev) =>
        prev.map((o) =>
          o.kode === kode && o.status === from
            ? { ...o, ...patch, status: to, history: [...o.history, { status: to, at: new Date().toISOString(), by }] }
            : o
        )
      ),
    []
  );

  const addOrder = useCallback((order: Order) => {
    setOrders((prev) => [order, ...prev]);
  }, []);

  const value: Ctx = {
    orders,
    getOrder: (kode) => orders.find((o) => o.kode === kode),
    addOrder,
    terima: (k) => move(k, "dibayarkan", "dikemas", "Womanpreneur"),
    tolak: (k, reason) => move(k, "dibayarkan", "dibatalkan", "Womanpreneur", { cancelReason: reason, cancelledBy: "Womanpreneur" }),
    kirim: (k, ekspedisi, resi) => move(k, "dikemas", "dikirim", "Womanpreneur", { ekspedisi, resi }),
    batalkan: (k) => move(k, "dibayarkan", "dibatalkan", "Buyer", { cancelledBy: "Buyer" }),
    konfirmasiDiterima: (k) => move(k, "dikirim", "selesai", "Buyer"),
  };

  return <OrdersCtx.Provider value={value}>{children}</OrdersCtx.Provider>;
}
