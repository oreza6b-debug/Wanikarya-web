"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { RotateCcw } from "lucide-react";

type Opt = [string, string];

export default function WomanpreneurFilter({
  total,
  shown,
  villages,
  categories = [],
}: {
  total: number;
  shown: number;
  villages: Opt[];
  categories?: Opt[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  function set(key: string, value: string) {
    const params = new URLSearchParams(sp.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("limit"); // reset pagination
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const sel = "rounded-lg bg-white px-3 py-2 text-sm outline-none ring-1 ring-cream";

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-cream px-5 py-4">
      <p className="mr-auto text-sm font-medium">
        Menampilkan <span className="text-terracotta">{shown}</span> dari {total} Womanpreneur Inspiratif Desa
      </p>

      {/* Filter Desa */}
      <select
        aria-label="Desa wisata"
        className={sel}
        value={sp.get("desa") ?? ""}
        onChange={(e) => set("desa", e.target.value)}
      >
        <option value="">Semua Desa</option>
        {villages.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>

      {/* Filter Kategori */}
      {categories.length > 0 && (
        <select
          aria-label="Kategori bidang usaha"
          className={sel}
          value={sp.get("kategori") ?? ""}
          onChange={(e) => set("kategori", e.target.value)}
        >
          <option value="">Semua Kategori</option>
          {categories.map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </select>
      )}

      {/* Urutkan */}
      <select
        aria-label="Urutkan"
        className={sel}
        value={sp.get("urut") ?? "terbaru"}
        onChange={(e) => set("urut", e.target.value)}
      >
        <option value="terbaru">Mitra Terkini</option>
        <option value="terlama">Paling Berpengalaman</option>
        <option value="nama">Nama (A – Z)</option>
      </select>

      {/* Reset Filter */}
      <button
        aria-label="Reset filter"
        onClick={() => router.push(pathname, { scroll: false })}
        className="rounded-lg bg-white p-2.5 ring-1 ring-cream hover:text-terracotta"
      >
        <RotateCcw size={16} />
      </button>
    </div>
  );
}
