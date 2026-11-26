"use client";

import { useState } from "react";
import { products as allProducts, categories } from "@/lib/data";
import { useSession } from "@/components/AuthProvider";
import { rupiah } from "@/lib/format";
import ImageBox from "@/components/ImageBox";
import {
  Plus,
  Pencil,
  RefreshCw,
  Settings2,
  ArrowUpDown,
  X,
  Search,
  Package,
  Percent,
  AlertTriangle,
  ToggleRight,
} from "lucide-react";

type Product = (typeof allProducts)[number];

function getProductImage(p: Product) {
  if (p.image) return p.image;
  if (p.name.toLowerCase().includes("keripik")) return "/images/keripik-salak.jpg";
  if (p.name.toLowerCase().includes("selai")) return "/images/selai-salak.jpg";
  if (p.name.toLowerCase().includes("dodol")) return "/images/dodol-salak.jpg";
  if (p.name.toLowerCase().includes("sirup")) return "/images/sirup-salak.jpg";
  return "/images/keripik-salak.jpg";
}

export default function ProdukPage() {
  const { session } = useSession();
  const myProducts = allProducts.filter((p) => p.storeSlug === session?.storeSlug);

  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});

  // Local state to track changes (tidak persisten, hanya untuk demo)
  const [localProducts, setLocalProducts] = useState<Product[]>(myProducts);

  const filtered = localProducts.filter(
    (p) =>
      !q.trim() ||
      p.name.toLowerCase().includes(q.toLowerCase()) ||
      p.slug.toLowerCase().includes(q.toLowerCase())
  );

  const totalVarian = localProducts.length;
  const statusAktif = localProducts.filter((p) => p.stock > 0).length;
  const perlurRestock = localProducts.filter((p) => p.stock === 0).length;
  const sedangPromo = localProducts.filter((p) => (p.promoPercent ?? 0) > 0).length;
  const totalStok = localProducts.reduce((s, p) => s + p.stock, 0);

  function openEditor(p: Product) {
    setEditing(p);
    setEditForm({ ...p });
  }
  function closeEditor() {
    setEditing(null);
    setEditForm({});
  }
  function saveEdit() {
    setLocalProducts((prev) =>
      prev.map((p) =>
        p.slug === editing?.slug ? { ...p, ...editForm } as Product : p
      )
    );
    closeEditor();
  }

  const categoryName = (slug: string) =>
    categories.find((c) => c.slug === slug)?.name ?? "Lainnya";

  return (
    <div className="flex gap-6">
      {/* Main Panel */}
      <div className="flex-1 min-w-0 space-y-5">
        {/* Header */}
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-ink/60 mb-2">
            <span className="font-semibold text-terracotta">PAWON SALAK LESTARI</span>
            <span>• INVENTARIS TOKO</span>
            <span>• Sleman, DI Yogyakarta</span>
          </div>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl font-bold text-ink">
                Katalog Produk Toko
              </h1>
              <p className="mt-1 text-sm text-ink/65">
                Kelola ketersediaan stok, harga, promo, dan varian olahan salak
                Pawon Salak Lestari secara terpusat.
              </p>
            </div>
            <div className="rounded-xl bg-cream p-3 text-right">
              <p className="text-xs text-ink/60">TOTAL VARIAN</p>
              <p className="font-serif text-2xl font-bold text-ink">{totalVarian} Produk</p>
              <p className="text-xs font-semibold text-terracotta mt-0.5">
                STATUS SIAP JUAL: {statusAktif} Aktif
              </p>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl bg-white px-4 py-3 ring-1 ring-cream">
            <p className="text-xs text-ink/60">Total Unit Stok</p>
            <p className="font-serif text-xl font-bold text-ink mt-1">{totalStok} Pcs</p>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
              Tercukupi
            </span>
          </div>
          <div className="rounded-xl bg-white px-4 py-3 ring-1 ring-cream">
            <p className="text-xs text-ink/60">Sedang Promo</p>
            <p className="font-serif text-xl font-bold text-ink mt-1">
              {sedangPromo} Item {sedangPromo > 0 && <span className="text-sm font-normal text-ink/50">({localProducts.find(p => (p.promoPercent ?? 0) > 0)?.promoPercent}%)</span>}
            </p>
            {sedangPromo > 0 && (
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-700">
                Aktif
              </span>
            )}
          </div>
          <div className="rounded-xl bg-white px-4 py-3 ring-1 ring-cream">
            <p className="text-xs text-ink/60">Perlu Restock Segera</p>
            <p className={`font-serif text-xl font-bold mt-1 ${perlurRestock > 0 ? "text-red-600" : "text-ink"}`}>
              {perlurRestock} Varian {perlurRestock > 0 && "Kosong"}
            </p>
            {perlurRestock > 0 && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                Perhatian
              </span>
            )}
          </div>
          <div className="rounded-xl bg-white px-4 py-3 ring-1 ring-cream">
            <div className="relative">
              <Search size={14} className="absolute right-0 top-0 text-ink/40" />
            </div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari nama produk, SKU..."
              className="w-full bg-transparent text-xs outline-none text-ink/70 placeholder:text-ink/40 mt-1"
            />
          </div>
        </div>

        {/* Product List */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <h2 className="font-serif text-lg font-bold text-ink">
              Daftar Produk Aktif
            </h2>
            <span className="rounded-full bg-cream px-2.5 py-0.5 text-xs font-semibold text-ink/70">
              {filtered.length} Varian
            </span>
            <div className="ml-auto flex gap-1">
              <button className="rounded-lg p-1.5 hover:bg-cream" title="Filter">
                <Settings2 size={15} className="text-ink/60" />
              </button>
              <button className="rounded-lg p-1.5 hover:bg-cream" title="Urutan">
                <ArrowUpDown size={15} className="text-ink/60" />
              </button>
            </div>
          </div>

          <ul className="space-y-3">
            {filtered.map((p) => {
              const isKosong = p.stock === 0;
              const hasPromo = (p.promoPercent ?? 0) > 0;
              const promoPrice = hasPromo
                ? Math.round(p.price * (1 - (p.promoPercent ?? 0) / 100))
                : null;

              return (
                <li
                  key={p.slug}
                  className={`rounded-2xl bg-white p-4 ring-1 transition ${
                    isKosong ? "ring-red-200" : "ring-cream hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-cream">
                      <ImageBox
                        src={getProductImage(p)}
                        alt={p.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-1.5 mb-1">
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                          {categoryName(p.categorySlug)}
                        </span>
                        {hasPromo && (
                          <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-white">
                            Promo {p.promoPercent}%
                          </span>
                        )}
                        {isKosong && (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                            Toko Nonaktifkan Otomatis
                          </span>
                        )}
                      </div>
                      <p className="font-serif font-bold text-ink leading-snug">{p.name}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-sm">
                        {promoPrice ? (
                          <>
                            <span className="font-bold text-terracotta">
                              Rp {promoPrice.toLocaleString("id-ID")}
                            </span>
                            <span className="text-xs text-ink/40 line-through">
                              Rp {p.price.toLocaleString("id-ID")}
                            </span>
                          </>
                        ) : (
                          <span className="font-bold text-ink">
                            Rp {p.price.toLocaleString("id-ID")}
                          </span>
                        )}
                        <span className="text-xs text-ink/50">
                          • Stok:{" "}
                          <span className={isKosong ? "font-bold text-red-600" : ""}>
                            {isKosong
                              ? "0 (Kosong)"
                              : `${p.stock} ${p.packaging?.toLowerCase().includes("jar") ? "toples kaca" : "bungkus"}`}
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {!isKosong ? (
                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          ● Aktif
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                          ● Stok Kosong
                        </span>
                      )}
                      {isKosong ? (
                        <button
                          onClick={() => openEditor(p)}
                          className="flex items-center gap-1.5 rounded-xl bg-terracotta px-3 py-2 text-xs font-semibold text-white hover:bg-terracotta-dark transition"
                        >
                          <RefreshCw size={12} /> Isi Ulang Stok
                        </button>
                      ) : (
                        <button
                          onClick={() => openEditor(p)}
                          className="flex items-center gap-1.5 rounded-xl bg-cream px-3 py-2 text-xs font-semibold text-ink hover:bg-sand/40 transition"
                        >
                          <Pencil size={12} /> Ubah Data
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Tambah Produk */}
          <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-terracotta py-3.5 text-sm font-bold text-white hover:bg-terracotta-dark transition">
            <Plus size={16} /> Tambah Produk Baru
          </button>
        </div>

        {/* Catatan standardisasi */}
        <div className="rounded-2xl bg-sage/10 p-5 flex gap-3 ring-1 ring-sage/20">
          <div className="rounded-full bg-sage/20 p-2 h-fit">
            <Package size={18} className="text-forest" />
          </div>
          <div>
            <h3 className="font-semibold text-forest">
              Standardisasi Olahan Salak Desa Gabugan
            </h3>
            <p className="mt-1 text-sm text-ink/70 leading-relaxed">
              Semua produk yang didaftarkan terhubung dengan pencatatan batch panen kebun anggota
              kelompok tani WaniKarya. Setiap perubahan status ketersediaan akan langsung
              tersinkron ke etalase publik wisatawan.
            </p>
          </div>
        </div>
      </div>

      {/* Editor Panel */}
      {editing && (
        <div className="w-80 shrink-0">
          <div className="sticky top-6 rounded-2xl bg-white p-5 shadow-md ring-1 ring-cream space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <span className="rounded-full bg-terracotta px-2.5 py-0.5 text-[10px] font-bold text-white mr-2">
                  MODE EDITOR
                </span>
                <span className="text-xs text-ink/50">ID: PSL-SLK-001</span>
              </div>
              <button
                onClick={closeEditor}
                className="rounded-full p-1 hover:bg-cream"
              >
                <X size={16} className="text-ink/60" />
              </button>
            </div>
            <h2 className="font-serif text-xl font-bold text-ink leading-tight">
              Ubah Produk: {editing.name}
            </h2>

            {/* Form */}
            <div className="space-y-3 text-sm">
              <div>
                <label className="text-xs font-semibold text-ink/60 flex justify-between">
                  Nama Produk *
                  <span className="font-normal">Maks. 80 Karakter</span>
                </label>
                <input
                  value={editForm.name ?? ""}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="mt-1 w-full rounded-lg bg-cream/50 px-3 py-2 text-sm outline-none ring-1 ring-cream focus:ring-terracotta"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-ink/60">Kategori Produk *</label>
                  <div className="mt-1 rounded-lg bg-cream/50 px-3 py-2 text-sm ring-1 ring-cream">
                    {categoryName(editForm.categorySlug ?? "")}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink/60">Kode SKU / Barcode</label>
                  <input
                    defaultValue="PSL-CRISP-01"
                    className="mt-1 w-full rounded-lg bg-cream/50 px-3 py-2 text-sm outline-none ring-1 ring-cream focus:ring-terracotta"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-ink/60 flex justify-between">
                  Deskripsi &amp; Cerita Produk
                  <span className="font-normal">Bercerita untuk Wisatawan</span>
                </label>
                <textarea
                  rows={4}
                  value={editForm.description ?? ""}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="mt-1 w-full rounded-lg bg-cream/50 px-3 py-2 text-sm outline-none ring-1 ring-cream focus:ring-terracotta resize-none"
                />
              </div>

              {/* Spesifikasi */}
              <div className="rounded-lg bg-cream/50 p-3 ring-1 ring-cream">
                <p className="text-xs font-bold text-ink/60 mb-2">📋 SPESIFIKASI &amp; LEGALITAS</p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-ink/50">Berat Bersih</p>
                    <div className="mt-1 rounded bg-white px-2 py-1 font-medium">
                      {editing.weight ?? "150 gram"}
                    </div>
                  </div>
                  <div>
                    <p className="text-ink/50">Bahan Utama</p>
                    <div className="mt-1 rounded bg-white px-2 py-1 font-medium">
                      Salak &amp; Ki...
                    </div>
                  </div>
                  <div>
                    <p className="text-ink/50">Tipe Wadah</p>
                    <div className="mt-1 rounded bg-white px-2 py-1 font-medium">
                      {editing.packaging ? editing.packaging.slice(0, 8) + "..." : "Foil Keda..."}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-ink/60">Harga Satuan (Rp) *</label>
                  <div className="mt-1 flex items-center gap-1 rounded-lg bg-cream/50 px-3 py-2 ring-1 ring-cream">
                    <span className="text-xs text-ink/40">Rp</span>
                    <input
                      type="number"
                      value={editForm.price ?? 0}
                      onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                      className="flex-1 bg-transparent text-sm font-bold outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink/60">Jumlah Stok Fisik *</label>
                  <div className="mt-1 flex items-center gap-1 rounded-lg bg-cream/50 px-3 py-2 ring-1 ring-cream">
                    <input
                      type="number"
                      value={editForm.stock ?? 0}
                      onChange={(e) => setEditForm({ ...editForm, stock: Number(e.target.value) })}
                      className="flex-1 bg-transparent text-sm font-bold outline-none"
                    />
                    <span className="text-xs text-ink/40">Bungkus</span>
                  </div>
                </div>
              </div>

              {/* Galeri Foto */}
              <div>
                <label className="text-xs font-semibold text-ink/60 flex justify-between">
                  Galeri Foto Produk
                  <span className="font-normal">Format JPG/PNG (Maks 3 Foto)</span>
                </label>
                <div className="mt-1 flex gap-2">
                  <div className="relative h-16 w-16 overflow-hidden rounded-lg">
                    <ImageBox
                      src={getProductImage(editing)}
                      alt="Utama"
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-center text-[9px] text-white py-0.5">
                      Utama
                    </span>
                  </div>
                  <div className="relative h-16 w-16 overflow-hidden rounded-lg">
                    <ImageBox
                      src="/images/keripik-salak.jpg"
                      alt="Foto 2"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <button className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed border-cream text-ink/40 hover:border-terracotta hover:text-terracotta transition text-xs">
                    + Unggah
                  </button>
                </div>
              </div>

              {/* Status Publikasi */}
              <div className="rounded-lg bg-cream/50 p-3 ring-1 ring-cream flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-ink">Status Publikasi Toko</p>
                  <p className="text-[11px] text-ink/60">
                    Tampilkan ke katalog publik agar wisatawan dapat langsung memesan
                  </p>
                </div>
                <div className="h-6 w-11 rounded-full bg-terracotta flex items-center justify-end pr-0.5">
                  <div className="h-5 w-5 rounded-full bg-white shadow" />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={closeEditor}
                className="flex-1 rounded-xl border border-cream py-2.5 text-sm font-semibold text-ink/70 hover:bg-cream transition"
              >
                Batal
              </button>
              <button
                onClick={saveEdit}
                className="flex-1 rounded-xl bg-terracotta py-2.5 text-sm font-bold text-white hover:bg-terracotta-dark transition"
              >
                📋 Simpan Perubahan Produk
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
