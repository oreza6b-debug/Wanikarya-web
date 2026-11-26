"use client";

import { useState } from "react";
import { getSession } from "@/lib/session";
import ImageBox from "@/components/ImageBox";
import {
  Save,
  Eye,
  Store,
  Phone,
  Share2,
  Camera,
  Truck,
  BadgeCheck,
  MapPin,
  Star,
} from "lucide-react";

type ModelUsaha = "produk" | "jasa" | "keduanya";

const narasiSections = [
  {
    num: 1,
    title: "Perkenalan Pawon & Pendiri",
    hint: "Tampil di pembuka profil",
    content:
      "Pawon Salak Lestari didirikan oleh Bu Sumarsih bersama 6 ibu rumah tangga di RT 03 Dusun Gabugan untuk mengolah salak basah panen raya menjadi camilan bernilai tambah tinggi dan membanggakan desa.",
  },
  {
    num: 2,
    title: "Latar Belakang & Momentum Kebangkitan",
    hint: "Kisah perjuangan awal",
    content:
      "Berawal dari kepedihan saat panen raya 2017 ketika harga salak anjlok drastis hingga Rp2.000/kg dan membusuk di pekarangan. Kami bertekad mengikuti pelatihan vacuum frying BUMDes, perjuangan membeli tahu...",
  },
  {
    num: 3,
    title: "Produk & Layanan Unggulan Pawon",
    hint: "Kekuatan ragam olahan",
    content:
      "Keripik salak vacuum frying renyah alami tanpa minyak berlebih, selai salak rempah beraroma kayu manis Menoreh, dodol salak legit pulen, dan paket wisata jelajah kebun salak interaktif untuk keluarga serta rombongan studi tur.",
  },
  {
    num: 4,
    title: "Keunikan & Integritas Bahan",
    hint: "Janji mutu pangan",
    content:
      "Murni 100% buah salak pondoh lereng Gunung Merapi segar yang dipetik pada puncak kematangan. Kami pantang memakai pengawet sintetik, pemanis buatan, ataupun perisa kimia tambahan. Semua bijirin dan bersertifikat P-IRT.",
  },
  {
    num: 5,
    title: "Dampak & Kontribusi untuk Komunitas Dusun",
    hint: "Pemberdayaan perempuan",
    content:
      "Secara aktif membuka nafkah mandiri bagi 6 ibu tetangga prasejahtera di Dusun Gabugan. Tiap penjualan kemasan menyisihkan 5% laba bersih untuk kas dasawisma perempuan dan subsidi pupuk organik bagi petani salak binaan desa.",
  },
];

export default function ProfilUsahaPage() {
  const session = getSession();
  const [modelUsaha, setModelUsaha] = useState<ModelUsaha>("keduanya");
  const [namaUsaha, setNamaUsaha] = useState("Pawon Salak Lestari");
  const [alamat, setAlamat] = useState(
    "RT 03 / RW 08 Dusun Gabugan, Donokerto, Turi, Sleman, D.I. Yogyakarta"
  );
  const [whatsapp, setWhatsapp] = useState("+62813-9281-7290");
  const [instagram, setInstagram] = useState("@pawonsalaklestari_gabu");
  const [ongkir, setOngkir] = useState(15000);
  const [dirty, setDirty] = useState(false);

  function markDirty() {
    setDirty(true);
  }

  return (
    <div className="flex gap-6">
      {/* Main Panel */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* Header */}
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-ink/60 mb-2">
            <span className="font-semibold text-terracotta">FR-WP-03</span>
            <span>• PENGATURAN GERAI</span>
            <span className="flex items-center gap-1 rounded-full bg-sage/20 px-2.5 py-0.5 font-semibold text-forest">
              <BadgeCheck size={11} /> Terverifikasi BUMDes
            </span>
          </div>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl font-bold text-ink">
                Profil Usaha &amp; Identitas Pawon
              </h1>
              <p className="mt-1 text-sm text-ink/65 max-w-xl">
                Informasi ini tampil pada halaman publik profil Anda di direktori Womanpreneur Desa
                Wisata Gabugan. Pastikan narasi menggambarkan keaslian rasa dan ketulusan karya
                ibu-ibu perajin.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button className="flex items-center gap-2 rounded-xl bg-cream px-4 py-2 text-sm font-semibold text-ink hover:bg-sand/40 transition">
                <Eye size={15} /> Lihat Tampilan Publik Profil Saya →
              </button>
              <button className="flex items-center justify-center gap-2 rounded-xl bg-terracotta px-4 py-2 text-sm font-bold text-white hover:bg-terracotta-dark transition">
                <Save size={15} /> Simpan Perubahan
              </button>
            </div>
          </div>
        </div>

        {/* 1. Informasi Pokok Usaha */}
        <div className="rounded-2xl bg-white p-5 ring-1 ring-cream shadow-sm space-y-5">
          <div>
            <h2 className="font-serif text-lg font-bold text-ink flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-terracotta text-white text-xs font-bold">
                1
              </span>
              Informasi Pokok Usaha
            </h2>
            <p className="mt-1 text-xs text-ink/60">
              Data legalitas gerai dan alamat produksi di lingkungan lereng Merapi.
            </p>
          </div>

          {/* Nama Usaha */}
          <div>
            <label className="text-xs font-semibold text-ink/60 flex justify-between">
              Nama Usaha / Merek Pawon
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-700">
                ✓ Nama Resmi Desa
              </span>
            </label>
            <div className="mt-1 flex items-center rounded-xl bg-cream/50 px-4 py-3 ring-1 ring-cream focus-within:ring-terracotta">
              <input
                value={namaUsaha}
                onChange={(e) => { setNamaUsaha(e.target.value); markDirty(); }}
                className="flex-1 bg-transparent text-sm font-semibold outline-none"
              />
              <span className="text-ink/40">✓</span>
            </div>
          </div>

          {/* Model Usaha */}
          <div>
            <label className="text-xs font-semibold text-ink/60">
              Model Usaha yang Dijalankan
            </label>
            <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
              {[
                {
                  v: "produk",
                  label: "Produk Kuliner Saja",
                  desc: "Hanya menjual makanan olahan kemasan",
                },
                {
                  v: "jasa",
                  label: "Jasa Wisata Edukasi",
                  desc: "Jelajah kebun salak & workshop olahan",
                },
                {
                  v: "keduanya",
                  label: "Keduanya: Produk & Wisata",
                  desc: "Kuliner kemasan serta tur pawon terbuka",
                  highlight: true,
                },
              ].map((opt) => (
                <button
                  key={opt.v}
                  onClick={() => { setModelUsaha(opt.v as ModelUsaha); markDirty(); }}
                  className={`rounded-xl p-3 text-left ring-1 transition ${
                    modelUsaha === opt.v
                      ? "bg-terracotta/10 ring-terracotta"
                      : "bg-cream/50 ring-cream hover:ring-terracotta/40"
                  }`}
                >
                  <p className={`font-semibold text-xs ${opt.highlight ? "flex items-center gap-1" : ""}`}>
                    {opt.label}
                    {opt.highlight && modelUsaha === opt.v && (
                      <span className="rounded-full bg-terracotta text-white px-1.5 py-0.5 text-[9px]">●</span>
                    )}
                  </p>
                  <p className="text-[11px] text-ink/60 mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Perubahan belum disimpan */}
          {dirty && (
            <div className="flex items-center justify-between gap-2 rounded-lg bg-amber-50 px-3 py-2 ring-1 ring-amber-200">
              <div className="flex items-center gap-2 text-xs text-amber-800">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Perubahan belum tersimpan di server desa.
              </div>
              <button className="text-xs font-semibold text-terracotta hover:underline">
                Lihat Tampilan Publik Profil Saya →
              </button>
            </div>
          )}

          {/* Alamat */}
          <div>
            <label className="text-xs font-semibold text-ink/60 flex justify-between">
              Alamat Dapur / Lokasi Titik Temu Gerai
              <span className="text-xs font-normal text-ink/50">Kec. Turi, Sleman</span>
            </label>
            <textarea
              rows={2}
              value={alamat}
              onChange={(e) => { setAlamat(e.target.value); markDirty(); }}
              className="mt-1 w-full rounded-xl bg-cream/50 px-4 py-3 text-sm outline-none ring-1 ring-cream focus:ring-terracotta resize-none"
            />
          </div>
        </div>

        {/* 2. Cerita & Narasi Usaha */}
        <div className="rounded-2xl bg-white p-5 ring-1 ring-cream shadow-sm space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="font-serif text-lg font-bold text-ink flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-terracotta text-white text-xs font-bold">
                  2
                </span>
                Cerita &amp; Narasi Usaha (5 Bagian)
              </h2>
              <p className="mt-1 text-xs text-ink/60">
                Panduan kurasi narasi otentik untuk memikat pembeli dan tamu homestay.
              </p>
            </div>
            <span className="rounded-full bg-cream px-2.5 py-1 text-xs font-semibold text-ink/60">
              Standar URS FR-WP-03
            </span>
          </div>

          <div className="space-y-3">
            {narasiSections.map((sec) => (
              <div key={sec.num} className="rounded-xl bg-cream/40 p-4 ring-1 ring-cream">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-terracotta text-white text-[10px] font-bold">
                      {sec.num}
                    </span>
                    <p className="font-semibold text-sm text-ink">{sec.title}</p>
                  </div>
                  <span className="text-xs text-ink/50">{sec.hint}</span>
                </div>
                <p className="text-xs text-ink/70 leading-relaxed line-clamp-3">
                  {sec.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Quote */}
        <div className="rounded-2xl bg-forest/95 p-6 text-white space-y-2">
          <p className="text-xs font-bold text-white/50 uppercase tracking-wider">
            Semangat Guyub Rukun • Desa Gabugan
          </p>
          <blockquote className="font-serif text-2xl font-bold leading-snug">
            &ldquo;Dari sebutir salak lereng Merapi, tercipta martabat dan kemandirian kaum ibu dusun.&rdquo;
          </blockquote>
          <div className="flex items-center gap-2 text-xs text-white/60 pt-2">
            <Star size={11} className="text-sand" />
            <span>Akun Aktif Sejak 2021</span>
          </div>
          <p className="text-xs text-white/60 leading-relaxed">
            Profil ini bukan sekadar katalog dagang, melainkan etalase perjuangan kolektif 7 keluarga di
            Dusun Gabugan. Terima kasih telah menyajikan cerita secara jujur dan bersahaja.
          </p>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-72 shrink-0 space-y-4">
        {/* 3. Ongkos Kirim */}
        <div className="rounded-2xl bg-white p-5 ring-1 ring-cream shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-ink flex items-center gap-2">
              <span className="text-terracotta">
                <Truck size={16} />
              </span>
              3. Ongkos Kirim
            </h3>
            <span className="rounded-full bg-cream px-2.5 py-0.5 text-xs font-bold text-ink/60">
              SKN-06
            </span>
          </div>
          <div className="rounded-xl bg-cream/50 p-3 ring-1 ring-cream">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-ink/70">KEBIJAKAN FLAT ONGKIR</span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-700 text-[10px]">
                Aktif di Kasir
              </span>
            </div>
            <p className="font-serif text-2xl font-bold text-terracotta">
              Rp {ongkir.toLocaleString("id-ID")}
            </p>
            <p className="text-xs text-ink/60 mt-1 leading-relaxed">
              Tarif pengiriman tetap untuk seluruh titik di D.I. Yogyakarta &amp; Sleman via armada
              kurir BUMDes Gabugan.
            </p>
          </div>
          <div>
            <label className="text-xs font-semibold text-ink/60">Atur Ulang Nominal Ongkir Toko (Rp)</label>
            <input
              type="number"
              value={ongkir}
              onChange={(e) => { setOngkir(Number(e.target.value)); markDirty(); }}
              className="mt-1 w-full rounded-xl bg-cream/50 px-4 py-2.5 text-sm font-bold outline-none ring-1 ring-cream focus:ring-terracotta"
            />
          </div>
          <div className="rounded-lg bg-cream/60 p-3 text-xs text-ink/65 leading-relaxed">
            <p className="font-semibold text-ink mb-1">Keranjang</p>
            Biaya flat ini akan otomatis ditambahkan{" "}
            <strong>tepat satu kali</strong> per pesanan, terlepas dari berapa banyak jenis keripik
            maupun dodol yang dipesan oleh pelanggan.
          </div>
          <div className="flex items-center gap-2 text-xs text-ink/60">
            <MapPin size={11} className="text-terracotta shrink-0" />
            Armada Pos BUMDes Dono • Pick-up harian pukul 14:00
          </div>
          <button className="w-full rounded-xl bg-terracotta py-2.5 text-sm font-bold text-white hover:bg-terracotta-dark transition">
            <Save size={14} className="inline mr-1.5" />
            Simpan Perubahan Profil Usaha
          </button>
        </div>

        {/* 4. Kontak & Media */}
        <div className="rounded-2xl bg-white p-5 ring-1 ring-cream shadow-sm space-y-3">
          <h3 className="font-serif font-bold text-ink flex items-center gap-2">
            <span className="text-terracotta">🔔</span>
            4. Kontak &amp; Media
          </h3>
          <div>
            <label className="text-xs font-semibold text-ink/60">WhatsApp Layanan Pesanan</label>
            <div className="mt-1 flex items-center gap-2 rounded-xl bg-cream/50 px-3 py-2.5 ring-1 ring-cream">
              <Phone size={13} className="text-ink/40" />
              <input
                value={whatsapp}
                onChange={(e) => { setWhatsapp(e.target.value); markDirty(); }}
                className="flex-1 bg-transparent text-sm outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-ink/60">Akun Instagram / Media Sosial</label>
            <div className="mt-1 flex items-center gap-2 rounded-xl bg-cream/50 px-3 py-2.5 ring-1 ring-cream">
              <Share2 size={13} className="text-ink/40" />
              <input
                value={instagram}
                onChange={(e) => { setInstagram(e.target.value); markDirty(); }}
                className="flex-1 bg-transparent text-sm outline-none"
              />
            </div>
          </div>

          {/* Galeri */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-ink/60">
                Dokumentasi Foto Dapur &amp; Tim
              </label>
              <span className="text-xs text-ink/50">3 Terunggah</span>
            </div>
            <div className="flex gap-2">
              {[
                { src: "/images/bu-sumarsih.jpg", label: "Profil" },
                { src: "/images/jasa-kebun-salak.jpg", label: "Dapur" },
                { src: "/images/jasa-batik.jpg", label: "Kebun" },
              ].map((img) => (
                <div key={img.src} className="relative h-16 w-16 overflow-hidden rounded-lg">
                  <ImageBox src={img.src} alt={img.label} className="h-full w-full object-cover" />
                  <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-center text-[9px] text-white py-0.5">
                    {img.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <button className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-cream py-2 text-xs font-semibold text-ink/70 hover:bg-cream transition">
            <Camera size={13} /> Kelola Galeri Foto Usaha
          </button>
        </div>
      </div>
    </div>
  );
}
