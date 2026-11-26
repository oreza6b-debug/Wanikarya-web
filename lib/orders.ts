// Tipe & data MOCK pesanan. Bentuknya sengaja mengikuti tabel BE nanti:
// orders, order_items, order_status_history (SKN-04, SKN-15).
export type OrderStatus = "dibayarkan" | "dikemas" | "dikirim" | "selesai" | "dibatalkan";
export type Actor = "Buyer" | "Womanpreneur" | "Sistem";

export type OrderItem = { name: string; price: number; normalPrice?: number; qty: number; image?: string }; // price = harga satuan SETELAH promo; normalPrice diisi bila ada promo (disalin saat order dibuat)
export type HistoryEntry = { status: OrderStatus; at: string; by: Actor };
export type Order = {
  kode: string; // WK-TTTTBBHH-nnnnn
  storeSlug: string;
  storeName: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  address: string;
  items: OrderItem[];
  shipping: number; // ongkir: informasi, bukan pendapatan
  status: OrderStatus;
  createdAt: string;
  history: HistoryEntry[];
  ekspedisi?: string;
  resi?: string;
  cancelReason?: string;
  cancelledBy?: Actor;
  buyerNote?: string;
  paymentMethod?: "qris" | "va" | "cod";
  paymentStatus?: "paid_demo" | "refunded_demo";
};

export const STATUS_LABEL: Record<OrderStatus, string> = {
  dibayarkan: "Dibayarkan",
  dikemas: "Dikemas",
  dikirim: "Dikirim",
  selesai: "Pesanan Selesai",
  dibatalkan: "Dibatalkan",
};
export const STATUS_STYLE: Record<OrderStatus, string> = {
  dibayarkan: "bg-sand/40 text-ink",
  dikemas: "bg-sage/20 text-forest",
  dikirim: "bg-sky-100 text-sky-800",
  selesai: "bg-emerald-100 text-emerald-800",
  dibatalkan: "bg-red-100 text-red-700",
};
export const PAYMENT_LABEL: Record<"qris" | "va" | "cod", string> = {
  qris: "QRIS (Simulasi)",
  va: "Virtual Account (Simulasi)",
  cod: "Bayar di Tempat / COD (Simulasi)",
};
export const EKSPEDISI = ["J&T Express", "Kurir BUMDes Gabugan"] as const; // daftar tetap sesuai rpc_ship_order
export const RESPONSE_MS = 2 * 24 * 3600 * 1000; // SKN-08
export const AUTO_DONE_MS = 7 * 24 * 3600 * 1000; // SKN-12

export const subtotal = (o: Order) => o.items.reduce((s, i) => s + i.price * i.qty, 0);
export const total = (o: Order) => subtotal(o) + o.shipping;
export const doneAt = (o: Order) => o.history.find((h) => h.status === "selesai")?.at;

export function cancelText(o: Order) {
  if (o.cancelledBy === "Womanpreneur") return `Ditolak penjual: ${o.cancelReason}`; // SKN-09
  if (o.cancelledBy === "Buyer") return "Dibatalkan oleh pembeli.";
  return "Dibatalkan otomatis karena penjual tidak merespons dalam 2×24 jam."; // FR-ORD-15
}

const A = "RT 03/RW 08 Dusun Gabugan, Donokerto, Turi, Sleman, D.I. Yogyakarta 55551";
const base = { buyerId: "u-rian", buyerName: "Rian Pratama", buyerPhone: "0812-1111-2222", address: A };

export const mockOrders: Order[] = [
  // ---- Penjualan toko Bu Sumarsih (sisi penjual) ----
  { ...base, kode: "WK-20261124-00003", storeSlug: "bu-sumarsih", storeName: "Pawon Salak Lestari",
    items: [{ name: "Keripik Salak Madu 150g", price: 23800, normalPrice: 28000, qty: 2 }, { name: "Selai Salak Organik 220ml", price: 35000, qty: 1 }],
    shipping: 12000, status: "dibayarkan", createdAt: "2026-11-24T06:00:00+07:00",
    history: [{ status: "dibayarkan", at: "2026-11-24T06:00:00+07:00", by: "Sistem" }] },
  { ...base, kode: "WK-20261123-00002", storeSlug: "bu-sumarsih", storeName: "Pawon Salak Lestari",
    items: [{ name: "Sirup Salak Pondoh 330ml", price: 30000, qty: 3 }],
    shipping: 12000, status: "dikemas", createdAt: "2026-11-23T09:30:00+07:00",
    history: [{ status: "dibayarkan", at: "2026-11-23T09:30:00+07:00", by: "Sistem" }, { status: "dikemas", at: "2026-11-23T13:00:00+07:00", by: "Womanpreneur" }] },
  { ...base, kode: "WK-20261120-00001", storeSlug: "bu-sumarsih", storeName: "Pawon Salak Lestari",
    items: [{ name: "Keripik Salak Madu 150g", price: 23800, normalPrice: 28000, qty: 5 }],
    shipping: 12000, status: "dikirim", ekspedisi: "JNE", resi: "JNE0012345678", createdAt: "2026-11-20T10:00:00+07:00",
    history: [{ status: "dibayarkan", at: "2026-11-20T10:00:00+07:00", by: "Sistem" }, { status: "dikemas", at: "2026-11-20T15:00:00+07:00", by: "Womanpreneur" }, { status: "dikirim", at: "2026-11-21T09:00:00+07:00", by: "Womanpreneur" }] },
  { ...base, kode: "WK-20261110-00004", storeSlug: "bu-sumarsih", storeName: "Pawon Salak Lestari",
    items: [{ name: "Selai Salak Organik 220ml", price: 35000, qty: 4 }],
    shipping: 12000, status: "selesai", ekspedisi: "J&T", resi: "JT99887766", createdAt: "2026-11-10T08:00:00+07:00",
    history: [{ status: "dibayarkan", at: "2026-11-10T08:00:00+07:00", by: "Sistem" }, { status: "dikemas", at: "2026-11-10T11:00:00+07:00", by: "Womanpreneur" }, { status: "dikirim", at: "2026-11-11T09:00:00+07:00", by: "Womanpreneur" }, { status: "selesai", at: "2026-11-14T16:00:00+07:00", by: "Buyer" }] },
  { ...base, kode: "WK-20261105-00007", storeSlug: "bu-sumarsih", storeName: "Pawon Salak Lestari",
    items: [{ name: "Dodol Salak Pondoh Asli", price: 25000, qty: 2 }],
    shipping: 12000, status: "dibatalkan", cancelledBy: "Womanpreneur", cancelReason: "Stok dodol habis, produksi ulang belum selesai.", createdAt: "2026-11-05T10:00:00+07:00",
    history: [{ status: "dibayarkan", at: "2026-11-05T10:00:00+07:00", by: "Sistem" }, { status: "dibatalkan", at: "2026-11-05T12:00:00+07:00", by: "Womanpreneur" }] },
  { ...base, kode: "WK-20261008-00005", storeSlug: "bu-sumarsih", storeName: "Pawon Salak Lestari",
    items: [{ name: "Keripik Salak Madu 150g", price: 28000, qty: 6 }],
    shipping: 12000, status: "selesai", ekspedisi: "JNE", resi: "JNE0099", createdAt: "2026-10-08T08:00:00+07:00",
    history: [{ status: "dibayarkan", at: "2026-10-08T08:00:00+07:00", by: "Sistem" }, { status: "dikemas", at: "2026-10-08T10:00:00+07:00", by: "Womanpreneur" }, { status: "dikirim", at: "2026-10-09T09:00:00+07:00", by: "Womanpreneur" }, { status: "selesai", at: "2026-10-16T09:00:00+07:00", by: "Sistem" }] },
  { ...base, kode: "WK-20260915-00006", storeSlug: "bu-sumarsih", storeName: "Pawon Salak Lestari",
    items: [{ name: "Sirup Salak Pondoh 330ml", price: 30000, qty: 4 }, { name: "Selai Salak Organik 220ml", price: 35000, qty: 2 }],
    shipping: 12000, status: "selesai", ekspedisi: "J&T", resi: "JT11", createdAt: "2026-09-15T08:00:00+07:00",
    history: [{ status: "dibayarkan", at: "2026-09-15T08:00:00+07:00", by: "Sistem" }, { status: "dikemas", at: "2026-09-15T10:00:00+07:00", by: "Womanpreneur" }, { status: "dikirim", at: "2026-09-16T09:00:00+07:00", by: "Womanpreneur" }, { status: "selesai", at: "2026-09-19T09:00:00+07:00", by: "Buyer" }] },

  // ---- Pembelian pribadi Bu Sumarsih sebagai Buyer (FR-ORD-16) ----
  { kode: "WK-20261121-00008", storeSlug: "bu-hartini", storeName: "Griya Batik Sekar Wangi",
    buyerId: "u-sumarsih", buyerName: "Bu Sumarsih", buyerPhone: "0813-5555-6666", address: A,
    items: [{ name: "Syal Batik Pewarna Alam Daun Tarum", price: 145000, qty: 1 }],
    shipping: 10000, status: "dikirim", ekspedisi: "Kurir Desa", resi: "KD-2211", createdAt: "2026-11-21T10:00:00+07:00",
    history: [{ status: "dibayarkan", at: "2026-11-21T10:00:00+07:00", by: "Sistem" }, { status: "dikemas", at: "2026-11-21T14:00:00+07:00", by: "Womanpreneur" }, { status: "dikirim", at: "2026-11-22T09:00:00+07:00", by: "Womanpreneur" }] },
  { kode: "WK-20261124-00009", storeSlug: "bu-suparni", storeName: "Kriya Anyam Lestari",
    buyerId: "u-sumarsih", buyerName: "Bu Sumarsih", buyerPhone: "0813-5555-6666", address: A,
    items: [{ name: "Keranjang Anyaman Bambu Halus", price: 45000, qty: 1 }],
    shipping: 10000, status: "dibayarkan", createdAt: "2026-11-24T08:00:00+07:00",
    history: [{ status: "dibayarkan", at: "2026-11-24T08:00:00+07:00", by: "Sistem" }] },

  // ---- Pesanan toko lain (tidak boleh terlihat oleh Bu Sumarsih) ----
  { ...base, kode: "WK-20261122-00010", storeSlug: "bu-wagiyem", storeName: "Jamu Sekar Arum",
    items: [{ name: "Jamu Kunyit Asem Segar 500ml", price: 18000, qty: 5 }],
    shipping: 10000, status: "dibayarkan", createdAt: "2026-11-22T08:00:00+07:00",
    history: [{ status: "dibayarkan", at: "2026-11-22T08:00:00+07:00", by: "Sistem" }] },
];

// ---- Helper tampilan ----
export function sisaWaktu(deadlineIso: string) {
  const ms = new Date(deadlineIso).getTime() - Date.now();
  if (ms <= 0) return "batas waktu terlewati";
  const jam = Math.floor(ms / 3600000);
  const menit = Math.floor((ms % 3600000) / 60000);
  return `${jam} jam ${menit} menit`;
}
const dtf = new Intl.DateTimeFormat("id-ID", {
  day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta",
});
export const fmtDate = (iso: string) => dtf.format(new Date(iso)) + " WIB";
export const addMs = (iso: string, ms: number) => new Date(new Date(iso).getTime() + ms).toISOString();
export const itemsSummary = (o: Order) =>
  o.items[0].name + (o.items.length > 1 ? ` +${o.items.length - 1} produk lain` : "");
export const monthKey = (iso: string) => iso.slice(0, 7); // "2026-11"
export const monthLabel = (key: string, style: "long" | "short" = "long") =>
  new Intl.DateTimeFormat("id-ID", { month: style, year: style === "long" ? "numeric" : undefined, timeZone: "Asia/Jakarta" })
    .format(new Date(`${key}-15T12:00:00+07:00`));
