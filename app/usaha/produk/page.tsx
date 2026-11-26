"use client";

import { useState, useEffect } from "react";
import { categories } from "@/lib/data";
import { useSession } from "@/components/AuthProvider";
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
  Trash2,
} from "lucide-react";
import {
  getMyProductsAction,
  createProductAction,
  updateProductAction,
  toggleProductActiveAction,
  softDeleteProductAction,
  type SellerProduct,
} from "@/app/actions/products";

// Kategori dari lib/data (slug harus cocok dengan seed database)
const categoryName = (slug: string) =>
  categories.find((c) => c.slug === slug)?.name ?? "Lainnya";

const DEFAULT_IMAGE = "/images/keripik-salak.jpg";

// ---------------------------------------------------------------------------
// Tipe form edit — semua string agar mudah dikontrol input
// ---------------------------------------------------------------------------
type EditForm = {
  name: string;
  description: string;
  price: string;
  stock: string;
  stock_unit: string;
  category_slug: string;
  sku: string;
  weight: string;
  packaging: string;
  pirt: string;
  halal: string;
};

function emptyForm(): EditForm {
  return {
    name: "",
    description: "",
    price: "",
    stock: "",
    stock_unit: "bungkus",
    category_slug: categories[0]?.slug ?? "",
    sku: "",
    weight: "",
    packaging: "",
    pirt: "",
    halal: "",
  };
}

function productToForm(p: SellerProduct): EditForm {
  return {
    name: p.name,
    description: p.description ?? "",
    price: String(p.price),
    stock: String(p.stock),
    stock_unit: p.stock_unit,
    category_slug: p.category_slug,
    sku: p.sku ?? "",
    weight: p.weight ?? "",
    packaging: p.packaging ?? "",
    pirt: p.pirt ?? "",
    halal: p.halal ?? "",
  };
}

// ---------------------------------------------------------------------------
// Komponen utama
// ---------------------------------------------------------------------------
export default function ProdukPage() {
  const { session } = useSession();

  const [localProducts, setLocalProducts] = useState<SellerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<SellerProduct | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [editForm, setEditForm] = useState<EditForm>(emptyForm());

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Fetch data saat mount
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getMyProductsAction().then((res) => {
      if (cancelled) return;
      if (res.ok && res.data) {
        setLocalProducts(res.data);
      } else {
        setFetchError(res.error ?? "Gagal memuat produk.");
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  // -------------------------------------------------------------------------
  // Hitung statistik
  // -------------------------------------------------------------------------
  const totalVarian = localProducts.length;
  const statusAktif = localProducts.filter((p) => p.is_active).length;
  const perlurRestock = localProducts.filter((p) => p.stock === 0).length;
  const sedangPromo = localProducts.filter((p) => (p.promo_percent ?? 0) > 0).length;
  const totalStok = localProducts.reduce((s, p) => s + p.stock, 0);

  const filtered = localProducts.filter(
    (p) =>
      !q.trim() ||
      p.name.toLowerCase().includes(q.toLowerCase()) ||
      (p.slug ?? "").toLowerCase().includes(q.toLowerCase()) ||
      (p.sku ?? "").toLowerCase().includes(q.toLowerCase())
  );

  // -------------------------------------------------------------------------
  // Panel editor
  // -------------------------------------------------------------------------
  function openEditor(p: SellerProduct) {
    setIsNew(false);
    setEditing(p);
    setEditForm(productToForm(p));
    setSaveError(null);
    setDeleteError(null);
  }

  function openNewEditor() {
    setIsNew(true);
    setEditing({} as SellerProduct);
    setEditForm(emptyForm());
    setSaveError(null);
    setDeleteError(null);
  }

  function closeEditor() {
    setEditing(null);
    setIsNew(false);
    setEditForm(emptyForm());
    setSaveError(null);
    setDeleteError(null);
  }

  // -------------------------------------------------------------------------
  // Simpan (tambah atau ubah)
  // -------------------------------------------------------------------------
  async function handleSave() {
    setSaving(true);
    setSaveError(null);

    const input = {
      name: editForm.name,
      description: editForm.description,
      price: Number(editForm.price),
      stock: Number(editForm.stock),
      stock_unit: editForm.stock_unit,
      category_slug: editForm.category_slug,
      sku: editForm.sku,
      weight: editForm.weight,
      packaging: editForm.packaging,
      pirt: editForm.pirt,
      halal: editForm.halal,
    };

    if (isNew) {
      const res = await createProductAction(input);
      if (res.ok && res.data) {
        setLocalProducts((prev) => [res.data!, ...prev]);
        closeEditor();
      } else {
        setSaveError(res.error ?? "Gagal menyimpan produk.");
      }
    } else {
      const res = await updateProductAction(editing!.id, input);
      if (res.ok && res.data) {
        setLocalProducts((prev) =>
          prev.map((p) => (p.id === res.data!.id ? res.data! : p))
        );
        closeEditor();
      } else {
        setSaveError(res.error ?? "Gagal menyimpan perubahan.");
      }
    }

    setSaving(false);
  }

  // -------------------------------------------------------------------------
  // Hapus produk (soft delete) — konfirmasi dulu
  // -------------------------------------------------------------------------
  async function handleDelete() {
    if (!editing || isNew) return;
    const ok = window.confirm(
      `Hapus produk "${editing.name}"? Produk tidak akan muncul lagi di katalog.`
    );
    if (!ok) return;

    setDeleting(true);
    setDeleteError(null);
    const res = await softDeleteProductAction(editing.id);
    if (res.ok) {
      setLocalProducts((prev) => prev.filter((p) => p.id !== editing.id));
      closeEditor();
    } else {
      setDeleteError(res.error ?? "Gagal menghapus produk.");
    }
    setDeleting(false);
  }

  // -------------------------------------------------------------------------
  // Toggle is_active
  // -------------------------------------------------------------------------
  async function handleToggleActive(p: SellerProduct) {
    setTogglingId(p.id);
    const res = await toggleProductActiveAction(p.id, !p.is_active);
    if (res.ok && res.data) {
      setLocalProducts((prev) =>
        prev.map((item) => (item.id === res.data!.id ? res.data! : item))
      );
      // Jika sedang di-edit produk yang sama, perbarui editing
      if (editing?.id === p.id) {
        setEditing(res.data);
      }
    }
    setTogglingId(null);
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="flex gap-6">
      {/* Main Panel */}
      <div className="flex-1 min-w-0 space-y-5">
        {/* Header */}
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-ink/60 mb-2">
            <span className="font-semibold text-terracotta">
              {session?.storeName?.toUpperCase() ?? "TOKO SAYA"}
            </span>
            <span>• INVENTARIS TOKO</span>
          </div>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl font-bold text-ink">
                Katalog Produk Toko
              </h1>
              <p className="mt-1 text-sm text-ink/65">
                Kelola ketersediaan stok, harga, promo, dan varian produk toko Anda secara terpusat.
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

        {/* Error fetch */}
        {fetchError && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
            ⚠ {fetchError}
          </div>
        )}

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
              {sedangPromo} Item{" "}
              {sedangPromo > 0 && (
                <span className="text-sm font-normal text-ink/50">
                  ({localProducts.find((p) => (p.promo_percent ?? 0) > 0)?.promo_percent}%)
                </span>
              )}
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

          {loading ? (
            <p className="py-8 text-center text-sm text-ink/50">Memuat produk...</p>
          ) : (
            <ul className="space-y-3">
              {filtered.map((p) => {
                const isKosong = p.stock === 0;
                const isNonaktif = !p.is_active;
                const hasPromo = (p.promo_percent ?? 0) > 0;
                const promoPrice = hasPromo
                  ? Math.round(p.price * (1 - (p.promo_percent ?? 0) / 100))
                  : null;
                const isToggling = togglingId === p.id;

                return (
                  <li
                    key={p.id}
                    className={`rounded-2xl bg-white p-4 ring-1 transition ${
                      isKosong || isNonaktif
                        ? "ring-red-200"
                        : "ring-cream hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-cream">
                        <ImageBox
                          src={p.image_url || DEFAULT_IMAGE}
                          alt={p.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap gap-1.5 mb-1">
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                            {categoryName(p.category_slug)}
                          </span>
                          {hasPromo && (
                            <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-white">
                              Promo {p.promo_percent}%
                            </span>
                          )}
                          {isNonaktif && (
                            <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-bold text-gray-600">
                              Nonaktif
                            </span>
                          )}
                          {isKosong && (
                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                              Stok Kosong
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
                                : `${p.stock} ${p.stock_unit}`}
                            </span>
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {/* Badge aktif / nonaktif */}
                        {!isNonaktif ? (
                          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            ● Aktif
                          </span>
                        ) : (
                          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500">
                            ● Nonaktif
                          </span>
                        )}
                        {/* Tombol utama */}
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
                        {/* Toggle aktif langsung dari daftar */}
                        <button
                          onClick={() => handleToggleActive(p)}
                          disabled={isToggling}
                          className="text-[10px] text-ink/40 hover:text-terracotta transition disabled:opacity-50"
                          title={p.is_active ? "Nonaktifkan produk" : "Aktifkan produk"}
                        >
                          {isToggling
                            ? "Menyimpan..."
                            : p.is_active
                            ? "Nonaktifkan"
                            : "Aktifkan"}
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}

              {!loading && filtered.length === 0 && (
                <li className="rounded-2xl bg-white px-4 py-8 ring-1 ring-cream text-center text-sm text-ink/50">
                  {q ? "Produk tidak ditemukan." : "Belum ada produk. Tambah produk pertama Anda!"}
                </li>
              )}
            </ul>
          )}

          {/* Tambah Produk */}
          <button
            onClick={openNewEditor}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-terracotta py-3.5 text-sm font-bold text-white hover:bg-terracotta-dark transition"
          >
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
      {editing !== null && (
        <div className="w-80 shrink-0">
          <div className="sticky top-6 rounded-2xl bg-white p-5 shadow-md ring-1 ring-cream space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <span className="rounded-full bg-terracotta px-2.5 py-0.5 text-[10px] font-bold text-white mr-2">
                  {isNew ? "PRODUK BARU" : "MODE EDITOR"}
                </span>
                <span className="text-xs text-ink/50">
                  {isNew ? "" : (editing.sku ?? editing.slug ?? "")}
                </span>
              </div>
              <button
                onClick={closeEditor}
                className="rounded-full p-1 hover:bg-cream"
              >
                <X size={16} className="text-ink/60" />
              </button>
            </div>
            <h2 className="font-serif text-xl font-bold text-ink leading-tight">
              {isNew ? "Tambah Produk Baru" : `Ubah Produk: ${editing.name}`}
            </h2>

            {/* Error simpan */}
            {saveError && (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 ring-1 ring-red-200">
                ⚠ {saveError}
              </div>
            )}

            {/* Error hapus */}
            {deleteError && (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 ring-1 ring-red-200">
                ⚠ {deleteError}
              </div>
            )}

            {/* Form */}
            <div className="space-y-3 text-sm">
              {/* Nama */}
              <div>
                <label className="text-xs font-semibold text-ink/60 flex justify-between">
                  Nama Produk *
                  <span className="font-normal">Maks. 80 Karakter</span>
                </label>
                <input
                  value={editForm.name}
                  maxLength={80}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="mt-1 w-full rounded-lg bg-cream/50 px-3 py-2 text-sm outline-none ring-1 ring-cream focus:ring-terracotta"
                />
              </div>

              {/* Kategori & SKU */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-ink/60">Kategori Produk *</label>
                  <select
                    value={editForm.category_slug}
                    onChange={(e) => setEditForm({ ...editForm, category_slug: e.target.value })}
                    className="mt-1 w-full rounded-lg bg-cream/50 px-3 py-2 text-sm outline-none ring-1 ring-cream focus:ring-terracotta"
                  >
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink/60">Kode SKU / Barcode</label>
                  <input
                    value={editForm.sku}
                    onChange={(e) => setEditForm({ ...editForm, sku: e.target.value })}
                    placeholder="Contoh: PSL-001"
                    className="mt-1 w-full rounded-lg bg-cream/50 px-3 py-2 text-sm outline-none ring-1 ring-cream focus:ring-terracotta"
                  />
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="text-xs font-semibold text-ink/60 flex justify-between">
                  Deskripsi &amp; Cerita Produk
                  <span className="font-normal">Bercerita untuk Wisatawan</span>
                </label>
                <textarea
                  rows={4}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="mt-1 w-full rounded-lg bg-cream/50 px-3 py-2 text-sm outline-none ring-1 ring-cream focus:ring-terracotta resize-none"
                />
              </div>

              {/* Spesifikasi */}
              <div className="rounded-lg bg-cream/50 p-3 ring-1 ring-cream space-y-2">
                <p className="text-xs font-bold text-ink/60 mb-2">📋 SPESIFIKASI &amp; LEGALITAS</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-ink/50">Berat Bersih</label>
                    <input
                      value={editForm.weight}
                      onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })}
                      placeholder="cth: 150 gram"
                      className="mt-1 w-full rounded bg-white px-2 py-1 text-xs outline-none ring-1 ring-cream focus:ring-terracotta"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-ink/50">Tipe Wadah</label>
                    <input
                      value={editForm.packaging}
                      onChange={(e) => setEditForm({ ...editForm, packaging: e.target.value })}
                      placeholder="cth: Foil Kedap Udara"
                      className="mt-1 w-full rounded bg-white px-2 py-1 text-xs outline-none ring-1 ring-cream focus:ring-terracotta"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-ink/50">No. P-IRT</label>
                    <input
                      value={editForm.pirt}
                      onChange={(e) => setEditForm({ ...editForm, pirt: e.target.value })}
                      placeholder="cth: 2153402..."
                      className="mt-1 w-full rounded bg-white px-2 py-1 text-xs outline-none ring-1 ring-cream focus:ring-terracotta"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-ink/50">Sertifikasi Halal</label>
                    <input
                      value={editForm.halal}
                      onChange={(e) => setEditForm({ ...editForm, halal: e.target.value })}
                      placeholder="cth: MUI / -"
                      className="mt-1 w-full rounded bg-white px-2 py-1 text-xs outline-none ring-1 ring-cream focus:ring-terracotta"
                    />
                  </div>
                </div>
              </div>

              {/* Harga & Stok */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-ink/60">Harga Satuan (Rp) *</label>
                  <div className="mt-1 flex items-center gap-1 rounded-lg bg-cream/50 px-3 py-2 ring-1 ring-cream">
                    <span className="text-xs text-ink/40">Rp</span>
                    <input
                      type="number"
                      min={1}
                      value={editForm.price}
                      onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                      className="flex-1 bg-transparent text-sm font-bold outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink/60">Jumlah Stok Fisik *</label>
                  <div className="mt-1 flex items-center gap-1 rounded-lg bg-cream/50 px-3 py-2 ring-1 ring-cream">
                    <input
                      type="number"
                      min={0}
                      value={editForm.stock}
                      onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                      className="flex-1 bg-transparent text-sm font-bold outline-none"
                    />
                    <input
                      value={editForm.stock_unit}
                      onChange={(e) => setEditForm({ ...editForm, stock_unit: e.target.value })}
                      className="w-16 bg-transparent text-xs text-ink/40 outline-none text-right"
                      placeholder="satuan"
                    />
                  </div>
                </div>
              </div>

              {/* Galeri Foto (upload ditunda) */}
              <div>
                <label className="text-xs font-semibold text-ink/60 flex justify-between">
                  Galeri Foto Produk
                  <span className="font-normal">Upload foto akan datang</span>
                </label>
                <div className="mt-1 flex gap-2">
                  <div className="relative h-16 w-16 overflow-hidden rounded-lg">
                    <ImageBox
                      src={isNew ? DEFAULT_IMAGE : (editing.image_url || DEFAULT_IMAGE)}
                      alt="Utama"
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-center text-[9px] text-white py-0.5">
                      Utama
                    </span>
                  </div>
                  <button
                    disabled
                    className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed border-cream text-ink/40 text-xs cursor-not-allowed opacity-50"
                    title="Upload foto akan tersedia segera"
                  >
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
                {!isNew ? (
                  <button
                    onClick={() => handleToggleActive(editing!)}
                    disabled={togglingId === editing?.id}
                    className={`h-6 w-11 rounded-full flex items-center transition-colors disabled:opacity-50 ${
                      editing?.is_active ? "bg-terracotta justify-end pr-0.5" : "bg-gray-300 justify-start pl-0.5"
                    }`}
                    title={editing?.is_active ? "Nonaktifkan" : "Aktifkan"}
                  >
                    <div className="h-5 w-5 rounded-full bg-white shadow" />
                  </button>
                ) : (
                  <div className="h-6 w-11 rounded-full bg-terracotta flex items-center justify-end pr-0.5">
                    <div className="h-5 w-5 rounded-full bg-white shadow" />
                  </div>
                )}
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
                onClick={handleSave}
                disabled={saving}
                className="flex-1 rounded-xl bg-terracotta py-2.5 text-sm font-bold text-white hover:bg-terracotta-dark transition disabled:opacity-60"
              >
                {saving ? "Menyimpan..." : "📋 Simpan Perubahan Produk"}
              </button>
            </div>

            {/* Hapus produk (hanya untuk produk yang sudah ada) */}
            {!isNew && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-red-200 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition disabled:opacity-60"
              >
                <Trash2 size={13} />
                {deleting ? "Menghapus..." : "Hapus Produk"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
