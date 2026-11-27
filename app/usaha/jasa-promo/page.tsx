"use client";

import { useState } from "react";
import { services as allServices, products as allProducts } from "@/lib/data";
import { useSession } from "@/components/AuthProvider";
import { rupiah } from "@/lib/format";
import ImageBox from "@/components/ImageBox";
import {
  Plus,
  Pencil,
  Calendar,
  X,
  RefreshCw,
  MessageCircle,
  MapPin,
  Clock,
  Users,
  Percent,
  AlertCircle,
} from "lucide-react";

type Tab = "jasa" | "promo";

type Promo = {
  id: string;
  name: string;
  productSlug: string;
  productName: string;
  productPrice: number;
  discountType: "persen" | "nominal";
  discountValue: number;
  startDate: string;
  endDate: string;
  status: "aktif" | "dijadwalkan" | "selesai";
};

const mockPromos: Promo[] = [
  {
    id: "PRM-ACT-004",
    name: "Promo Panen Raya Salak Merapi",
    productSlug: "keripik-salak-madu-150g",
    productName: "Keripik Salak Madu 150g",
    productPrice: 28000,
    discountType: "persen",
    discountValue: 15,
    startDate: "2026-11-20",
    endDate: "2026-11-30",
    status: "aktif",
  },
  {
    id: "PRM-SCH-005",
    name: "Promo Selai Akhir Pekan",
    productSlug: "selai-salak-organik-220ml",
    productName: "Selai Salak Organik 220ml",
    productPrice: 32000,
    discountType: "nominal",
    discountValue: 5000,
    startDate: "2026-12-01",
    endDate: "2026-12-03",
    status: "dijadwalkan",
  },
];

export default function JasaPromoPage() {
  const { session } = useSession();
  const myServices = allServices.filter((s) => s.storeSlug === session?.storeSlug);
  const myProducts = allProducts.filter((p) => p.storeSlug === session?.storeSlug);

  const [tab, setTab] = useState<Tab>("jasa");
  const [promos, setPromos] = useState<Promo[]>(mockPromos);

  // Promo form
  const [promoForm, setPromoForm] = useState({
    name: "",
    productSlug: "",
    discountType: "persen" as "persen" | "nominal",
    discountValue: 0,
    startDate: "",
    endDate: "",
  });

  const selectedProduct = myProducts.find((p) => p.slug === promoForm.productSlug);
  const finalPrice =
    selectedProduct
      ? promoForm.discountType === "persen"
        ? Math.round(selectedProduct.price * (1 - promoForm.discountValue / 100))
        : selectedProduct.price - promoForm.discountValue
      : 0;

  const kuotaAktif = promos.filter((p) => p.status === "aktif" || p.status === "dijadwalkan").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-ink/60 mb-2">
          <span className="rounded-full bg-sage/20 px-2.5 py-0.5 font-bold text-forest">
            MODUL WPA-05 S.D. WPA-08
          </span>
          <span>• Desa Wisata Gabugan</span>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-ink">
              Jasa Wisata &amp; Manajemen Promo Toko
            </h1>
            <p className="mt-1 text-sm text-ink/65">
              Kelola pengalaman agrowisata berbasis WhatsApp serta skema promosi diskon produk
              Pawon Salak Lestari sesuai regulasi desa.
            </p>
          </div>
          {/* Tab Switch */}
          <div className="flex gap-1 rounded-xl bg-cream p-1">
            <button
              onClick={() => setTab("jasa")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                tab === "jasa"
                  ? "bg-terracotta text-white shadow-sm"
                  : "text-ink/60 hover:text-ink"
              }`}
            >
              Jasa Wisata
            </button>
            <button
              onClick={() => setTab("promo")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                tab === "promo"
                  ? "bg-terracotta text-white shadow-sm"
                  : "text-ink/60 hover:text-ink"
              }`}
            >
              % Promo Diskon
            </button>
          </div>
        </div>
      </div>

      {/* ===== TAB JASA WISATA ===== */}
      {tab === "jasa" && (
        <div className="space-y-5">
          {/* Pemesanan WhatsApp Notice */}
          <div className="rounded-2xl bg-white p-5 ring-1 ring-cream shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="rounded-xl bg-emerald-100 p-2.5">
                <MessageCircle size={20} className="text-emerald-700" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-ink">Pemesanan Langsung WhatsApp</p>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">
                    Direct Chat
                  </span>
                </div>
                <p className="text-xs text-ink/65 leading-relaxed">
                  Paket wisata tidak melalui keranjang belanja digital. Wisatawan langsung
                  berinteraksi dengan Ibu Sumarsih via WhatsApp untuk konfirmasi tanggal,
                  jumlah rombongan, dan hidangan pawon.
                </p>
              </div>
            </div>
            <button className="flex items-center gap-2 rounded-xl bg-terracotta px-4 py-2.5 text-sm font-semibold text-white hover:bg-terracotta-dark transition shrink-0">
              <Plus size={15} /> Tambah Layanan Baru
            </button>
          </div>

          {/* Service List */}
          {myServices.map((svc) => (
            <div
              key={svc.slug}
              className="rounded-2xl bg-white ring-1 ring-cream shadow-sm overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row">
                {/* Image */}
                <div className="relative h-52 sm:h-auto sm:w-64 shrink-0">
                  <ImageBox
                    src={svc.image}
                    alt={svc.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3">
                    <span className="rounded-full bg-terracotta/90 px-3 py-1 text-xs font-bold text-white">
                      {svc.category}
                    </span>
                    <p className="mt-1 font-serif text-lg font-bold text-white drop-shadow-sm">
                      {svc.name}
                    </p>
                  </div>
                </div>

                {/* Detail */}
                <div className="flex-1 p-5 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold text-ink/50">RINGKASAN PENGALAMAN</p>
                      <p className="mt-1 text-sm text-ink/75 leading-relaxed line-clamp-3">
                        {svc.description}
                      </p>
                    </div>
                    <span className="text-xs text-ink/40 shrink-0">ID: WST-SLK-001</span>
                  </div>

                  {/* Fasilitas Grid */}
                  <div>
                    <p className="text-xs font-semibold text-ink/60 mb-2">
                      Fasilitas yang Didapatkan Peserta:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { icon: "🧢", title: "Peminjaman Caping & Pisau", desc: "Alat panen tradisional steril" },
                        { icon: "🫙", title: "Toples Selai Bawa Pulang", desc: "1 botol kaca 150g hasil racikan" },
                        { icon: "🍵", title: "Wedang Suguhan & Kudapan", desc: "Wedang jahe & pie salak hangat" },
                        { icon: "📍", title: "Pemandu Lokal Bersertifikat", desc: "Didampingi Ibu Sumarsih & tim" },
                      ].map((f) => (
                        <div key={f.title} className="rounded-lg bg-cream/60 px-3 py-2 text-xs">
                          <p className="font-semibold text-ink flex items-center gap-1">
                            <span>{f.icon}</span> {f.title}
                          </p>
                          <p className="text-ink/60 mt-0.5">{f.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Catatan */}
                  <div className="rounded-lg bg-amber-50 px-3 py-2.5 text-xs ring-1 ring-amber-200">
                    <p className="font-semibold text-amber-900 flex items-center gap-1 mb-1">
                      <AlertCircle size={12} /> Persyaratan &amp; Catatan Penting
                    </p>
                    <p className="text-amber-800">
                      Peserta disarankan memakai sepatu beralas karet anti-slip dan pakaian santai.
                      Pemesanan minimal H-2 untuk persiapan bahan olahan dapur dan pemetikan kebun.
                    </p>
                  </div>

                  {/* Info Bawah */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-ink/50">Tarif Partisipasi</p>
                      <p className="font-serif text-xl font-bold text-terracotta">
                        Rp {svc.priceFrom?.toLocaleString("id-ID")} / orang
                      </p>
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                        Layanan Aktif
                      </span>
                    </div>
                    <div className="flex gap-3 text-xs text-ink/60">
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {svc.duration} Durasi
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={12} /> 2 - 15 Org Kapasitas
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={12} /> RT 03 Gabugan
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button className="flex items-center gap-1.5 rounded-xl border border-terracotta px-3 py-2 text-xs font-semibold text-terracotta hover:bg-terracotta hover:text-white transition">
                        <Pencil size={12} /> Ubah Layanan
                      </button>
                      <button className="flex items-center gap-1.5 rounded-xl bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-200 transition">
                        <MessageCircle size={12} /> Uji Tautan WA
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-ink/50 border-t border-cream pt-2">
                    <span className="flex items-center gap-1">
                      <MapPin size={11} />
                      Kebun Salak RT 03 &amp; Pawon Lestari, Gabugan
                    </span>
                    <span>14 Reservasi Bulan Ini</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== TAB PROMO DISKON ===== */}
      {tab === "promo" && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 text-xs text-ink/60 mb-1">
                <span className="rounded-full bg-orange-100 px-2.5 py-0.5 font-bold text-orange-700">
                  WPA-07 &amp; WPA-08
                </span>
                <span>• URS FR-PRM</span>
              </div>
              <h2 className="font-serif text-2xl font-bold text-ink">
                Manajemen Promo Diskon Toko
              </h2>
              <p className="text-sm text-ink/65">
                Aturan sistematis potongan harga mandiri untuk menaikkan volume penjualan olahan salak.
              </p>
            </div>
            <div className="rounded-xl bg-cream px-4 py-2 text-sm font-semibold">
              Kuota Promo Aktif:{" "}
              <span className="text-terracotta font-bold">
                {kuotaAktif} / 5 Produk
              </span>
            </div>
          </div>

          {/* Kaidah Validasi */}
          <div className="rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200 flex gap-3">
            <div className="rounded-full bg-amber-200 p-2 h-fit">
              <AlertCircle size={16} className="text-amber-800" />
            </div>
            <div className="text-sm text-amber-900">
              <p className="font-semibold">Kaidah Validasi Promo (URS FR-PRM)</p>
              <ul className="mt-1 space-y-0.5 text-xs text-amber-800">
                <li>✓ Batas Nilai: Diskon tidak boleh melampaui 90% harga satuan.</li>
                <li>✓ Anti Tumpang Tindih: Promo yang sudah aktif tidak dapat dihapus.</li>
                <li>✓ Harga produk tidak kurun waktu yang sama: dinonaktifkan seketika.</li>
              </ul>
            </div>
          </div>

          {/* Promo List */}
          <div className="grid gap-4 sm:grid-cols-2">
            {promos.map((promo) => {
              const finalP =
                promo.discountType === "persen"
                  ? Math.round(promo.productPrice * (1 - promo.discountValue / 100))
                  : promo.productPrice - promo.discountValue;
              const hemat =
                promo.discountType === "persen"
                  ? Math.round(promo.productPrice * (promo.discountValue / 100))
                  : promo.discountValue;

              return (
                <div key={promo.id} className="rounded-2xl bg-white p-5 ring-1 ring-cream shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        promo.status === "aktif"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {promo.status === "aktif" ? "✓ Sedang Berjalan" : "⏰ Dijadwalkan"}
                    </span>
                    <span className="text-xs text-ink/50">{promo.id}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-cream">
                      <ImageBox
                        src={
                          promo.productSlug.includes("keripik")
                            ? "/images/keripik-salak.jpg"
                            : "/images/selai-salak.jpg"
                        }
                        alt={promo.productName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-ink">{promo.name}</p>
                      <p className="text-xs text-ink/60">Produk: {promo.productName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <div className="text-ink/50">
                      <p className="text-xs">Harga Asli</p>
                      <p className="line-through">Rp {promo.productPrice.toLocaleString("id-ID")}</p>
                    </div>
                    <span className="text-ink/30">→</span>
                    <div>
                      <p className="text-xs text-red-600">
                        {promo.discountType === "persen"
                          ? `Diskon ${promo.discountValue}% (−Rp ${hemat.toLocaleString("id-ID")})`
                          : `Potongan ${rupiah(promo.discountValue)}`}
                      </p>
                      <p className="font-serif text-lg font-bold text-terracotta">
                        Rp {finalP.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-ink/50">
                    <Calendar size={11} />
                    {promo.startDate} s.d. {promo.endDate}
                  </div>

                  {promo.status === "aktif" ? (
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-ink/50 italic">
                        Kaidah: Tidak dapat dihapus saat aktif
                      </p>
                      <button className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 ring-1 ring-red-200 hover:bg-red-100 transition">
                        <X size={11} /> Nonaktifkan Promo
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-cream py-1.5 text-xs font-semibold text-ink/70 hover:bg-cream transition">
                        <Pencil size={11} /> Ubah Detail
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-red-50 py-1.5 text-xs font-semibold text-red-700 ring-1 ring-red-200 hover:bg-red-100 transition">
                        <X size={11} /> Batalkan Jadwal
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Form Buat Promo Baru */}
          <div className="rounded-2xl bg-white p-6 ring-1 ring-cream shadow-sm space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1 text-xs text-ink/60">
                  <span className="rounded-full bg-terracotta/10 px-2.5 py-0.5 font-bold text-terracotta">
                    ⊕ Buat Promo Diskon Baru (WPA-08)
                  </span>
                </div>
                <p className="text-sm text-ink/65">
                  Input diskon dengan validasi langsung terhadap database harga dan kalender promo aktif.
                </p>
              </div>
              {/* Simulasi Galat */}
              <div className="flex gap-1 text-xs">
                {["Galat A: Tumpang Tindih", "Galat B: Melebihi Harga", "Normal"].map((g, i) => (
                  <button
                    key={g}
                    className={`rounded-lg px-2.5 py-1 font-semibold ${
                      i === 2
                        ? "bg-terracotta text-white"
                        : "bg-cream text-ink/60 hover:bg-sand/40"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Nama Promo */}
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-ink/60">Nama Promo *</label>
                <input
                  value={promoForm.name}
                  onChange={(e) => setPromoForm({ ...promoForm, name: e.target.value })}
                  placeholder="Spesial Hari Belanja Gabugan Desaku"
                  className="mt-1 w-full rounded-xl bg-cream/50 px-4 py-2.5 text-sm outline-none ring-1 ring-cream focus:ring-terracotta"
                />
                <p className="mt-1 text-xs text-ink/50">
                  Gunakan nama yang memikat dan mencerminkan kearifan lokal.
                </p>
              </div>

              {/* Pilih Produk */}
              <div>
                <label className="text-xs font-semibold text-ink/60">Pilih Produk Sasaran *</label>
                <select
                  value={promoForm.productSlug}
                  onChange={(e) => setPromoForm({ ...promoForm, productSlug: e.target.value })}
                  className="mt-1 w-full rounded-xl bg-cream/50 px-4 py-2.5 text-sm outline-none ring-1 ring-cream focus:ring-terracotta"
                >
                  <option value="">— Pilih Produk —</option>
                  {myProducts.map((p) => (
                    <option key={p.slug} value={p.slug}>
                      {p.name} (Harga Asal: Rp {p.price.toLocaleString("id-ID")})
                    </option>
                  ))}
                </select>
              </div>

              {/* Jenis Potongan */}
              <div>
                <label className="text-xs font-semibold text-ink/60">Jenis Potongan Harga *</label>
                <div className="mt-1 flex gap-3">
                  {[
                    { v: "persen", label: "Persentase (%)" },
                    { v: "nominal", label: "Nominal Tunai (Rp)" },
                  ].map((opt) => (
                    <label key={opt.v} className="flex items-center gap-1.5 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="discountType"
                        value={opt.v}
                        checked={promoForm.discountType === opt.v}
                        onChange={() =>
                          setPromoForm({ ...promoForm, discountType: opt.v as "persen" | "nominal" })
                        }
                        className="accent-terracotta"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Nilai Diskon */}
              <div>
                <label className="text-xs font-semibold text-ink/60">
                  Nilai Diskon *{" "}
                  <span className="font-normal">
                    {promoForm.discountType === "persen" ? "Rentang sah: 1% s.d. 90%" : "Nominal (Rp)"}
                  </span>
                </label>
                <div className="mt-1 flex items-center gap-2 rounded-xl bg-cream/50 px-4 py-2.5 ring-1 ring-cream focus-within:ring-terracotta">
                  <input
                    type="number"
                    min={1}
                    max={promoForm.discountType === "persen" ? 90 : undefined}
                    value={promoForm.discountValue || ""}
                    onChange={(e) =>
                      setPromoForm({ ...promoForm, discountValue: Number(e.target.value) })
                    }
                    className="flex-1 bg-transparent text-sm outline-none"
                  />
                  <span className="text-sm text-ink/50">
                    {promoForm.discountType === "persen" ? "%" : "Rp"}
                  </span>
                </div>
              </div>

              {/* Preview harga */}
              {selectedProduct && promoForm.discountValue > 0 && (
                <div className="rounded-xl bg-terracotta/5 px-4 py-3 ring-1 ring-terracotta/20">
                  <p className="text-xs font-semibold text-ink/60">Pratinjau Harga Akhir</p>
                  <p className="text-sm text-ink/70 mt-0.5">
                    Dari Rp {selectedProduct.price.toLocaleString("id-ID")} menjadi:
                  </p>
                  <p className="font-serif text-xl font-bold text-terracotta">
                    Rp {finalPrice.toLocaleString("id-ID")}
                  </p>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                    Hemat Rp {(selectedProduct.price - finalPrice).toLocaleString("id-ID")}
                  </span>
                </div>
              )}

              {/* Tanggal Mulai */}
              <div>
                <label className="text-xs font-semibold text-ink/60">Tanggal &amp; Jam Mulai *</label>
                <input
                  type="date"
                  value={promoForm.startDate}
                  onChange={(e) => setPromoForm({ ...promoForm, startDate: e.target.value })}
                  className="mt-1 w-full rounded-xl bg-cream/50 px-4 py-2.5 text-sm outline-none ring-1 ring-cream focus:ring-terracotta"
                />
              </div>

              {/* Tanggal Selesai */}
              <div>
                <label className="text-xs font-semibold text-ink/60">Tanggal &amp; Jam Selesai *</label>
                <input
                  type="date"
                  value={promoForm.endDate}
                  onChange={(e) => setPromoForm({ ...promoForm, endDate: e.target.value })}
                  className="mt-1 w-full rounded-xl bg-cream/50 px-4 py-2.5 text-sm outline-none ring-1 ring-cream focus:ring-terracotta"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() =>
                  setPromoForm({
                    name: "",
                    productSlug: "",
                    discountType: "persen",
                    discountValue: 0,
                    startDate: "",
                    endDate: "",
                  })
                }
                className="flex items-center gap-1.5 rounded-xl border border-cream px-5 py-2.5 text-sm font-semibold text-ink/70 hover:bg-cream transition"
              >
                <RefreshCw size={14} /> Reset Form
              </button>
              <button
                onClick={() => {
                  if (!promoForm.name || !promoForm.productSlug || !promoForm.discountValue) return;
                  const newPromo: Promo = {
                    id: `PRM-NEW-${Date.now()}`,
                    name: promoForm.name,
                    productSlug: promoForm.productSlug,
                    productName: selectedProduct?.name ?? "",
                    productPrice: selectedProduct?.price ?? 0,
                    discountType: promoForm.discountType,
                    discountValue: promoForm.discountValue,
                    startDate: promoForm.startDate,
                    endDate: promoForm.endDate,
                    status: "dijadwalkan",
                  };
                  setPromos((p) => [...p, newPromo]);
                  setPromoForm({
                    name: "",
                    productSlug: "",
                    discountType: "persen",
                    discountValue: 0,
                    startDate: "",
                    endDate: "",
                  });
                }}
                className="flex-1 rounded-xl bg-terracotta py-2.5 text-sm font-bold text-white hover:bg-terracotta-dark transition"
              >
                Buat Promo Baru
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
