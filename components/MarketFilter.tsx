"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { RotateCcw } from "lucide-react";

type Opt = [string, string];

export default function MarketFilter({
  total, shown, villages,
}: { total: number; shown: number; villages: Opt[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  function set(key: string, value: string) {
    const params = new URLSearchParams(sp.toString());
    if (value) params.set(key, value); else params.delete(key);
    params.delete("limit"); // filter berubah, kembali ke halaman awal
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }
  const sel = "rounded-lg bg-white px-3 py-2 text-sm outline-none ring-1 ring-cream";

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-cream px-5 py-4">
      <p className="mr-auto text-sm font-medium">
        Menampilkan <span className="text-terracotta">{shown}</span> dari {total} Produk Lokal Perempuan Desa
      </p>
      <select aria-label="Desa wisata" className={sel} value={sp.get("desa") ?? ""} onChange={(e) => set("desa", e.target.value)}>
        <option value="">Semua Desa</option>
        {villages.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <select aria-label="Harga" className={sel} value={sp.get("harga") ?? ""} onChange={(e) => set("harga", e.target.value)}>
        <option value="">Semua Harga</option>
        <option value="murah">Di bawah Rp25.000</option>
        <option value="sedang">Rp25.000 – Rp100.000</option>
        <option value="mahal">Di atas Rp100.000</option>
      </select>
      <select aria-label="Urutkan" className={sel} value={sp.get("urut") ?? "terbaru"} onChange={(e) => set("urut", e.target.value)}>
        <option value="terbaru">Terbaru</option>
        <option value="termurah">Harga Terendah</option>
        <option value="termahal">Harga Tertinggi</option>
      </select>
      <button aria-label="Reset filter" onClick={() => router.push(pathname, { scroll: false })}
        className="rounded-lg bg-white p-2.5 ring-1 ring-cream hover:text-terracotta">
        <RotateCcw size={16} />
      </button>
    </div>
  );
}
