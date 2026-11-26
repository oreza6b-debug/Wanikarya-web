"use client";

import Link from "next/link";
import { useOrders } from "@/components/OrdersProvider";
import { useSession } from "@/components/AuthProvider";
import { RESPONSE_MS, addMs, fmtDate, subtotal } from "@/lib/orders";
import { rupiah } from "@/lib/format";
import { products, services } from "@/lib/data";
import ImageBox from "@/components/ImageBox";
import {
  LayoutDashboard,
  Package,
  Clock,
  Truck,
  BookOpen,
  CheckCircle2,
  ShoppingBag,
  Percent,
  MapPin,
  BadgeCheck,
  Store,
  Phone,
} from "lucide-react";

export default function DashboardUsahaPage() {
  const { orders } = useOrders();
  const { session } = useSession();

  const mine = orders.filter((o) => o.storeSlug === session?.storeSlug);
  const myProducts = products.filter((p) => p.storeSlug === session?.storeSlug);
  const myServices = services.filter((s) => s.storeSlug === session?.storeSlug);
  const activeProducts = myProducts.filter((p) => p.stock > 0);
  const promoProducts = myProducts.filter((p) => (p.promoPercent ?? 0) > 0);

  const perluDiproses = mine.filter((o) => o.status === "dibayarkan");
  const siapDikirim = mine.filter((o) => o.status === "dikemas");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-cream">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-ink/60">
              <span className="flex items-center gap-1">
                <MapPin size={12} className="text-terracotta" />
                Pawon Salak Lestari • RT 03 Dusun Gabugan
              </span>
              <span className="flex items-center gap-1 rounded-full bg-sage/20 px-2 py-0.5 font-semibold text-sage">
                <BadgeCheck size={12} />
                Terverifikasi Pokdarwis
              </span>
            </div>
            <h1 className="mt-2 font-serif text-3xl font-bold text-ink">
              Sugeng Rawuh, {session?.name}
            </h1>
            <p className="mt-1 text-sm text-ink/65">
              Kelola etalase karya salak pondoh, pantau pesanan masuk, dan rawat
              hubungan dengan pembeli dari satu tempat.
            </p>
          </div>
          {/* Status Gerai */}
          <div className="rounded-xl border-2 border-cream bg-paper p-4 text-sm">
            <p className="text-xs font-semibold text-ink/50">STATUS GERAI</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="font-bold text-ink">Buka • Siap Menerima Pesanan</span>
            </div>
            <p className="mt-1 text-xs text-terracotta font-medium">
              Siaga Pengiriman Hari Ini
            </p>
          </div>
        </div>
      </div>

      {/* Perlu Tindakan Hari Ini */}
      {(perluDiproses.length > 0 || siapDikirim.length > 0) && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-ink flex items-center gap-2">
              <span className="h-4 w-1 rounded-full bg-terracotta" />
              Perlu Tindakan Hari Ini
            </h2>
            <span className="text-xs text-red-600 font-semibold">
              {perluDiproses.length + siapDikirim.length} Pesanan Mendesak Menunggu Respon
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Pesanan Perlu Diproses */}
            {perluDiproses.length > 0 && (
              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-cream space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-amber-100 p-2.5">
                      <ShoppingBag size={20} className="text-amber-700" />
                    </div>
                    <div>
                      <p className="font-bold text-ink">Pesanan Perlu Diproses</p>
                      <p className="text-xs text-ink/60">
                        ID: {perluDiproses[0].kode}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">
                    {perluDiproses.length} Baru
                  </span>
                </div>
                {/* Item */}
                <div className="rounded-xl bg-cream/50 p-3 flex gap-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-cream">
                    <ImageBox
                      src="/images/keripik-salak.jpg"
                      alt={perluDiproses[0].items[0]?.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-ink line-clamp-1">
                      {perluDiproses[0].items[0]?.name}
                    </p>
                    <p className="text-xs text-ink/60 mt-0.5">
                      Jumlah: {perluDiproses[0].items[0]?.qty} bungkus • Total:{" "}
                      {rupiah(subtotal(perluDiproses[0]))}
                    </p>
                    <p className="text-xs text-terracotta font-medium mt-0.5">
                      Pemesan: {perluDiproses[0].buyerName} • Kurir Reguler
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900 ring-1 ring-amber-200">
                  <Clock size={13} className="shrink-0 text-amber-700" />
                  Harap terima sebelum waktu habis agar transaksi tidak dibatalkan otomatis oleh sistem.
                </div>
                <div className="flex items-center gap-2 text-xs text-ink/60">
                  <Clock size={12} className="text-red-500" />
                  <span className="text-red-600 font-semibold">
                    {fmtDate(addMs(perluDiproses[0].createdAt, RESPONSE_MS))} — batas respons
                  </span>
                </div>
                <Link
                  href="/usaha/pesanan"
                  className="block w-full rounded-xl bg-terracotta py-2.5 text-center text-sm font-semibold text-white hover:bg-terracotta-dark transition"
                >
                  Buka Pesanan Masuk →
                </Link>
              </div>
            )}

            {/* Pesanan Siap Dikirim */}
            {siapDikirim.length > 0 && (
              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-cream space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-sky-100 p-2.5">
                      <Truck size={20} className="text-sky-700" />
                    </div>
                    <div>
                      <p className="font-bold text-ink">Pesanan Perlu Dikirim</p>
                      <p className="text-xs text-ink/60">
                        ID: {siapDikirim[0].kode}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                    {siapDikirim.length} Siap — Sudah Dikemas
                  </span>
                </div>
                {/* Item */}
                <div className="rounded-xl bg-cream/50 p-3 flex gap-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-cream">
                    <ImageBox
                      src="/images/selai-salak.jpg"
                      alt={siapDikirim[0].items[0]?.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-ink line-clamp-1">
                      {siapDikirim[0].items[0]?.name}
                    </p>
                    <p className="text-xs text-ink/60 mt-0.5">
                      Jumlah: {siapDikirim[0].items[0]?.qty} toples • Total:{" "}
                      {rupiah(subtotal(siapDikirim[0]))}
                    </p>
                    <p className="text-xs text-ink/60 mt-0.5">
                      Pemesan: {siapDikirim[0].buyerName} • {siapDikirim[0].ekspedisi ?? "J&T Express"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-900 ring-1 ring-emerald-200">
                  <CheckCircle2 size={13} className="shrink-0 text-emerald-700 mt-0.5" />
                  Besek pelindung telah disiapkan. Segera titipkan ke agen kurir desa atau pos pengantaran.
                </div>
                <Link
                  href="/usaha/pesanan"
                  className="block w-full rounded-xl border-2 border-terracotta py-2.5 text-center text-sm font-semibold text-terracotta hover:bg-terracotta hover:text-white transition"
                >
                  Input Resi Pengiriman 📋
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pintasan Kelola Usaha */}
      <div>
        <h2 className="mb-4 font-serif text-xl font-bold text-ink flex items-center gap-2">
          <span className="h-4 w-1 rounded-full bg-terracotta" />
          Pintasan Kelola Usaha
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Kelola Produk & Stok */}
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-cream hover:shadow-md transition space-y-3">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-amber-100 p-2.5">
                <Package size={20} className="text-amber-700" />
              </div>
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                Katalog
              </span>
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-ink">
                Kelola Produk &amp; Stok
              </h3>
              <p className="mt-1 text-xs text-ink/65">
                Perbarui harga, ketersediaan harian, dan deskripsi olahan salak pondoh segar.
              </p>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700 font-medium">
                <CheckCircle2 size={11} /> {activeProducts.length} Aktif
              </span>
              {promoProducts.length > 0 && (
                <span className="flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-orange-700 font-medium">
                  <Percent size={11} /> {promoProducts.length} Promo
                </span>
              )}
            </div>
            <Link
              href="/usaha/produk"
              className="block w-full rounded-xl border border-terracotta py-2 text-center text-sm font-semibold text-terracotta hover:bg-terracotta hover:text-white transition"
            >
              Buka Etalase Produk 🗂
            </Link>
          </div>

          {/* Kelola Promo Diskon */}
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-cream hover:shadow-md transition space-y-3">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-orange-100 p-2.5">
                <Percent size={20} className="text-orange-600" />
              </div>
              <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-600 ring-1 ring-orange-200">
                Diskon Aktif
              </span>
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-ink">
                Kelola Promo Diskon
              </h3>
              <p className="mt-1 text-xs text-ink/65">
                Tarik lebih banyak pembeli luar kota dengan potongan harga musim panen.
              </p>
            </div>
            {promoProducts[0] && (
              <div className="rounded-lg bg-cream/70 px-3 py-2 text-xs space-y-0.5">
                <p className="font-semibold text-terracotta">Diskon Manis Pembuka Panen</p>
                <div className="flex gap-3 text-ink/70">
                  <span>Potongan langsung {promoProducts[0].promoPercent}%</span>
                  <span>Berlaku s/d Akhir Bulan</span>
                </div>
              </div>
            )}
            <Link
              href="/usaha/jasa-promo"
              className="block w-full rounded-xl border border-terracotta py-2 text-center text-sm font-semibold text-terracotta hover:bg-terracotta hover:text-white transition"
            >
              Atur Diskon ⚙
            </Link>
          </div>

          {/* Layanan Wisata Desa */}
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-cream hover:shadow-md transition space-y-3">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-sage/20 p-2.5">
                <MapPin size={20} className="text-sage" />
              </div>
              <span className="rounded-full bg-sage/10 px-2.5 py-1 text-xs font-semibold text-forest ring-1 ring-sage/30">
                Edukasi Kebun
              </span>
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-ink">
                Layanan Wisata Desa
              </h3>
              <p className="mt-1 text-xs text-ink/65">
                Terima reservasi rombongan untuk petik salak dan belajar membuat dodol salak.
              </p>
            </div>
            {myServices[0] && (
              <div className="rounded-lg bg-cream/70 px-3 py-2 text-xs space-y-0.5">
                <p className="font-semibold text-ink">{myServices[0].name}</p>
                <p className="text-ink/60">
                  Rp {myServices[0].priceFrom?.toLocaleString("id-ID")} / orang • 1 Paket Terbuka
                </p>
              </div>
            )}
            <Link
              href="/usaha/jasa-promo"
              className="block w-full rounded-xl border border-terracotta py-2 text-center text-sm font-semibold text-terracotta hover:bg-terracotta hover:text-white transition"
            >
              Cek Layanan 📅
            </Link>
          </div>
        </div>
      </div>

      {/* Pedoman Penjual */}
      <div className="rounded-2xl bg-forest/95 p-6 text-white space-y-4">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-white/15 p-2.5">
            <BookOpen size={20} className="text-white" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold">
              Pedoman Penjual Desa Wisata Gabugan
            </h2>
            <p className="mt-1 text-sm text-white/75">
              Tata cara menjaga mutu layanan, keramahtamahan, dan kelestarian
              lingkungan khas padukuhan Gabugan bagi setiap pengrajin.
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: "⏱",
              title: "Konfirmasi 2×24 Jam",
              desc: "Selalu terima atau tolak pesanan dalam waktu maksimal 48 jam agar pesanan tidak batal otomatis dan menjaga reputasi toko.",
            },
            {
              icon: "🌿",
              title: "Kemasan Ramah Lingkungan",
              desc: "Gunakan anyaman besek bambu dan kardus daur ulang khas Gabugan untuk mengemas produk kering demi mengurangi limbah plastik.",
            },
            {
              icon: "🤝",
              title: "Bantuan Pokdarwis",
              desc: "Butuh bantuan pencetakan label atau pasokan besek tambahan? Hubungi posko narahubung Pokdarwis di Balai Dusun Gabugan.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-xl bg-white/10 p-4 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-lg">{item.icon}</span>
                <p className="font-semibold text-sm">{item.title}</p>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/20 pt-4 text-xs text-white/70">
          <span className="flex items-center gap-1.5">
            <Phone size={12} />
            Narahubung Pendamping Pokdarwis: Mas Danang (+62 813‑2890‑1123)
          </span>
          <Link href="#" className="font-semibold text-sand hover:underline">
            Baca Pedoman Komprehensif Pokdarwis →
          </Link>
        </div>
      </div>
    </div>
  );
}
