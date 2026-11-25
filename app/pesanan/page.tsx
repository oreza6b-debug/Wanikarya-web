"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  ShoppingBag,
  Truck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Sparkles,
  MessageCircle,
  Check,
  SearchX,
  Store,
} from "lucide-react";
import RoleGuard from "@/components/RoleGuard";
import { useOrders } from "@/components/OrdersProvider";
import { getSession } from "@/lib/session";
import { fmtDate, total, type Order, type OrderStatus } from "@/lib/orders";
import { rupiah } from "@/lib/format";
import ImageBox from "@/components/ImageBox";

// Filter status options matching TRX-05 mockup
type TabFilter = "" | "dibayarkan" | "dikemas" | "dikirim" | "selesai" | "dibatalkan";

const TAB_CONFIG: { id: TabFilter; label: string; countStatus?: OrderStatus }[] = [
  { id: "", label: "Semua" },
  { id: "dibayarkan", label: "Menunggu Respon / Dibayarkan", countStatus: "dibayarkan" },
  { id: "dikemas", label: "Sedang Dikemas", countStatus: "dikemas" },
  { id: "dikirim", label: "Dalam Pengiriman", countStatus: "dikirim" },
  { id: "selesai", label: "Selesai", countStatus: "selesai" },
  { id: "dibatalkan", label: "Dibatalkan", countStatus: "dibatalkan" },
];

function Content() {
  const { orders, batalkan, konfirmasiDiterima } = useOrders();
  const session = getSession();
  const [q, setQ] = useState("");
  const [activeTab, setActiveTab] = useState<TabFilter>("");
  const [sortBy, setSortBy] = useState<"terbaru" | "terlama">("terbaru");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  // Buyer orders filter
  const myOrders = orders.filter((o) => o.buyerId === session?.userId);
  const totalCount = myOrders.length;
  const inDeliveryCount = myOrders.filter((o) => o.status === "dikirim" || o.status === "dikemas").length;

  const countByStatus = (st: OrderStatus) => myOrders.filter((o) => o.status === st).length;

  const filteredOrders = myOrders
    .filter((o) => (activeTab ? o.status === activeTab : true))
    .filter((o) => (q.trim() ? o.kode.toLowerCase().includes(q.trim().toLowerCase()) || o.items.some((i) => i.name.toLowerCase().includes(q.trim().toLowerCase())) : true))
    .sort((a, b) => (sortBy === "terbaru" ? b.createdAt.localeCompare(a.createdAt) : a.createdAt.localeCompare(b.createdAt)));

  return (
    <div className="bg-paper min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sage/15 px-3 py-1 text-xs font-semibold text-forest">
                <span className="h-1.5 w-1.5 rounded-full bg-sage"></span>
                Akun Pembeli
              </span>
              <span className="text-xs text-ink/60">• Terpisah mutlak dari portal Penjual & Pesanan Masuk</span>
            </div>
            <h1 className="mt-3 font-serif text-3xl sm:text-4xl font-bold text-ink tracking-tight">
              Pembelian Saya
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-ink/75 max-w-2xl leading-relaxed">
              Pantau proses kurasi, pengemasan tradisi, dan ekspedisi karya perempuan UMKM Desa Wisata Gabugan langsung dari satu halaman.
            </p>
          </div>

          {/* Stat Cards */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-xs ring-1 ring-cream">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-terracotta/10 text-terracotta">
                <ShoppingBag size={20} />
              </div>
              <div>
                <p className="font-serif text-xl font-bold text-ink leading-none">{totalCount}</p>
                <p className="text-[11px] text-ink/60 mt-0.5">Total Pesanan</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-xs ring-1 ring-cream">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage/15 text-forest">
                <Truck size={20} />
              </div>
              <div>
                <p className="font-serif text-xl font-bold text-ink leading-none">{inDeliveryCount}</p>
                <p className="text-[11px] text-ink/60 mt-0.5">Dalam Kiriman</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Sort Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-terracotta" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari kode pesanan (contoh: WK-202611...)"
              className="w-full rounded-2xl bg-white pl-10 pr-4 py-2.5 text-xs ring-1 ring-cream outline-none focus:ring-2 focus:ring-terracotta"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "terbaru" | "terlama")}
              className="rounded-2xl bg-white px-4 py-2.5 text-xs text-ink/80 ring-1 ring-cream outline-none cursor-pointer hover:bg-cream/40"
            >
              <option value="terbaru">Urutan: Pesanan Terbaru</option>
              <option value="terlama">Urutan: Pesanan Terlama</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pb-1">
          {TAB_CONFIG.map((t) => {
            const count = t.id === "" ? totalCount : countByStatus(t.countStatus!);
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                  active
                    ? "bg-terracotta text-white shadow-xs font-semibold"
                    : "bg-cream/70 text-ink/75 hover:bg-cream hover:text-ink"
                }`}
              >
                {t.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Order Cards List */}
        {filteredOrders.length === 0 ? (
          <div className="rounded-3xl bg-white p-12 text-center shadow-xs ring-1 ring-cream">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cream text-terracotta">
              <SearchX size={32} />
            </div>
            <h3 className="mt-4 font-serif text-lg font-bold text-ink">Tidak Ada Pesanan Ditemukan</h3>
            <p className="mt-1 text-xs text-ink/65 max-w-sm mx-auto">
              Tidak ada data pesanan yang cocok dengan filter atau kata kunci pencarian Anda.
            </p>
            <button
              onClick={() => {
                setActiveTab("");
                setQ("");
              }}
              className="mt-5 rounded-xl bg-terracotta px-5 py-2.5 text-xs font-semibold text-white hover:bg-terracotta-dark"
            >
              Reset Filter & Lihat Semua
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((o) => (
              <OrderCard
                key={o.kode}
                order={o}
                copiedCode={copiedCode}
                onCopy={handleCopy}
                onCancel={(kode) => window.confirm("Batalkan pesanan ini?") && batalkan(kode)}
                onConfirmReceived={(kode) => konfirmasiDiterima(kode)}
              />
            ))}
          </div>
        )}

        {/* Bottom Banner: Pusat Bantuan & Paguyuban */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl bg-cream/70 p-6 ring-1 ring-cream">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-terracotta text-white shadow-xs">
              <Store size={22} />
            </div>
            <div>
              <h4 className="font-serif text-base font-bold text-ink">Pusat Bantuan & Paguyuban Ibu Gabugan</h4>
              <p className="text-xs text-ink/70 mt-0.5 max-w-xl">
                Mengalami kendala penerimaan pesanan atau ingin menanyakan jadwal panen salak pondoh? Hubungi narahubung komunitas desa.
              </p>
            </div>
          </div>
          <a
            href="https://wa.me/6281234567890?text=Halo%20Sekretariat%20WaniKarya,%20saya%20ingin%20bertanya%20seputar%20pesanan"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-semibold text-ink shadow-xs ring-1 ring-cream hover:bg-sand/40 shrink-0"
          >
            <MessageCircle size={15} className="text-forest" />
            Tanya Sekretariat
          </a>
        </div>
      </div>
    </div>
  );
}

// Single Order Card matching TRX-05 specifications
function OrderCard({
  order: o,
  copiedCode,
  onCopy,
  onCancel,
  onConfirmReceived,
}: {
  order: Order;
  copiedCode: string | null;
  onCopy: (text: string) => void;
  onCancel: (kode: string) => void;
  onConfirmReceived: (kode: string) => void;
}) {
  const firstItem = o.items[0];
  const totalItemCount = o.items.reduce((acc, i) => acc + i.qty, 0);

  // Status Badge Pill config
  const getBadge = (status: OrderStatus) => {
    switch (status) {
      case "dibayarkan":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-800 ring-1 ring-amber-200">
            <Clock size={11} /> Dibayarkan (Tahap 1)
          </span>
        );
      case "dikemas":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-3 py-1 text-[11px] font-semibold text-stone-800 ring-1 ring-stone-200">
            <ShoppingBag size={11} /> Dikemas (Tahap 2)
          </span>
        );
      case "dikirim":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1 text-[11px] font-semibold text-sky-800 ring-1 ring-sky-200">
            <Truck size={11} /> Dikirim (Tahap 3)
          </span>
        );
      case "selesai":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-800 ring-1 ring-emerald-200">
            <CheckCircle2 size={11} /> Pesanan Selesai (Tahap 4)
          </span>
        );
      case "dibatalkan":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-[11px] font-semibold text-red-700 ring-1 ring-red-200">
            <AlertCircle size={11} /> Dibatalkan
          </span>
        );
    }
  };

  // Image fallback
  const fallbackImage =
    firstItem?.name.toLowerCase().includes("batik") || firstItem?.name.toLowerCase().includes("syal")
      ? "/images/batik-1.jpg"
      : firstItem?.name.toLowerCase().includes("anyam") || firstItem?.name.toLowerCase().includes("keranjang")
      ? "/images/anyaman-1.jpg"
      : firstItem?.name.toLowerCase().includes("sirup")
      ? "/images/sirup-salak.jpg"
      : "/images/keripik-salak.jpg";

  return (
    <div className="rounded-3xl bg-white p-5 shadow-xs ring-1 ring-cream transition-all hover:shadow-sm">
      {/* Card Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cream/70 pb-3.5">
        <div className="flex items-center gap-2 text-xs">
          <span className="h-2 w-2 rounded-full bg-terracotta" />
          <span className="font-semibold text-ink">{o.storeName}</span>
          <span className="text-ink/40">•</span>
          <span className="text-ink/60">{fmtDate(o.createdAt).split(",")[0]}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-ink/70">
            <span className="font-mono font-medium">{o.kode}</span>
            <button
              onClick={() => onCopy(o.kode)}
              title="Salin kode"
              className="rounded p-1 text-ink/50 hover:bg-cream hover:text-ink"
            >
              {copiedCode === o.kode ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
            </button>
          </div>
          {getBadge(o.status)}
        </div>
      </div>

      {/* Card Body */}
      <div className="grid gap-4 py-4 sm:grid-cols-[auto_1fr_auto] sm:items-center">
        {/* Product Thumbnail */}
        <div className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-2xl bg-cream">
          <ImageBox src={fallbackImage} alt={firstItem?.name || "Produk"} className="h-full w-full object-cover" />
        </div>

        {/* Product Details & Status Information */}
        <div className="space-y-1.5 min-w-0">
          <h3 className="font-serif text-base sm:text-lg font-bold text-ink line-clamp-1">
            {firstItem?.name}
            {o.items.length > 1 && (
              <span className="ml-2 text-xs font-normal text-ink/50">+{o.items.length - 1} produk lain</span>
            )}
          </h3>
          <p className="text-xs text-ink/65">
            Jumlah: {totalItemCount} {totalItemCount > 1 ? "produk" : "bungkus"} ({o.items.map((i) => `${i.qty}x ${i.name}`).join(", ")})
          </p>

          {/* Contextual status callout inside body */}
          {o.status === "dibayarkan" && (
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800 ring-1 ring-amber-200">
              <Clock size={12} /> Sisa waktu respon penjual: 41 jam
            </div>
          )}

          {o.status === "dikemas" && (
            <div className="mt-2 space-y-1">
              <p className="flex items-center gap-1.5 text-xs text-ink/75">
                <CheckCircle2 size={13} className="text-sage shrink-0" />
                Ibu pengrajin sedang menyiapkan kardus ramah lingkungan & pelindung alami.
              </p>
              <p className="flex items-center gap-1 text-[11px] text-terracotta">
                <Clock size={11} className="shrink-0" />
                Estimasi serah terima ke kurir: Hari ini sebelum 17.00 WIB
              </p>
            </div>
          )}

          {o.status === "dikirim" && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <span className="rounded bg-sky-100 px-2 py-0.5 font-bold text-sky-800 text-[10px]">
                  {o.ekspedisi || "J&T Express"}
                </span>
                <span className="font-mono text-ink/70">Resi: {o.resi || "JT9928172019"}</span>
              </div>
              <p className="text-[11px] text-ink/65">
                Posisi Terakhir: Gateway Sleman Menuju Hub Pengantaran Akhir
              </p>
            </div>
          )}

          {o.status === "selesai" && (
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">
              <Sparkles size={13} /> Tercatat di Financial Tracker toko {o.storeName}
            </div>
          )}

          {o.status === "dibatalkan" && (
            <div className="mt-2 rounded-xl bg-red-50 p-2.5 text-xs text-red-800 ring-1 ring-red-200">
              <p className="font-semibold text-[11px] uppercase tracking-wide">Alasan Penolakan:</p>
              <p className="mt-0.5 text-red-700 italic">
                &ldquo;{o.cancelReason || "Stok bahan baku habis, produksi ulang belum selesai."}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Price & Billing */}
        <div className="sm:text-right border-t sm:border-t-0 border-cream/70 pt-2 sm:pt-0">
          <p className="text-[11px] text-ink/60">
            {o.status === "selesai"
              ? "Total Selesai"
              : o.status === "dibatalkan"
              ? "Pengembalian Dana"
              : "Total Belanja"}
          </p>
          <p className="font-serif text-xl sm:text-2xl font-bold text-terracotta">{rupiah(total(o))}</p>
          <p className="text-[10px] text-ink/50 mt-0.5">
            {o.status === "dibatalkan" ? "Simulasi Dikembalikan" : "Termasuk ongkir & proteksi karya"}
          </p>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-cream/70 pt-3 mt-1 text-xs">
        <p className="text-ink/65 text-[11px]">
          {o.status === "dibayarkan" && "Dana tertahan aman dalam Rekening Bersama WaniKarya"}
          {o.status === "dikemas" && "Ibu Wahyuni sedang menyiapkan kardus ramah lingkungan & pelindung daun pisang"}
          {o.status === "dikirim" && "Pastikan paket dibuka dan diperiksa sebelum menyelesaikan pesanan"}
          {o.status === "selesai" && "Pembelian Anda berkontribusi pada kemandirian perempuan Dusun Gabugan"}
          {o.status === "dibatalkan" && "Dana telah dikembalikan ke saldo dompet WaniKarya Buyer Anda"}
        </p>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {o.status === "dibayarkan" && (
            <>
              <button
                type="button"
                onClick={() => onCancel(o.kode)}
                className="rounded-xl border border-red-200 bg-red-50/70 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors"
              >
                Batalkan Pesanan
              </button>
              <Link
                href={`/pesanan/${o.kode}`}
                className="rounded-xl bg-terracotta px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-terracotta-dark transition-colors"
              >
                Lihat Detail Pesanan
              </Link>
            </>
          )}

          {o.status === "dikemas" && (
            <Link
              href={`/pesanan/${o.kode}`}
              className="rounded-xl bg-terracotta px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-terracotta-dark transition-colors"
            >
              Lihat Detail Pesanan
            </Link>
          )}

          {o.status === "dikirim" && (
            <>
              <Link
                href={`/pesanan/${o.kode}`}
                className="rounded-xl border border-cream bg-white px-4 py-2 text-xs font-semibold text-ink/80 hover:bg-cream transition-colors"
              >
                Lihat Detail Pesanan
              </Link>
              <button
                type="button"
                onClick={() => onConfirmReceived(o.kode)}
                className="flex items-center gap-1.5 rounded-xl bg-forest px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-forest/90 transition-colors"
              >
                <Check size={14} /> Konfirmasi Pesanan Diterima
              </button>
            </>
          )}

          {o.status === "selesai" && (
            <>
              <Link
                href="/her-market"
                className="rounded-xl border border-cream bg-white px-4 py-2 text-xs font-semibold text-ink/80 hover:bg-cream transition-colors"
              >
                Beli Lagi
              </Link>
              <Link
                href={`/pesanan/${o.kode}`}
                className="rounded-xl bg-terracotta px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-terracotta-dark transition-colors"
              >
                Lihat Rincian Selesai
              </Link>
            </>
          )}

          {o.status === "dibatalkan" && (
            <Link
              href={`/pesanan/${o.kode}`}
              className="rounded-xl border border-cream bg-white px-4 py-2 text-xs font-semibold text-ink/80 hover:bg-cream transition-colors"
            >
              Rincian Pembatalan
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PembelianSayaPage() {
  return (
    <RoleGuard allow={["buyer", "womanpreneur"]}>
      <Content />
    </RoleGuard>
  );
}
