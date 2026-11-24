"use client";
import { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  PlusCircle,
  Filter,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { rupiah } from "@/lib/format";

type Transaction = {
  id: string;
  date: string;
  desc: string;
  type: "income" | "expense";
  category: string;
  amount: number;
};

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "TRX-001",
    date: "24 Nov 2026",
    desc: "Penjualan 5 Pcs Keripik Salak Madu (Pelanggan Yogyakarta)",
    type: "income",
    category: "Penjualan Produk",
    amount: 119000,
  },
  {
    id: "TRX-002",
    date: "23 Nov 2026",
    desc: "Belanja Gula Kelapa Murni 10kg dari Petani Nira Lokal",
    type: "expense",
    category: "Bahan Baku",
    amount: 140000,
  },
  {
    id: "TRX-003",
    date: "22 Nov 2026",
    desc: "Reservasi Workshop Batik Tulis Daun Tarum (3 Peserta)",
    type: "income",
    category: "Jasa Wisata",
    amount: 360000,
  },
  {
    id: "TRX-004",
    date: "21 Nov 2026",
    desc: "Pembelian Bahan Kain Katun Primissima 1 Gulung",
    type: "expense",
    category: "Bahan Baku",
    amount: 320000,
  },
  {
    id: "TRX-005",
    date: "20 Nov 2026",
    desc: "Penjualan Jamu Kunyit Asem Segar 500ml (5 Botol)",
    type: "income",
    category: "Penjualan Produk",
    amount: 90000,
  },
  {
    id: "TRX-006",
    date: "19 Nov 2026",
    desc: "Ongkos Kirim Kurir Desa Armada BUMDes Gabugan",
    type: "expense",
    category: "Operasional",
    amount: 45000,
  },
  {
    id: "TRX-007",
    date: "18 Nov 2026",
    desc: "Penjualan Selai Salak Organik 220ml (4 Botol)",
    type: "income",
    category: "Penjualan Produk",
    amount: 140000,
  },
];

export default function HerFinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [type, setType] = useState<"income" | "expense">("income");
  const [category, setCategory] = useState("Penjualan Produk");
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalIncome - totalExpense;

  const filtered = transactions.filter((t) => {
    if (filter === "all") return true;
    return t.type === filter;
  });

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount || Number(amount) <= 0) return;

    const newTx: Transaction = {
      id: `TRX-${Date.now().toString().slice(-4)}`,
      date: "24 Nov 2026",
      desc,
      type,
      category,
      amount: Number(amount),
    };

    setTransactions([newTx, ...transactions]);
    setDesc("");
    setAmount("");
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <>
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="border-b border-cream bg-paper text-xs text-ink/70">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-6 py-3">
          <Link href="/" className="hover:text-terracotta">
            Beranda
          </Link>
          <span aria-hidden="true">/</span>
          <span className="font-medium text-ink">HerFinance</span>
        </div>
      </nav>

      {/* Header HerFinance */}
      <section className="bg-cream/70 border-b border-cream">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="max-w-3xl">
            <span className="inline-block rounded-full bg-sage/20 px-3 py-1 text-xs font-semibold text-sage uppercase tracking-wider">
              CATATAN KEUANGAN USAHA
            </span>
            <h1 className="mt-4 font-serif text-4xl sm:text-5xl font-bold text-ink">HerFinance</h1>
            <p className="mt-4 text-base sm:text-lg text-ink/80 leading-relaxed">
              Buku kas sederhana dan pantauan arus pendapatan mandiri khusus perempuan penggerak UMKM desa. Catat
              penjualan produk dan pengeluaran pawon tanpa kerumitan akuntansi.
            </p>
          </div>

          {/* Banner Mode Demo */}
          <div className="mt-6 flex items-start gap-3 rounded-2xl bg-amber-50 p-4 text-xs text-amber-900 ring-1 ring-amber-200">
            <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold">Simulasi Buku Kas Digital Womanpreneur (Mode Interaktif)</strong>
              <p className="mt-0.5 text-amber-800">
                Data di bawah ini disimulasikan dari etalase Pawon Salak Lestari & Griya Batik Desa Gabugan. Anda dapat
                mencoba mencatat transaksi baru langsung di bawah ini.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Kartu Ringkasan Metrik Finansial */}
      <section className="mx-auto max-w-7xl px-6 -mt-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-cream">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-ink/65">Total Pemasukan</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <TrendingUp size={16} />
              </div>
            </div>
            <p className="mt-3 font-serif text-2xl font-bold text-emerald-700">{rupiah(totalIncome)}</p>
            <p className="mt-1 text-[11px] text-emerald-600">Bulan Berjalan (November)</p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-cream">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-ink/65">Total Pengeluaran</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <TrendingDown size={16} />
              </div>
            </div>
            <p className="mt-3 font-serif text-2xl font-bold text-red-700">{rupiah(totalExpense)}</p>
            <p className="mt-1 text-[11px] text-red-600">Bahan baku & ongkir</p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-cream">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-ink/65">Laba Bersih Usaha</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sage/20 text-forest">
                <Wallet size={16} />
              </div>
            </div>
            <p className="mt-3 font-serif text-2xl font-bold text-terracotta">{rupiah(netProfit)}</p>
            <p className="mt-1 text-[11px] text-sage font-medium">Surplus kas produktif</p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-cream">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-ink/65">Total Transaksi</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sand/30 text-ink">
                <Receipt size={16} />
              </div>
            </div>
            <p className="mt-3 font-serif text-2xl font-bold text-ink">{transactions.length} Catatan</p>
            <p className="mt-1 text-[11px] text-ink/65">Tercatat rapi</p>
          </div>
        </div>
      </section>

      {/* Konten Utama: Tabel Riwayat & Form Tambah Kas */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          {/* Kolom Kiri: Riwayat Transaksi */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-ink">Buku Kas Harian</h2>
                <p className="text-xs text-ink/65">Daftar arus kas masuk dan keluar dari pawon & sanggar</p>
              </div>

              {/* Filter Tabs */}
              <div className="flex rounded-xl bg-cream/70 p-1 text-xs">
                <button
                  onClick={() => setFilter("all")}
                  className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
                    filter === "all" ? "bg-white text-ink shadow-xs" : "text-ink/70 hover:text-ink"
                  }`}
                >
                  Semua ({transactions.length})
                </button>
                <button
                  onClick={() => setFilter("income")}
                  className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
                    filter === "income" ? "bg-white text-emerald-700 shadow-xs" : "text-ink/70 hover:text-ink"
                  }`}
                >
                  Pemasukan
                </button>
                <button
                  onClick={() => setFilter("expense")}
                  className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
                    filter === "expense" ? "bg-white text-red-700 shadow-xs" : "text-ink/70 hover:text-ink"
                  }`}
                >
                  Pengeluaran
                </button>
              </div>
            </div>

            {/* List Transaksi */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-xs ring-1 ring-cream divide-y divide-cream/60">
              {filtered.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-4 hover:bg-cream/20 transition-colors">
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                        t.type === "income" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {t.type === "income" ? "+" : "−"}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-ink">{t.desc}</p>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-ink/60">
                        <span>{t.date}</span>
                        <span>•</span>
                        <span className="rounded bg-cream px-1.5 py-0.5 text-ink/80">{t.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-serif text-base font-bold ${
                        t.type === "income" ? "text-emerald-700" : "text-red-700"
                      }`}
                    >
                      {t.type === "income" ? `+${rupiah(t.amount)}` : `−${rupiah(t.amount)}`}
                    </p>
                    <span className="text-[10px] text-ink/50 uppercase">{t.id}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Kolom Kanan: Form Catat Transaksi Baru */}
          <div>
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-cream sticky top-6">
              <h3 className="font-serif text-xl font-bold text-ink flex items-center gap-2">
                <PlusCircle size={18} className="text-terracotta" /> Catat Transaksi Baru
              </h3>
              <p className="mt-1 text-xs text-ink/70">
                Tambahkan pencatatan penjualan atau pengeluaran secara langsung ke buku kas.
              </p>

              {showSuccess && (
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 ring-1 ring-emerald-200">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>Transaksi berhasil dicatat ke buku kas simulasi!</span>
                </div>
              )}

              <form onSubmit={handleAddTransaction} className="mt-4 space-y-4 text-xs">
                {/* Pilihan Jenis */}
                <div>
                  <label className="block font-semibold text-ink/80 mb-1.5">Jenis Transaksi</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setType("income")}
                      className={`rounded-xl py-2.5 font-semibold transition-colors ${
                        type === "income"
                          ? "bg-emerald-700 text-white shadow-xs"
                          : "bg-cream text-ink/70 hover:bg-sand/30"
                      }`}
                    >
                      + Pemasukan (Kas Masuk)
                    </button>
                    <button
                      type="button"
                      onClick={() => setType("expense")}
                      className={`rounded-xl py-2.5 font-semibold transition-colors ${
                        type === "expense"
                          ? "bg-red-700 text-white shadow-xs"
                          : "bg-cream text-ink/70 hover:bg-sand/30"
                      }`}
                    >
                      − Pengeluaran (Kas Keluar)
                    </button>
                  </div>
                </div>

                {/* Kategori */}
                <div>
                  <label className="block font-semibold text-ink/80 mb-1">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl bg-cream/50 px-3 py-2.5 text-xs text-ink ring-1 ring-cream outline-none"
                  >
                    {type === "income" ? (
                      <>
                        <option>Penjualan Produk Olahan</option>
                        <option>Jasa & Workshop Wisata</option>
                        <option>Sewa Homestay Joglo</option>
                        <option>Pesanan Khusus Suvenir</option>
                      </>
                    ) : (
                      <>
                        <option>Bahan Baku & Bumbu</option>
                        <option>Kemasan & Plastik Sealer</option>
                        <option>Ongkos Kirim & Ekspedisi</option>
                        <option>Peralatan Sanggar / Dapur</option>
                        <option>Lainnya</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Keterangan */}
                <div>
                  <label className="block font-semibold text-ink/80 mb-1">Keterangan Transaksi</label>
                  <input
                    type="text"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Contoh: Penjualan 3 botol Sirup Salak"
                    className="w-full rounded-xl bg-cream/50 px-3 py-2.5 text-xs ring-1 ring-cream outline-none"
                    required
                  />
                </div>

                {/* Nominal */}
                <div>
                  <label className="block font-semibold text-ink/80 mb-1">Nominal (Rp)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Contoh: 90000"
                    min="1"
                    className="w-full rounded-xl bg-cream/50 px-3 py-2.5 text-xs ring-1 ring-cream outline-none font-semibold text-ink"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-terracotta py-3 font-semibold text-white shadow-sm transition-colors hover:bg-terracotta-dark"
                >
                  Simpan Catatan Kas
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Edukasi Literasi Keuangan Desa */}
      <section className="bg-sage text-white py-14">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl mb-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/80">LITERASI FINANSIAL MANDIRI</p>
            <h2 className="mt-2 font-serif text-3xl font-bold leading-tight">
              3 Prinsip Keuangan Sehat Bagi Womanpreneur Desa
            </h2>
            <p className="mt-2 text-white/85 text-sm">
              Pedoman sederhana yang diajarkan dalam pendampingan paguyuban WaniKarya di Desa Gabugan.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-6">
              <span className="font-serif text-2xl font-bold text-sand">01</span>
              <h3 className="mt-3 font-serif text-lg font-bold text-white">Pisahkan Kas Dapur & Usaha</h3>
              <p className="mt-2 text-xs leading-relaxed text-white/80">
                Jangan mencampur uang belanja harian keluarga dengan perputaran modal produksi salak atau batik.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-6">
              <span className="font-serif text-2xl font-bold text-sand">02</span>
              <h3 className="mt-3 font-serif text-lg font-bold text-white">Catat Setiap Butir Pengeluaran</h3>
              <p className="mt-2 text-xs leading-relaxed text-white/80">
                Pengeluaran kecil seperti kantong plastik dan daun pisang harus tetap tercatat agar harga jual tetap
                menguntungkan.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-6">
              <span className="font-serif text-2xl font-bold text-sand">03</span>
              <h3 className="mt-3 font-serif text-lg font-bold text-white">Sisihkan Dana Cadangan Dasawisma</h3>
              <p className="mt-2 text-xs leading-relaxed text-white/80">
                Tabung 10% dari laba bersih untuk antisipasi masa peremajaan pohon salak atau perbaikan alat canting bersama.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
