"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  Copy,
  Check,
  Clock,
  Package,
  ShieldCheck,
  Heart,
  MessageCircle,
  Truck,
  MapPin,
  Receipt,
  Store,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Barcode,
  ExternalLink,
} from "lucide-react";
import RoleGuard from "@/components/RoleGuard";
import OrderTracker from "@/components/OrderTracker";
import { useOrders } from "@/components/OrdersProvider";
import { useSession } from "@/components/AuthProvider";
import {
  RESPONSE_MS,
  AUTO_DONE_MS,
  addMs,
  fmtDate,
  subtotal,
  total,
  type Order,
  type OrderStatus,
} from "@/lib/orders";
import { rupiah } from "@/lib/format";
import ImageBox from "@/components/ImageBox";

const WA_CONTACT = "6281234567890";

function Content({ kode }: { kode: string }) {
  const { orders, batalkan, konfirmasiDiterima, terima, tolak, kirim } = useOrders();
  const { session } = useSession();
  const o = orders.find((ord) => ord.kode === kode);

  const [copied, setCopied] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedEkspedisi, setSelectedEkspedisi] = useState("J&T Express");
  const [inputResi, setInputResi] = useState("");
  const [confirmPacking, setConfirmPacking] = useState(false);
  const [resiError, setResiError] = useState("");

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!o) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cream text-terracotta">
          <AlertCircle size={32} />
        </div>
        <h1 className="mt-4 font-serif text-2xl font-bold text-ink">Pesanan Tidak Ditemukan</h1>
        <p className="mt-2 text-xs text-ink/70">Kode pesanan #{kode} tidak ditemukan dalam sistem.</p>
        <Link
          href="/pesanan"
          className="mt-6 inline-block rounded-xl bg-terracotta px-5 py-2.5 text-xs font-semibold text-white hover:bg-terracotta-dark"
        >
          Kembali ke Pembelian Saya
        </Link>
      </section>
    );
  }

  // Determine viewer perspective
  const isSeller = session?.storeSlug === o.storeSlug && session?.role === "womanpreneur";
  const isBuyer = !isSeller;

  const batasRespons = fmtDate(addMs(o.createdAt, RESPONSE_MS));
  const batasAutoDone = fmtDate(addMs(o.createdAt, AUTO_DONE_MS));
  const subtotalVal = subtotal(o);
  const totalVal = total(o);

  return (
    <div className="bg-paper min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-ink/65">
          <Link href="/" className="hover:text-terracotta">Beranda</Link>
          <span>&gt;</span>
          {isSeller ? (
            <>
              <Link href="/usaha/pesanan" className="hover:text-terracotta">Mode Usaha</Link>
              <span>&gt;</span>
              <Link href="/usaha/pesanan" className="hover:text-terracotta">Pesanan Masuk</Link>
            </>
          ) : (
            <>
              <Link href="/pesanan" className="hover:text-terracotta">Akun Saya</Link>
              <span>&gt;</span>
              <Link href="/pesanan" className="hover:text-terracotta">Riwayat Pembelian Saya</Link>
            </>
          )}
          <span>&gt;</span>
          <span className="font-semibold text-ink">Detail Pesanan #{o.kode}</span>
        </nav>

        {/* Header Badges & Order Title */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-cream px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-terracotta">
              ORDER DETAIL
            </span>
            <StatusPill status={o.status} isSeller={isSeller} />
            {o.resi && (
              <span className="rounded-full bg-sky-100 px-3 py-0.5 text-[11px] font-bold text-sky-800">
                Kode Resi: {o.resi}
              </span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink">
              #{o.kode}
            </h1>
            <button
              onClick={() => handleCopy(o.kode)}
              className="flex items-center gap-1 rounded-xl bg-cream/70 px-2.5 py-1 text-xs font-semibold text-ink hover:bg-cream"
            >
              {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
              {copied ? "Tersalin" : "Salin"}
            </button>
          </div>

          <p className="mt-1 text-xs text-ink/65">
            Dipesan pada {fmtDate(o.createdAt)} • {o.storeName}
          </p>
        </div>

        {/* Top Contextual Alert Banners */}
        {o.status === "dibayarkan" && (
          <div className="flex items-start justify-between gap-4 rounded-3xl bg-amber-50/90 p-5 ring-1 ring-amber-200 text-amber-900 shadow-xs">
            <div className="flex items-start gap-3.5">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-200/60 text-amber-900">
                <Clock size={20} />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold">
                  {isSeller ? "Konfirmasi Penerimaan Diperlukan" : "Menunggu Konfirmasi Penjual (Batas Waktu 2×24 Jam)"}
                </h3>
                <p className="mt-1 text-xs text-amber-900/80 leading-relaxed max-w-2xl">
                  {isSeller
                    ? `Batas respons konfirmasi: ${batasRespons} (Maksimal 2x24 jam). Pesanan akan dibatalkan otomatis oleh sistem jika tidak direspons.`
                    : `Penjual (${o.storeName}) memiliki waktu hingga ${batasRespons} untuk menerima pesanan. Jika melewati batas waktu, pesanan akan dibatalkan otomatis oleh sistem dan pembayaran simulasi dikembalikan.`}
                </p>
              </div>
            </div>
            <span className="shrink-0 rounded-xl bg-amber-200/70 px-3 py-1.5 text-xs font-bold text-amber-900">
              Sisa Waktu: 41 Jam 25 Menit
            </span>
          </div>
        )}

        {o.status === "dikemas" && (
          <div className="flex items-start gap-3.5 rounded-3xl bg-sage/20 p-5 ring-1 ring-sage/30 text-forest shadow-xs">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sage/30 text-forest">
              <Package size={20} />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold">
                {isSeller ? "Pesanan Sedang Anda Kemas" : "Pesanan Sedang Disiapkan Penjual"}
              </h3>
              <p className="mt-1 text-xs text-forest/85 leading-relaxed">
                {isSeller
                  ? "Siapkan pesanan menggunakan kemasan besek bambu ramah lingkungan, lalu isi nomor resi ekspedisi untuk memperbarui status pesanan."
                  : `Ibu pengrajin (${o.storeName}) telah menerima pesanan Anda dan sedang mengemas produk menggunakan besek anyaman bambu ramah lingkungan.`}
              </p>
            </div>
          </div>
        )}

        {o.status === "dikirim" && (
          <div className="rounded-3xl bg-forest p-5 text-white shadow-sm ring-1 ring-forest/30 flex items-start gap-3.5">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-sand">
                PERLINDUNGAN TRANSAKSI WANIKARYA (SLA SKN-12)
              </p>
              <p className="mt-1 text-xs text-white/90 leading-relaxed max-w-2xl">
                Pesanan akan otomatis selesai dalam 5 hari ({batasAutoDone}) jika tidak ada konfirmasi penerimaan dari pembeli. Dana akan diteruskan ke kas UMKM {o.storeName}.
              </p>
            </div>
          </div>
        )}

        {o.status === "selesai" && (
          <div className="rounded-3xl bg-[#3f4a36] p-5 text-white shadow-sm ring-1 ring-white/10 flex items-start gap-3.5">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 text-sand">
              <Heart size={20} className="fill-current" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-sand">
                DAMPAK PEMBERDAYAAN DESA WISATA GABUGAN • Selesai pada {fmtDate(o.createdAt)}
              </p>
              <p className="mt-1 text-xs text-white/90 leading-relaxed max-w-2xl">
                Terima kasih telah mendukung kemandirian ekonomi perempuan perajin Desa Wisata Gabugan! Pendapatan bersih produk sebesar {rupiah(subtotalVal)} telah tercatat otomatis pada buku kas usaha {o.storeName}.
              </p>
            </div>
          </div>
        )}

        {o.status === "dibatalkan" && (
          <div className="rounded-3xl bg-red-50 p-5 ring-1 ring-red-200 text-red-900 flex items-start gap-3.5">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-200 text-red-800">
              <AlertCircle size={20} />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold">Pesanan Dibatalkan</h3>
              <p className="mt-1 text-xs text-red-800">
                {o.cancelReason ? `Alasan: ${o.cancelReason}` : "Pesanan ini telah dibatalkan."}
              </p>
              <p className="mt-1 text-[11px] text-red-600/80">
                Stok dikembalikan ke etalase toko dan pembayaran simulasi telah ditandai &ldquo;dikembalikan&rdquo;.
              </p>
            </div>
          </div>
        )}

        {/* 4-Step Tracker Timeline */}
        <OrderTracker order={o} />

        {/* Action Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl bg-white p-5 shadow-xs ring-1 ring-cream">
          <div className="text-xs text-ink/75 max-w-md">
            {isBuyer && (
              <>
                {o.status === "dibayarkan" && "Perlu bantuan atau ingin membatalkan pesanan ini sebelum dikemas?"}
                {o.status === "dikemas" && "Butuh konfirmasi atau koordinasi pesanan? Hubungi Ibu pengrajin langsung."}
                {o.status === "dikirim" && "Barang sudah sampai dengan selamat dan sesuai? Silakan konfirmasi penerimaan."}
                {o.status === "selesai" && "Transaksi telah tuntas. Suka dengan produk ini? Pesan kembali dengan mudah."}
                {o.status === "dibatalkan" && "Dana simulasi telah otomatis dikembalikan ke saldo dompet Anda."}
              </>
            )}
            {isSeller && (
              <>
                {o.status === "dibayarkan" && "Keputusan pemrosesan: Pastikan ketersediaan stok bahan baku sebelum menerima pesanan."}
                {o.status === "dikemas" && "Kemasi pesanan dengan anyaman besek bambu dan tempelkan label pengiriman."}
                {o.status === "dikirim" && "Paket sedang dalam perjalanan bersama kurir. Menunggu konfirmasi pembeli."}
                {o.status === "selesai" && "Pesanan selesai dan pendapatan telah masuk ke buku kas usaha."}
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-end sm:self-auto">
            {/* BUYER ACTIONS */}
            {isBuyer && (
              <>
                {o.status === "dibayarkan" && (
                  <button
                    type="button"
                    onClick={() => window.confirm("Batalkan pesanan ini?") && batalkan(o.kode)}
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                  >
                    Batalkan Pesanan
                  </button>
                )}

                {o.status === "dikirim" && (
                  <button
                    type="button"
                    onClick={() => konfirmasiDiterima(o.kode)}
                    className="flex items-center gap-1.5 rounded-xl bg-forest px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-forest/90"
                  >
                    <CheckCircle2 size={15} /> Konfirmasi Pesanan Diterima
                  </button>
                )}

                {o.status === "selesai" && (
                  <Link
                    href="/her-market"
                    className="flex items-center gap-1.5 rounded-xl bg-terracotta px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-terracotta-dark"
                  >
                    <RotateCcw size={14} /> Beli Lagi
                  </Link>
                )}

                <a
                  href={`https://wa.me/${WA_CONTACT}?text=${encodeURIComponent(`Halo, terkait pesanan ${o.kode}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-xl bg-[#3f4a36] px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-forest"
                >
                  <MessageCircle size={15} /> Hubungi Penjual (WhatsApp)
                </a>
              </>
            )}

            {/* SELLER ACTIONS */}
            {isSeller && (
              <div className="ml-auto flex flex-wrap items-center justify-end gap-2.5">
                <a
                  href={`https://wa.me/${WA_CONTACT}?text=${encodeURIComponent(`Halo, terkait pesanan ${o.kode}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-xl border border-cream bg-white px-4 py-2.5 text-xs font-semibold text-ink hover:bg-cream"
                >
                  <MessageCircle size={15} className="text-forest" /> Hubungi Pembeli (WhatsApp)
                </a>

                {o.status === "dibayarkan" && !rejecting && (
                  <>
                    <button
                      type="button"
                      onClick={() => setRejecting(true)}
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors"
                    >
                      Tolak Pesanan
                    </button>
                    <button
                      type="button"
                      onClick={() => terima(o.kode)}
                      className="rounded-xl bg-terracotta px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-terracotta-dark transition-colors"
                    >
                      Terima Pesanan (Mulai Mengemas)
                    </button>
                  </>
                )}

                {o.status === "dibayarkan" && rejecting && (
                  <div className="flex flex-col gap-2 w-full max-w-md">
                    <input
                      type="text"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Tulis alasan penolakan (misal: Stok habis)..."
                      className="rounded-xl bg-white px-3 py-2 text-xs ring-1 ring-cream outline-none"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setRejecting(false)}
                        className="rounded-xl bg-cream px-3 py-1.5 text-xs font-semibold text-ink"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={() => rejectReason.trim() && tolak(o.kode, rejectReason.trim())}
                        className="rounded-xl bg-red-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                      >
                        Konfirmasi Penolakan
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Seller In-line Shipment Input Form for 'dikemas' */}
        {isSeller && o.status === "dikemas" && (
          <div className="rounded-3xl bg-white p-6 shadow-xs ring-1 ring-cream space-y-4">
            <div className="border-b border-cream pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-ink">Input Resi &amp; Kirim Pesanan</h3>
                <p className="text-xs text-ink/65 mt-0.5">
                  Langkah wajib untuk memperbarui status pesanan menjadi Dikirim.
                </p>
              </div>
              <span className="rounded-full bg-cream px-3 py-1 text-xs font-semibold text-terracotta">
                Tahap 2 dari 4
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">Mitra Ekspedisi Desa *</label>
                <select
                  value={selectedEkspedisi}
                  onChange={(e) => setSelectedEkspedisi(e.target.value)}
                  className="w-full rounded-xl bg-white px-3 py-2 text-xs ring-1 ring-cream outline-none focus:ring-2 focus:ring-terracotta"
                >
                  <option value="J&T Express">J&amp;T Express - Layanan Reguler Desa</option>
                  <option value="Kurir BUMDes Gabugan">Kurir BUMDes Gabugan (Antar Desa)</option>
                  <option value="JNE">JNE Reguler</option>
                  <option value="SiCepat">SiCepat Ekspres</option>
                  <option value="POS Indonesia">POS Indonesia</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">Nomor Resi / Waybill *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={inputResi}
                    onChange={(e) => {
                      setInputResi(e.target.value);
                      setResiError("");
                    }}
                    placeholder="Contoh: JT9928172019"
                    className="w-full rounded-xl bg-white px-3 py-2 text-xs ring-1 ring-cream outline-none focus:ring-2 focus:ring-terracotta pr-9"
                  />
                  <Barcode size={18} className="absolute right-3 top-2.5 text-ink/40" />
                </div>
                {resiError && <p className="text-[11px] text-red-600 mt-1">{resiError}</p>}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-cream/70 pt-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-ink/80 max-w-md">
                <input
                  type="checkbox"
                  checked={confirmPacking}
                  onChange={(e) => setConfirmPacking(e.target.checked)}
                  className="rounded border-cream text-terracotta focus:ring-terracotta shrink-0"
                />
                <span>Saya telah memastikan kemasan besek anyaman bambu terbungkus kokoh dan siap diserahkan ke kurir.</span>
              </label>

              <div className="flex justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (!inputResi.trim()) {
                      setResiError("Nomor resi wajib diisi.");
                      return;
                    }
                    if (!confirmPacking) {
                      setResiError("Harap centang konfirmasi pengemasan terlebih dahulu.");
                      return;
                    }
                    kirim(o.kode, selectedEkspedisi, inputResi.trim());
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl bg-terracotta px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-terracotta-dark transition-colors"
                >
                  <Truck size={15} /> Konfirmasi &amp; Serahkan ke Kurir
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2-Column Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* LEFT COLUMN: Logistics & Store Products */}
          <div className="space-y-6">
            {/* 1. Logistics Card */}
            <div className="rounded-3xl bg-white p-6 shadow-xs ring-1 ring-cream space-y-4">
              <div className="flex items-center justify-between border-b border-cream/70 pb-3">
                <div className="flex items-center gap-2">
                  <Truck size={18} className="text-terracotta" />
                  <h3 className="font-serif text-base font-bold text-ink">
                    {o.status === "dibayarkan"
                      ? "Status Logistik & Pengiriman"
                      : o.status === "dikemas"
                      ? "Status Persiapan & Pengemasan"
                      : o.status === "dikirim"
                      ? "Pelacakan Logistik Ekspedisi"
                      : "Bukti Serah Terima & Riwayat Pengiriman"}
                  </h3>
                </div>
                <span
                  className={`rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    o.status === "selesai"
                      ? "bg-emerald-100 text-emerald-800"
                      : o.status === "dikirim"
                      ? "bg-sky-100 text-sky-800"
                      : "bg-cream text-ink/70"
                  }`}
                >
                  {o.status === "selesai"
                    ? "Terkirim"
                    : o.status === "dikirim"
                    ? `Resi: ${o.resi || "JT9928172019"}`
                    : o.status === "dikemas"
                    ? "Resi Menunggu"
                    : "Belum Dikirim"}
                </span>
              </div>

              {o.status === "dibayarkan" && (
                <div className="space-y-3">
                  <div className="rounded-2xl bg-cream/40 p-4 text-xs text-ink/80 leading-relaxed">
                    Nomor resi akan diterbitkan setelah penjual mengemas dan menyerahkan paket ke ekspedisi J&amp;T Express – Layanan Reguler Desa.
                  </div>
                  <div className="rounded-2xl border border-cream/80 bg-paper p-4">
                    <p className="text-[11px] font-bold text-ink/60 uppercase">Titik Asal Pengiriman</p>
                    <p className="font-semibold text-xs text-ink mt-0.5">Dusun Gabugan, Turi, Sleman, D.I. Yogyakarta</p>
                    <div className="mt-2 flex items-center gap-2 rounded-xl bg-white p-2 text-xs text-ink/70 ring-1 ring-cream">
                      <MapPin size={14} className="text-terracotta shrink-0" />
                      <span>Rute: Sleman Utara → Tujuan ({o.address.split(",")[0] || "Alamat Pembeli"})</span>
                    </div>
                  </div>
                </div>
              )}

              {o.status === "dikemas" && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between text-ink/80">
                    <span className="text-ink/60">Ekspedisi Terpilih</span>
                    <span className="font-bold">{o.ekspedisi || "J&T Express – Layanan Reguler Desa"}</span>
                  </div>
                  <div className="rounded-2xl bg-amber-50/70 p-4 ring-1 ring-amber-200/60 text-amber-900 leading-relaxed">
                    <strong>Estimasi penyerahan ke kurir:</strong> Hari ini paling lambat pukul 17.00 WIB. Nomor resi pengiriman akan muncul otomatis setelah paket diambil kurir desa.
                  </div>
                </div>
              )}

              {(o.status === "dikirim" || o.status === "selesai") && (
                <div className="space-y-4">
                  {o.status === "selesai" && (
                    <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-3.5 ring-1 ring-emerald-200 text-xs text-emerald-900">
                      <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                      <div>
                        <strong>Paket Diterima oleh {o.buyerName} (Ybs)</strong>
                        <p className="text-[11px] text-emerald-800/80 mt-0.5">{fmtDate(o.createdAt)} • Sleman</p>
                      </div>
                    </div>
                  )}

                  <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-cream">
                    <div className="relative">
                      <span className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-forest ring-4 ring-forest/20" />
                      <p className="text-[10px] font-bold text-terracotta uppercase">TERBARU • Hari Ini, 08:30 WIB</p>
                      <p className="text-xs font-bold text-ink">Paket Dibawa Kurir Menuju Alamat Tujuan</p>
                      <p className="text-[11px] text-ink/60 mt-0.5">Kurir sedang dalam perjalanan menuju alamat. Pastikan nomor telepon aktif.</p>
                    </div>

                    <div className="relative">
                      <span className="absolute -left-6 top-1 h-2.5 w-2.5 rounded-full bg-sage" />
                      <p className="text-[10px] text-ink/50">Kemarin, 19:40 WIB</p>
                      <p className="text-xs font-semibold text-ink">Tiba di Drop Point DC Sleman Turi</p>
                    </div>

                    <div className="relative">
                      <span className="absolute -left-6 top-1 h-2.5 w-2.5 rounded-full bg-sage" />
                      <p className="text-[10px] text-ink/50">22 Nov 2026, 14:15 WIB</p>
                      <p className="text-xs font-semibold text-ink">Diserahkan oleh Penjual {o.storeName}</p>
                    </div>

                    <div className="relative">
                      <span className="absolute -left-6 top-1 h-2.5 w-2.5 rounded-full bg-cream" />
                      <p className="text-[10px] text-ink/50">22 Nov 2026, 09:30 WIB</p>
                      <p className="text-xs font-medium text-ink/70">Resi Pengiriman Dicetak</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Store & Ordered Products Card */}
            <div className="rounded-3xl bg-white p-6 shadow-xs ring-1 ring-cream space-y-4">
              <div className="flex items-center justify-between border-b border-cream/70 pb-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-terracotta/10 text-terracotta">
                    <Store size={20} />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-ink">{o.storeName}</h3>
                    <p className="text-xs text-ink/60">Ibu Pengrajin • Dusun Gabugan, Turi, Sleman</p>
                  </div>
                </div>
                <Link
                  href="/her-market"
                  className="rounded-xl bg-cream px-3 py-1.5 text-xs font-semibold text-terracotta hover:bg-sand/40"
                >
                  Kunjungi Toko →
                </Link>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {o.items.map((item) => {
                  const itemImg =
                    item.name.toLowerCase().includes("batik") || item.name.toLowerCase().includes("syal")
                      ? "/images/batik-1.jpg"
                      : item.name.toLowerCase().includes("anyam") || item.name.toLowerCase().includes("keranjang")
                      ? "/images/anyaman-1.jpg"
                      : item.name.toLowerCase().includes("sirup")
                      ? "/images/sirup-salak.jpg"
                      : "/images/keripik-salak.jpg";

                  return (
                    <div
                      key={item.name}
                      className="flex items-center gap-4 rounded-2xl bg-paper p-3.5 ring-1 ring-cream"
                    >
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-cream">
                        <ImageBox src={itemImg} alt={item.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif text-sm font-bold text-ink line-clamp-1">{item.name}</h4>
                        <p className="text-xs text-ink/65 mt-0.5">
                          {item.qty} Paket × {rupiah(item.price)}
                          {item.normalPrice && item.normalPrice > item.price && (
                            <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700">
                              Diskon Promo
                            </span>
                          )}
                        </p>
                      </div>
                      <span className="font-serif text-sm font-bold text-terracotta shrink-0">
                        {rupiah(item.price * item.qty)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-baseline justify-between border-t border-cream/70 pt-3 text-sm">
                <span className="text-xs text-ink/70">Subtotal Produk ({o.items.length} Item)</span>
                <span className="font-serif text-lg font-bold text-ink">{rupiah(subtotalVal)}</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Address & Payment Details */}
          <div className="space-y-6">
            {/* Address Card */}
            <div className="rounded-3xl bg-white p-6 shadow-xs ring-1 ring-cream space-y-3">
              <div className="flex items-center gap-2 border-b border-cream/70 pb-3">
                <MapPin size={18} className="text-terracotta" />
                <h3 className="font-serif text-base font-bold text-ink">Alamat Pengiriman</h3>
              </div>

              <div className="text-xs space-y-1">
                <p className="font-bold text-sm text-ink">{o.buyerName}</p>
                <p className="text-ink/65">{o.buyerPhone}</p>
                <p className="text-ink/80 leading-relaxed pt-1">{o.address}</p>
              </div>

              {/* Note for Seller */}
              <div className="rounded-2xl bg-cream/50 p-4 ring-1 ring-cream text-xs">
                <span className="font-bold text-[10px] uppercase tracking-wider text-terracotta block mb-1">
                  CATATAN UNTUK PENJUAL
                </span>
                <p className="text-ink/75 italic">
                  &ldquo;Mohon dilapisi besek anyaman bambu yang rapi untuk oleh-oleh keluarga. Terima kasih Bu Sumarsih.&rdquo;
                </p>
              </div>
            </div>

            {/* Payment Summary Card */}
            <div className="rounded-3xl bg-white p-6 shadow-xs ring-1 ring-cream space-y-4">
              <div className="flex items-center justify-between border-b border-cream/70 pb-3">
                <div className="flex items-center gap-2">
                  <Receipt size={18} className="text-terracotta" />
                  <h3 className="font-serif text-base font-bold text-ink">Rincian Pembayaran</h3>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-[10px] font-bold text-emerald-800">
                  Lunas – Mode Demo
                </span>
              </div>

              {/* Payment Method Badge */}
              <div className="flex items-center justify-between rounded-2xl bg-cream/50 p-3.5 text-xs ring-1 ring-cream">
                <div>
                  <p className="text-[10px] uppercase font-bold text-ink/50">Metode Pembayaran</p>
                  <p className="font-semibold text-ink mt-0.5">Simulasi Kas Desa QRIS (Terverifikasi)</p>
                </div>
                <CheckCircle2 size={18} className="text-emerald-600" />
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-2 text-xs text-ink/80">
                <div className="flex justify-between">
                  <span>Total Harga Produk</span>
                  <span>{rupiah(subtotalVal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Ongkos Kirim (Flat Sleman)</span>
                  <span>{rupiah(o.shipping || 15000)}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Diskon Promo Panen Salak</span>
                  <span>-Rp5.000</span>
                </div>
                <div className="flex items-baseline justify-between border-t border-cream/70 pt-3 text-sm">
                  <span className="font-serif font-bold text-ink">Total Pembayaran</span>
                  <span className="font-serif text-2xl font-bold text-terracotta">{rupiah(totalVal)}</span>
                </div>
              </div>

              {/* Demo Mode Disclaimer */}
              <p className="rounded-xl bg-paper p-3 text-[10px] text-ink/60 leading-relaxed ring-1 ring-cream/80">
                <strong>Catatan Mode Demo WaniKarya:</strong> Transaksi ini merupakan simulasi ekosistem digital Desa Wisata Gabugan. Tidak ada dana riil yang didebit dari rekening perbankan Anda.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status, isSeller }: { status: OrderStatus; isSeller?: boolean }) {
  switch (status) {
    case "dibayarkan":
      return (
        <span className="rounded-full bg-amber-100 px-3 py-0.5 text-[11px] font-bold text-amber-800">
          • {isSeller ? "Perlu Diproses (Dibayarkan)" : "Dibayarkan (Menunggu Konfirmasi Penjual)"}
        </span>
      );
    case "dikemas":
      return (
        <span className="rounded-full bg-stone-200 px-3 py-0.5 text-[11px] font-bold text-stone-800">
          • Sedang Dikemas
        </span>
      );
    case "dikirim":
      return (
        <span className="rounded-full bg-sky-100 px-3 py-0.5 text-[11px] font-bold text-sky-800">
          • Sedang Dikirim (In Transit)
        </span>
      );
    case "selesai":
      return (
        <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-[11px] font-bold text-emerald-800">
          • Pesanan Selesai
        </span>
      );
    case "dibatalkan":
      return (
        <span className="rounded-full bg-red-100 px-3 py-0.5 text-[11px] font-bold text-red-700">
          • Dibatalkan
        </span>
      );
  }
}

export default function OrderDetailPage({ params }: { params: Promise<{ kode: string }> }) {
  const { kode } = use(params);
  return (
    <RoleGuard allow={["buyer", "womanpreneur", "admin"]}>
      <Content kode={kode} />
    </RoleGuard>
  );
}
