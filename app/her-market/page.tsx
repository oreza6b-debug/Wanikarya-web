import { Suspense } from "react";
import Link from "next/link";
import { Search, Shirt, Utensils, Sprout, Home, Shapes, Hammer, ChevronDown, SearchX } from "lucide-react";
import ImageBox from "@/components/ImageBox";
import ProductCard from "@/components/ProductCard";
import MarketFilter from "@/components/MarketFilter";
import { categories, villages } from "@/lib/data";
import { getProducts } from "@/lib/queries";
import { getDbProducts } from "@/lib/products-db";

export const metadata = { title: "HerMarket | WaniKarya" };

const PAGE_SIZE = 6;
const icons = {
  kuliner: Utensils,
  kerajinan: Hammer,
  fashion: Shirt,
  pertanian: Sprout,
  "rumah-tangga": Home,
  lainnya: Shapes,
} as const;

type SP = { q?: string; kategori?: string; desa?: string; harga?: string; urut?: string; limit?: string };

export default async function HerMarketPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const products = await getDbProducts();
  const all = getProducts(sp, products);
  const limit = Math.max(PAGE_SIZE, Number(sp.limit) || PAGE_SIZE);
  const list = all.slice(0, limit);

  // tautan "Muat Lebih Banyak": pertahankan filter, naikkan limit
  const next = new URLSearchParams(Object.entries(sp).filter(([, v]) => v) as [string, string][]);
  next.set("limit", String(limit + PAGE_SIZE));

  return (
    <>
      {/* Header */}
      <section className="bg-cream/70">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-14 md:grid-cols-2">
          <div>
            <p className="inline-block rounded-full bg-sage/20 px-3 py-1 text-xs font-medium text-sage">
              Karya Pangan & Kriya Autentik
            </p>
            <h1 className="mt-4 font-serif text-5xl font-bold">HerMarket</h1>
            <p className="mt-4 max-w-md text-ink/80">
              Karya tangan dan olahan tulus perempuan desa, dikirim langsung dari sanggar dan pawon mereka di Desa Wisata Gabugan.
            </p>
            <form action="/her-market" className="mt-6 flex max-w-md items-center gap-2 rounded-xl bg-white p-1.5 shadow-sm">
              <Search size={16} className="ml-3 text-terracotta" aria-hidden />
              <input
                name="q"
                defaultValue={sp.q}
                aria-label="Cari produk"
                placeholder="Cari olahan salak, batik alami, anyaman…"
                className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none"
              />
              <button className="rounded-lg bg-terracotta px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-terracotta-dark">
                Cari
              </button>
            </form>
            <p className="mt-3 text-xs text-ink/70">
              Pencarian sering:{" "}
              {["Salak Pondoh", "Batik Tarum", "Anyam Bambu"].map((t) => (
                <Link key={t} href={`/her-market?q=${encodeURIComponent(t)}`} className="mr-3 underline">
                  {t}
                </Link>
              ))}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <ImageBox src="/images/market-1.jpg" alt="Pembatik Gabugan" className="row-span-2 h-72 w-full rounded-2xl" />
            <ImageBox src="/images/market-2.jpg" alt="Dapur pawon" className="h-34 w-full rounded-2xl" />
            <ImageBox src="/images/market-3.jpg" alt="Pengrajin anyaman" className="h-34 w-full rounded-2xl" />
            <div className="col-span-2 rounded-xl bg-sage/15 p-4 text-sm">
              <p className="font-semibold">100% Produksi Desa</p>
              <p className="text-ink/75">Langsung mendanai kemandirian perempuan produsen</p>
            </div>
          </div>
        </div>
      </section>

      {/* Kategori */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-terracotta">Jelajahi berdasarkan</p>
            <h2 className="font-serif text-2xl font-semibold">6 Kategori Karya Pilihan</h2>
          </div>
          <p className="text-sm text-ink/70">Pilih kategori untuk memfilter etalase langsung dari sanggar desa</p>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((c) => {
            const Icon = icons[c.slug];
            const active = sp.kategori === c.slug;
            return (
              <Link
                key={c.slug}
                href={active ? "/her-market" : `/her-market?kategori=${c.slug}`}
                aria-pressed={active}
                className={`flex flex-col items-center rounded-xl p-5 text-center text-sm transition-colors ${
                  active ? "bg-terracotta text-white" : "bg-cream hover:bg-sand/40"
                }`}
              >
                <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white text-terracotta">
                  <Icon size={18} />
                </span>
                <span className="font-medium">{c.name}</span>
                <span className={`text-xs ${active ? "text-white/80" : "text-ink/65"}`}>{c.sub}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Katalog */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <Suspense>
          <MarketFilter
            total={products.length}
            shown={list.length}
            villages={villages.map((v) => [v.slug, v.name])}
          />
        </Suspense>

        {list.length === 0 ? (
          <div className="mt-10 flex flex-col items-center rounded-2xl bg-cream/60 py-16 text-center">
            <SearchX size={40} className="text-terracotta" aria-hidden />
            <p className="mt-4 font-serif text-xl">Belum ada produk yang cocok</p>
            <p className="mt-1 text-sm text-ink/70">Coba ubah kata kunci atau filter.</p>
            <Link href="/her-market" className="mt-5 rounded-lg bg-terracotta px-5 py-2.5 text-sm font-medium text-white">
              Reset Filter
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <ProductCard key={p.slug} p={p} />
            ))}
          </div>
        )}

        {all.length > list.length && (
          <div className="mt-10 text-center">
            <Link
              href={`/her-market?${next.toString()}`}
              scroll={false}
              className="inline-flex items-center gap-2 rounded-xl bg-cream px-6 py-3 text-sm font-medium hover:bg-sand/40"
            >
              Muat Lebih Banyak Produk <ChevronDown size={14} />
            </Link>
          </div>
        )}
        <p className="mt-3 text-center text-xs text-ink/65">
          Menampilkan {list.length} dari total {all.length} karya perempuan Gabugan
        </p>
      </section>

      {/* Mengapa */}
      <section className="bg-sage text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-6 py-14 md:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="text-xs font-medium text-white/80">Mengapa berbelanja di HerMarket?</p>
            <h2 className="mt-2 font-serif text-3xl font-semibold leading-snug">
              Setiap Rupiah Menghidupkan Sanggar & Keluarga di Gabugan
            </h2>
            <p className="mt-4 max-w-xl text-white/85">
              Tanpa perantara berlapis dan potongan biaya promosi yang mencekik. Hasil penjualan disalurkan langsung
              untuk kemandirian ekonomi ibu-ibu perajin serta pelestarian tradisi lokal Sleman.
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 p-6 text-sm">
            <p className="font-semibold">Jaminan Kualitas Asli</p>
            <p className="text-white/80">Dikurasi pendamping desa</p>
            <p className="mt-3 text-white/85">
              Semua produk diuji higienitas dan keaslian materialnya bersama komunitas desa wisata Gabugan.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
