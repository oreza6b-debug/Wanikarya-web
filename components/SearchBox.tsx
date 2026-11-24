"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, ArrowRight } from "lucide-react";

const KEY = "wanikarya:search-history"; // FR-HOME-02: 5 terakhir, disimpan di perangkat

const jenisOpts = [
  ["semua", "Semua Hasil"], ["produk", "Produk"], ["jasa", "Jasa Wisata"],
  ["womanpreneur", "Womanpreneur"], ["desa", "Desa Wisata"],
];
const urutOpts = [
  ["relevan", "Paling Relevan"], ["terbaru", "Terbaru"],
  ["termurah", "Harga Terendah"], ["termahal", "Harga Tertinggi"],
];

export default function SearchBox() {
  const router = useRouter();
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [history, setHistory] = useState<string[]>([]);
  const jenis = sp.get("jenis") ?? "semua";
  const urut = sp.get("urut") ?? "relevan";

  useEffect(() => {
    try { setHistory(JSON.parse(localStorage.getItem(KEY) ?? "[]")); } catch { /* abaikan */ }
  }, []);

  function save(next: string[]) {
    setHistory(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* abaikan */ }
  }

  function go(patch: Record<string, string>) {
    const params = new URLSearchParams(sp.toString());
    Object.entries(patch).forEach(([k, v]) => (v ? params.set(k, v) : params.delete(k)));
    router.push(`/cari?${params.toString()}`);
  }

  function submit(term: string) {
    const t = term.trim();
    if (t) save([t, ...history.filter((h) => h !== t)].slice(0, 5));
    setQ(t);
    go({ q: t });
  }

  return (
    <div>
      <form onSubmit={(e) => { e.preventDefault(); submit(q); }}
        className="flex items-center gap-3 rounded-xl bg-white px-4 py-2 shadow-sm">
        <Search size={20} className="text-terracotta" aria-hidden />
        <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Kata kunci"
          placeholder="Cari produk, jasa, atau desa wisata…"
          className="min-w-0 flex-1 bg-transparent py-2 font-serif text-lg outline-none" />
        {q && (
          <button type="button" aria-label="Hapus kata kunci" onClick={() => { setQ(""); go({ q: "" }); }}>
            <X size={18} />
          </button>
        )}
        <button className="inline-flex items-center gap-1 rounded-lg bg-terracotta px-5 py-2 text-sm font-medium text-white hover:bg-terracotta-dark">
          Cari <ArrowRight size={14} />
        </button>
      </form>

      {history.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="mr-1 text-xs font-medium text-terracotta">Riwayat pencarian terakhir</span>
          {history.map((h) => (
            <span key={h} className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1">
              <button onClick={() => submit(h)}>{h}</button>
              <button aria-label={`Hapus ${h}`} onClick={() => save(history.filter((x) => x !== h))}><X size={12} /></button>
            </span>
          ))}
          <button onClick={() => save([])} className="ml-auto text-xs font-medium text-terracotta">Hapus Semua</button>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <label className="flex items-center gap-2 rounded-lg bg-white px-3 py-2">
          Jenis:
          <select value={jenis} onChange={(e) => go({ jenis: e.target.value })} className="bg-transparent font-medium outline-none">
            {jenisOpts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2 rounded-lg bg-white px-3 py-2">
          Urutkan:
          <select value={urut} onChange={(e) => go({ urut: e.target.value })} className="bg-transparent font-medium outline-none">
            {urutOpts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
      </div>
    </div>
  );
}
