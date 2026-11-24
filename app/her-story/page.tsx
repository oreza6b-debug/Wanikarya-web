import { Suspense } from "react";
import Link from "next/link";
import {
  Search,
  Shirt,
  Utensils,
  Sprout,
  Home,
  Shapes,
  Hammer,
  Compass,
  ChevronDown,
  SearchX,
  Users,
  BadgeCheck,
  ShieldCheck,
  Leaf,
} from "lucide-react";
import WomanpreneurCard from "@/components/WomanpreneurCard";
import WomanpreneurFilter from "@/components/WomanpreneurFilter";
import { categories, villages, womanpreneurs } from "@/lib/data";
import { getWomanpreneurs } from "@/lib/queries";

export const metadata = {
  title: "HerStory | WaniKarya",
  description:
    "Direktori womanpreneur penggerak ekonomi, perajin tradisi, dan pelestari budaya di desa wisata. Jejak langkah mandiri yang menenun masa depan tanah leluhur.",
};

const PAGE_SIZE = 9;
const icons = {
  kuliner: Utensils,
  kerajinan: Hammer,
  fashion: Shirt,
  pertanian: Sprout,
  "rumah-tangga": Home,
  lainnya: Shapes,
} as const;

type SP = {
  q?: string;
  kategori?: string;
  desa?: string;
  urut?: string;
  limit?: string;
};

export default async function HerStoryDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const all = getWomanpreneurs(sp);
  const limit = Math.max(PAGE_SIZE, Number(sp.limit) || PAGE_SIZE);
  const list = all.slice(0, limit);

  const next = new URLSearchParams(
    Object.entries(sp).filter(([, v]) => v) as [string, string][]
  );
  next.set("limit", String(limit + PAGE_SIZE));

  return (
    <>
      {/* Header / Hero */}
      <section className="bg-cream/70 border-b border-cream">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="flex flex-wrap items-start justify-between gap-8">
            <div className="max-w-3xl">
              <p className="inline-block rounded-full bg-sage/20 px-3 py-1 text-xs font-semibold text-sage">
                WAJAH DI BALIK KARYA
              </p>
              <h1 className="mt-4 font-serif text-5xl font-bold leading-tight">HerStory</h1>
              <p className="mt-4 text-lg text-ink/80 leading-relaxed">
                Mengenal sosok perempuan penggerak ekonomi, perajin tradisi, dan pelestari budaya di desa wisata.
                Jejak langkah mandiri yang menenun masa depan tanah leluhur.
              </p>
            </div>

            {/* Stat Card */}
            <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-xs ring-1 ring-cream">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sage/20 text-sage">
                <Users size={22} />
              </div>
              <div>
                <p className="font-serif text-2xl font-bold text-ink">{womanpreneurs.length} Sosok</p>
                <p className="text-xs text-ink/65">Terdaftar di Desa Wisata Gabugan</p>
              </div>
            </div>
          </div>

          {/* Form Pencarian Cepat */}
          <form
            action="/her-story"
            className="mt-8 flex max-w-2xl items-center gap-2 rounded-2xl bg-white p-2 shadow-sm ring-1 ring-cream"
          >
            <Search size={18} className="ml-3 text-terracotta" aria-hidden />
            <input
              name="q"
              defaultValue={sp.q}
              aria-label="Cari womanpreneur"
              placeholder="Cari nama ibu perajin, usaha, atau keahlian…"
              className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none"
            />
            <button className="rounded-xl bg-terracotta px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-terracotta-dark">
              Cari
            </button>
          </form>
        </div>
      </section>

      {/* Kategori Bidang Usaha */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-serif text-xl font-bold text-ink">Kategori Usaha Pelaku Desa</h2>
          <p className="text-xs text-ink/65">Pilih kategori untuk memfilter sosok perintis</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((c) => {
            const Icon = icons[c.slug];
            const active = sp.kategori === c.slug;
            return (
              <Link
                key={c.slug}
                href={active ? "/her-story" : `/her-story?kategori=${c.slug}`}
                aria-pressed={active}
                className={`flex flex-col items-center rounded-2xl p-4 text-center text-sm transition-all ${
                  active ? "bg-terracotta text-white shadow-xs" : "bg-cream/60 hover:bg-sand/40"
                }`}
              >
                <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-white text-terracotta">
                  <Icon size={16} />
                </span>
                <span className="font-semibold text-xs">{c.name}</span>
                <span className={`text-[10px] mt-0.5 ${active ? "text-white/80" : "text-ink/65"}`}>{c.sub}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Katalog Direktori */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <Suspense>
          <WomanpreneurFilter
            total={womanpreneurs.length}
            shown={list.length}
            villages={villages.map((v) => [v.slug, v.name])}
            categories={categories.map((c) => [c.slug, c.name])}
          />
        </Suspense>

        <div className="mt-4 flex items-center justify-between text-xs text-ink/65">
          <span>Menampilkan <strong>{list.length}</strong> womanpreneur aktif di Desa Wisata Gabugan</span>
          <span className="flex items-center gap-1 font-medium text-sage">
            <BadgeCheck size={14} /> Terverifikasi Pokdarwis Gabugan
          </span>
        </div>

        {list.length === 0 ? (
          <div className="mt-10 flex flex-col items-center rounded-2xl bg-cream/60 py-16 text-center">
            <SearchX size={40} className="text-terracotta" aria-hidden />
            <p className="mt-4 font-serif text-xl font-bold">Belum ada womanpreneur yang cocok</p>
            <p className="mt-1 text-sm text-ink/70">Coba ubah kata kunci atau setelan filter.</p>
            <Link
              href="/her-story"
              className="mt-5 rounded-lg bg-terracotta px-5 py-2.5 text-sm font-semibold text-white"
            >
              Reset Filter
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((w) => (
              <WomanpreneurCard key={w.slug} w={w} />
            ))}
          </div>
        )}

        {all.length > list.length && (
          <div className="mt-10 text-center">
            <Link
              href={`/her-story?${next.toString()}`}
              scroll={false}
              className="inline-flex items-center gap-2 rounded-xl bg-cream px-6 py-3 text-sm font-semibold hover:bg-sand/40"
            >
              Muat Lebih Banyak Womanpreneur <ChevronDown size={14} />
            </Link>
          </div>
        )}
      </section>

      {/* Dukungan Kolektif Perempuan Gabugan */}
      <section className="bg-sage text-white py-14">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/80">
                DESA WISATA GABUGAN, KAPANAPON TURI, SLEMAN
              </p>
              <h2 className="mt-2 font-serif text-3xl font-bold sm:text-4xl leading-tight">
                Dukungan Kolektif Perempuan Gabugan
              </h2>
              <p className="mt-4 text-white/85 text-sm leading-relaxed max-w-xl">
                Setiap produk dan pengalaman wisata yang Anda nikmati lahir dari ketulusan tangan para perempuan desa.
                Melalui platform digital WaniKarya, mereka terhubung langsung ke pasar yang menghargai nilai tradisi,
                keberlanjutan alam lereng Merapi, dan martabat ekonomi keluarga.
              </p>
            </div>

            <div className="grid gap-3">
              <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-white">Kemitraan Mandiri</h3>
                  <p className="text-xs text-white/80 mt-0.5">100% laba bersih mengalir ke perajin dan keluarga binaan.</p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white">
                  <Leaf size={22} />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-white">Bahan Ramah Alam</h3>
                  <p className="text-xs text-white/80 mt-0.5">Dukungan pewarna alami, tanaman jamu, dan kemasan anyaman bambu.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
