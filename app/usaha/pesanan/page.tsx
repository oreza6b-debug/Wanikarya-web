"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, SearchX, Clock, Package, Truck, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import OrderActions from "@/components/OrderActions";
import { useOrders } from "@/components/OrdersProvider";
import { getSession } from "@/lib/session";
import { RESPONSE_MS, addMs, fmtDate, subtotal, type OrderStatus } from "@/lib/orders";
import { rupiah } from "@/lib/format";
import ImageBox from "@/components/ImageBox";

const TABS: { key: OrderStatus; label: string }[] = [
  { key: "dibayarkan", label: "Perlu Diproses" },
  { key: "dikemas", label: "Dikemas" },
  { key: "dikirim", label: "Dikirim" },
  { key: "selesai", label: "Selesai" },
  { key: "dibatalkan", label: "Dibatalkan" },
];

export default function PesananMasukPage() {
  const { orders } = useOrders();
  const session = getSession();
  const [tab, setTab] = useState<OrderStatus>("dibayarkan");
  const [q, setQ] = useState("");

  const mine = orders.filter((o) => o.storeSlug === session?.storeSlug);
  const count = (s: OrderStatus) => mine.filter((o) => o.status === s).length;
  const list = mine
    .filter((o) => o.status === tab)
    .filter((o) =>
      q.trim()
        ? o.kode.toLowerCase().includes(q.trim().toLowerCase()) ||
          o.buyerName.toLowerCase().includes(q.trim().toLowerCase()) ||
          o.items.some((i) => i.name.toLowerCase().includes(q.trim().toLowerCase()))
        : true
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="space-y-6">
      {/* Title & Info */}
      <div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-sage/20 px-3 py-0.5 text-[11px] font-bold text-forest">
            Portal Penjualan Toko
          </span>
          <span className="text-xs text-ink/60">• Pembelian pribadi ada di &ldquo;Pembelian Saya&rdquo;</span>
        </div>
        <h1 className="mt-2 font-serif text-3xl font-bold text-ink">Pesanan Masuk</h1>
        <p className="mt-1 text-xs sm:text-sm text-ink/70">
          Kelola pesanan dari pembeli, konfirmasi ketersediaan bahan, dan serahkan ke kurir desa.
        </p>
      </div>

      {/* Tabs */}
      <div role="tablist" aria-label="Status pesanan" className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const active = tab === t.key;
          const num = count(t.key);
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.key)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                active
                  ? "bg-terracotta text-white shadow-xs"
                  : "bg-cream/70 text-ink/75 hover:bg-cream"
              }`}
            >
              {t.label} ({num})
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-terracotta" />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari kode pesanan (WK-…) atau nama pembeli"
          className="w-full rounded-2xl bg-white pl-10 pr-4 py-2.5 text-xs ring-1 ring-cream outline-none focus:ring-2 focus:ring-terracotta"
        />
      </div>

      {/* Orders List */}
      {list.length === 0 ? (
        <div className="rounded-3xl bg-white p-12 text-center shadow-xs ring-1 ring-cream">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cream text-terracotta">
            <SearchX size={28} />
          </div>
          <h3 className="mt-3 font-serif text-base font-bold text-ink">Tidak Ada Pesanan pada Tab Ini</h3>
          <p className="mt-1 text-xs text-ink/60 max-w-xs mx-auto">
            Semua pesanan pada status {TABS.find((t) => t.key === tab)?.label} telah diproses.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {list.map((o) => {
            const firstItem = o.items[0];
            const fallbackImage =
              firstItem?.name.toLowerCase().includes("batik") || firstItem?.name.toLowerCase().includes("syal")
                ? "/images/batik-1.jpg"
                : firstItem?.name.toLowerCase().includes("sirup")
                ? "/images/sirup-salak.jpg"
                : "/images/keripik-salak.jpg";

            return (
              <li
                key={o.kode}
                className="rounded-3xl bg-white p-5 shadow-xs ring-1 ring-cream transition-all hover:shadow-sm space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cream/70 pb-3">
                  <div>
                    <Link
                      href={`/pesanan/${o.kode}`}
                      className="font-serif text-base font-bold text-ink hover:text-terracotta"
                    >
                      #{o.kode}
                    </Link>
                    <p className="text-xs text-ink/60 mt-0.5">
                      Dipesan {fmtDate(o.createdAt)} • Pembeli: <strong>{o.buyerName}</strong> ({o.buyerPhone})
                    </p>
                  </div>
                  <SellerStatusPill status={o.status} />
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-cream">
                    <ImageBox src={fallbackImage} alt={firstItem?.name || "Produk"} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif text-sm font-bold text-ink line-clamp-1">
                      {firstItem?.name}
                      {o.items.length > 1 && (
                        <span className="ml-1 text-xs font-normal text-ink/50">+{o.items.length - 1} produk lain</span>
                      )}
                    </h4>
                    <p className="text-xs text-ink/65 mt-0.5">
                      {o.items.map((it) => `${it.qty}x ${it.name}`).join(", ")}
                    </p>
                    <p className="text-xs font-bold text-terracotta mt-1">
                      {rupiah(subtotal(o))} <span className="font-normal text-[11px] text-ink/50">(subtotal bersih toko)</span>
                    </p>
                  </div>
                </div>

                {o.status === "dibayarkan" && (
                  <div className="flex items-center gap-2 rounded-xl bg-amber-50 p-2.5 text-xs text-amber-900 ring-1 ring-amber-200">
                    <Clock size={14} className="shrink-0 text-amber-700" />
                    <span>
                      Batas waktu terima/tolak: <strong>{fmtDate(addMs(o.createdAt, RESPONSE_MS))}</strong>
                    </span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-cream/70 pt-3">
                  <Link
                    href={`/pesanan/${o.kode}`}
                    className="flex items-center gap-1 text-xs font-semibold text-terracotta hover:underline shrink-0"
                  >
                    Buka Rincian Pesanan <ArrowRight size={13} />
                  </Link>
                  <div className="flex items-center justify-end ml-auto">
                    <OrderActions order={o} viewer="seller" />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function SellerStatusPill({ status }: { status: OrderStatus }) {
  switch (status) {
    case "dibayarkan":
      return (
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
          Perlu Diproses
        </span>
      );
    case "dikemas":
      return (
        <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-800">
          Sedang Dikemas
        </span>
      );
    case "dikirim":
      return (
        <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-800">
          Dikirim
        </span>
      );
    case "selesai":
      return (
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
          Pesanan Selesai
        </span>
      );
    case "dibatalkan":
      return (
        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
          Dibatalkan
        </span>
      );
  }
}
