"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { useOrders } from "@/components/OrdersProvider";
import { getSession } from "@/lib/session";
import { categories, products } from "@/lib/data";
import { doneAt, fmtDate, itemsSummary, monthKey, monthLabel, subtotal, type Order } from "@/lib/orders";
import { rupiah } from "@/lib/format";

// Financial Tracker: BACA SAJA. Pendapatan = subtotal produk setelah promo dari pesanan
// berstatus Pesanan Selesai; ongkir hanya informasi (FR-FIN-01/02). Tanpa input manual (FR-FIN-04).
type Tab = "dashboard" | "riwayat" | "laporan";

const categoryOf = (name: string) => {
  const slug = products.find((p) => p.name === name)?.categorySlug;
  return categories.find((c) => c.slug === slug)?.name ?? "Lainnya";
};

export default function KeuanganPage() {
  const { orders } = useOrders();
  const session = getSession();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [q, setQ] = useState("");

  const mine = useMemo(() => orders.filter((o) => o.storeSlug === session?.storeSlug), [orders, session?.storeSlug]);
  const done = useMemo(() => mine.filter((o) => o.status === "selesai" && doneAt(o)), [mine]);
  const inProgress = mine.filter((o) => ["dibayarkan", "dikemas", "dikirim"].includes(o.status));

  const nowKey = new Date().toISOString().slice(0, 7);
  const months = useMemo(
    () => Array.from(new Set([nowKey, ...done.map((o) => monthKey(doneAt(o)!))])).sort().reverse(),
    [done, nowKey]
  );
  const [month, setMonth] = useState(nowKey);

  const incomeOf = (key: string) => done.filter((o) => monthKey(doneAt(o)!) === key);
  const sum = (list: Order[]) => list.reduce((s, o) => s + subtotal(o), 0);

  const monthOrders = incomeOf(month);
  const totalIncome = sum(monthOrders);
  const avg = monthOrders.length ? Math.round(totalIncome / monthOrders.length) : 0;
  const pending = sum(inProgress);

  // Grafik 6 bulan berakhir di bulan terpilih
  const chart = useMemo(() => {
    const [y, m] = month.split("-").map(Number);
    const keys = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(Date.UTC(y, m - 1 - (5 - i), 1));
      return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    });
    const vals = keys.map((k) => sum(incomeOf(k)));
    return { keys, vals, max: Math.max(...vals, 1) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, done]);

  const recent = [...monthOrders].sort((a, b) => doneAt(b)!.localeCompare(doneAt(a)!));
  const riwayat = recent.filter((o) => (q.trim() ? o.kode.toLowerCase().includes(q.trim().toLowerCase()) : true));

  // Laporan: rincian per produk & per kategori
  const perProduct = new Map<string, { qty: number; income: number }>();
  const perCategory = new Map<string, number>();
  monthOrders.forEach((o) =>
    o.items.forEach((it) => {
      const cur = perProduct.get(it.name) ?? { qty: 0, income: 0 };
      perProduct.set(it.name, { qty: cur.qty + it.qty, income: cur.income + it.price * it.qty });
      const c = categoryOf(it.name);
      perCategory.set(c, (perCategory.get(c) ?? 0) + it.price * it.qty);
    })
  );
  const prevKey = chart.keys[4];
  const prevIncome = sum(incomeOf(prevKey));

  const Empty = (
    <div className="mt-8 rounded-2xl bg-cream/60 py-14 text-center">
      <p className="font-serif text-xl font-semibold">Belum Ada Pendapatan</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-ink/70">
        Pendapatan tercatat otomatis dari pesanan yang sudah selesai pada {monthLabel(month)}.
      </p>
      {/* Halaman Produk Toko belum dibuat */}
      <Link href="/usaha/produk" className="mt-5 inline-block rounded-lg bg-terracotta px-5 py-2.5 text-sm font-medium text-white">
        Kelola Produk
      </Link>
    </div>
  );

  const tabs: [Tab, string][] = [["dashboard", "Dashboard"], ["riwayat", "Riwayat Pendapatan"], ["laporan", "Laporan Bulanan"]];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold">Financial Tracker</h1>
          <p className="mt-1 text-sm text-ink/70">
            Pendapatan toko tercatat otomatis dari pesanan selesai. Halaman ini baca saja.
          </p>
        </div>
        <select
          aria-label="Pilih bulan"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-xl bg-white px-3 py-2 text-sm ring-1 ring-cream outline-none"
        >
          {months.map((k) => <option key={k} value={k}>{monthLabel(k)}</option>)}
        </select>
      </div>

      <div role="tablist" className="mt-5 flex flex-wrap gap-2">
        {tabs.map(([k, l]) => (
          <button
            key={k}
            role="tab"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${tab === k ? "bg-terracotta text-white" : "bg-cream hover:bg-sand/40"}`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* ---------- DASHBOARD ---------- */}
      {tab === "dashboard" && (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              ["Total Pendapatan", rupiah(totalIncome), monthLabel(month)],
              ["Pesanan Selesai", String(monthOrders.length), "pada bulan ini"],
              ["Rata-rata Nilai Pesanan", rupiah(avg), "subtotal produk"],
              ["Pendapatan Tertunda", rupiah(pending), `${inProgress.length} pesanan dalam proses`],
            ].map(([t, v, s]) => (
              <div key={t} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-cream">
                <p className="text-xs font-medium text-ink/65">{t}</p>
                <p className="mt-2 font-serif text-2xl font-bold text-terracotta">{v}</p>
                <p className="mt-1 text-[11px] text-ink/60">{s}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-cream">
            <h2 className="font-serif text-lg font-semibold">Pendapatan 6 Bulan Terakhir</h2>
            <div className="mt-4 flex h-44 items-end gap-3" role="img" aria-label="Grafik batang pendapatan antarbulan">
              {chart.keys.map((k, i) => (
                <div key={k} className="flex flex-1 flex-col items-center justify-end gap-1">
                  <span className="text-[10px] text-ink/60">{chart.vals[i] ? rupiah(chart.vals[i]) : "–"}</span>
                  <div
                    className={`w-full rounded-t-md ${k === month ? "bg-terracotta" : "bg-sand"}`}
                    style={{ height: `${Math.max((chart.vals[i] / chart.max) * 100, chart.vals[i] ? 4 : 1)}%` }}
                  />
                  <span className="text-[11px] text-ink/70">{monthLabel(k, "short")}</span>
                </div>
              ))}
            </div>
          </div>

          {monthOrders.length === 0 ? Empty : (
            <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-cream">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-lg font-semibold">Pendapatan Terbaru</h2>
                <button onClick={() => setTab("riwayat")} className="text-sm font-semibold text-terracotta hover:underline">
                  Lihat Semua Pendapatan →
                </button>
              </div>
              <ul className="mt-3 divide-y divide-cream/70">
                {recent.slice(0, 5).map((o) => (
                  <li key={o.kode} className="flex items-center justify-between gap-4 py-3 text-sm">
                    <div>
                      <Link href={`/pesanan/${o.kode}`} className="font-semibold hover:text-terracotta">#{o.kode}</Link>
                      <p className="text-xs text-ink/65">{fmtDate(doneAt(o)!)} • {itemsSummary(o)}</p>
                    </div>
                    <span className="font-semibold text-emerald-700">+{rupiah(subtotal(o))}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {/* ---------- RIWAYAT ---------- */}
      {tab === "riwayat" && (
        <div className="mt-6">
          <div className="flex max-w-md items-center gap-2 rounded-xl bg-white px-3 py-2 ring-1 ring-cream">
            <Search size={16} className="text-terracotta" aria-hidden />
            <input
              aria-label="Cari kode pesanan"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari kode pesanan (WK-…)"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
          {riwayat.length === 0 ? Empty : (
            <ul className="mt-4 divide-y divide-cream/70 rounded-2xl bg-white shadow-sm ring-1 ring-cream">
              {riwayat.map((o) => (
                <li key={o.kode} className="flex items-center justify-between gap-4 p-4 text-sm">
                  <div>
                    <Link href={`/pesanan/${o.kode}`} className="font-semibold hover:text-terracotta">#{o.kode}</Link>
                    <p className="text-xs text-ink/65">Selesai {fmtDate(doneAt(o)!)}</p>
                    <p className="text-xs text-ink/65">
                      {o.items.map((i) => `${i.name} (${i.qty} × ${rupiah(i.price)})`).join(", ")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-emerald-700">+{rupiah(subtotal(o))}</p>
                    <p className="text-[11px] text-ink/55">Ongkir {rupiah(o.shipping)} (info, bukan pendapatan)</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ---------- LAPORAN ---------- */}
      {tab === "laporan" && (
        <div className="mt-6 space-y-6">
          {monthOrders.length === 0 ? Empty : (
            <>
              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-cream">
                <h2 className="font-serif text-lg font-semibold">Laporan {monthLabel(month)}</h2>
                <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                  <div className="flex justify-between"><dt className="text-ink/65">Total pendapatan</dt><dd className="font-semibold">{rupiah(totalIncome)}</dd></div>
                  <div className="flex justify-between"><dt className="text-ink/65">Jumlah pesanan</dt><dd className="font-semibold">{monthOrders.length}</dd></div>
                  <div className="flex justify-between"><dt className="text-ink/65">Rata-rata nilai pesanan</dt><dd className="font-semibold">{rupiah(avg)}</dd></div>
                  <div className="flex justify-between">
                    <dt className="text-ink/65">Dibanding {monthLabel(prevKey)}</dt>
                    <dd className="font-semibold">{prevIncome ? `${totalIncome >= prevIncome ? "+" : "−"}${rupiah(Math.abs(totalIncome - prevIncome))}` : "–"}</dd>
                  </div>
                </dl>
              </div>

              <div className="overflow-x-auto rounded-2xl bg-white p-5 shadow-sm ring-1 ring-cream">
                <h3 className="font-serif text-lg font-semibold">Per Produk</h3>
                <table className="mt-3 w-full text-left text-sm">
                  <thead className="text-xs text-ink/60"><tr><th className="py-2">Produk</th><th>Terjual</th><th className="text-right">Pendapatan</th></tr></thead>
                  <tbody className="divide-y divide-cream/70">
                    {[...perProduct].sort((a, b) => b[1].income - a[1].income).map(([n, v]) => (
                      <tr key={n}><td className="py-2">{n}</td><td>{v.qty}</td><td className="text-right font-medium">{rupiah(v.income)}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-cream">
                <h3 className="font-serif text-lg font-semibold">Per Kategori Produk</h3>
                <ul className="mt-3 space-y-2 text-sm">
                  {[...perCategory].sort((a, b) => b[1] - a[1]).map(([c, v]) => (
                    <li key={c} className="flex justify-between"><span>{c}</span><span className="font-medium">{rupiah(v)}</span></li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
