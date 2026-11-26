"use client";
import { useState } from "react";
import { useOrders } from "./OrdersProvider";
import { EKSPEDISI, type Order } from "@/lib/orders";

export type Viewer = "buyer" | "seller" | "admin";

const btn = "rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
const primary = `${btn} bg-terracotta text-white hover:bg-terracotta-dark`;
const danger = `${btn} bg-red-50 text-red-700 ring-1 ring-red-200 hover:bg-red-100`;
const field = "w-full rounded-lg bg-white px-3 py-2 text-sm ring-1 ring-cream outline-none";

// Aksi hanya tampil untuk aktor berwenang pada status yang sesuai (FR-ORD-14).
// Admin: baca saja, tidak ada aksi (SKN-16).
export default function OrderActions({ order, viewer }: { order: Order; viewer: Viewer }) {
  const { terima, tolak, kirim, batalkan, konfirmasiDiterima, busyKode } = useOrders();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [ekspedisi, setEkspedisi] = useState("");
  const [resi, setResi] = useState("");
  const [err, setErr] = useState("");
  const isBusy = busyKode === order.kode;

  const s = order.status;

  // ---- Buyer ----
  if (viewer === "buyer") {
    if (s === "dibayarkan")
      return (
        <div className="flex flex-wrap items-center gap-3">
          <button
            className={danger}
            onClick={() => window.confirm("Batalkan pesanan ini?") && batalkan(order.kode)}
          >
            Batalkan Pesanan
          </button>
          <span className="text-xs text-ink/65">Pembatalan hanya bisa sebelum penjual menerima pesanan.</span>
        </div>
      );
    if (s === "dikemas")
      return <p className="text-xs text-ink/65">Pesanan sudah dikemas. Untuk pembatalan, hubungi penjual di luar sistem.</p>;
    if (s === "dikirim")
      return (
        <button className={primary} disabled={isBusy} onClick={() => void konfirmasiDiterima(order.kode)}>
          {isBusy ? "Memproses…" : "Pesanan Diterima"}
        </button>
      );
    return null;
  }

  // ---- Penjual ----
  if (viewer === "seller") {
    if (s === "dibayarkan")
      return (
        <div className="space-y-3">
          {!rejecting ? (
            <div className="flex flex-wrap items-center justify-end gap-2.5">
              <button className={danger} disabled={isBusy} onClick={() => setRejecting(true)}>Tolak Pesanan</button>
              <button className={primary} disabled={isBusy} onClick={() => void terima(order.kode)}>
                {isBusy ? "Memproses…" : "Terima Pesanan"}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-ink/80" htmlFor={`alasan-${order.kode}`}>
                Alasan penolakan (wajib)
              </label>
              <textarea
                id={`alasan-${order.kode}`}
                rows={2}
                value={reason}
                onChange={(e) => { setReason(e.target.value); setErr(""); }}
                className={field}
                placeholder="Contoh: Stok habis, produksi ulang belum selesai."
              />
              {err && <p className="text-xs text-red-600">{err}</p>}
              <div className="flex gap-2 justify-end">
                <button className={`${btn} bg-cream`} onClick={() => { setRejecting(false); setErr(""); }}>Batal</button>
                <button
                  className={danger}
                  onClick={() => (reason.trim() ? tolak(order.kode, reason.trim()) : setErr("Alasan penolakan wajib diisi."))}
                >
                  Kirim Penolakan
                </button>
              </div>
            </div>
          )}
        </div>
      );

    if (s === "dikemas")
      return (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 sm:items-end">
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink/80" htmlFor={`eks-${order.kode}`}>Ekspedisi (wajib)</label>
              <select id={`eks-${order.kode}`} className={field} value={ekspedisi} onChange={(e) => { setEkspedisi(e.target.value); setErr(""); }}>
                <option value="">Pilih ekspedisi</option>
                {EKSPEDISI.map((x) => <option key={x}>{x}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink/80" htmlFor={`resi-${order.kode}`}>Nomor resi (wajib)</label>
              <input id={`resi-${order.kode}`} className={field} value={resi} onChange={(e) => { setResi(e.target.value); setErr(""); }} placeholder="Contoh: JT882910488219" />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              className={primary}
              disabled={isBusy}
              onClick={() =>
                ekspedisi && resi.trim() ? void kirim(order.kode, ekspedisi, resi.trim()) : setErr("Ekspedisi dan nomor resi wajib diisi.")
              }
            >
              {isBusy ? "Memproses…" : "Kirim Pesanan"}
            </button>
          </div>
          {err && <p className="text-xs text-red-600 text-right">{err}</p>}
        </div>
      );

    return null; // Dikirim / Selesai / Dibatalkan: tidak ada aksi penjual
  }

  return null; // admin: baca saja
}
