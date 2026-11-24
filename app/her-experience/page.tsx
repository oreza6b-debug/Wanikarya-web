import { Suspense } from "react";
import Link from "next/link";
import { Search, MapPin, Clock, CalendarDays, SearchX, ChevronDown, CheckCircle2 } from "lucide-react";
import ImageBox from "@/components/ImageBox";
import { serviceCategories, villages } from "@/lib/data";
import { getServices, getStore, getVillage } from "@/lib/queries";
import { rupiah } from "@/lib/format";

export const metadata = {
  title: "HerExperience | WaniKarya",
  description:
    "Jelajahi keasrian desa bersama perempuan pemandu, belajar kriya tradisi, dan rasakan kehangatan hidup pedesaan Gabugan.",
};

const PAGE_SIZE = 6;

type SP = { q?: string; kategori?: string; urut?: string; limit?: string };

export default async function HerExperiencePage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const all = getServices(sp);
  const limit = Math.max(PAGE_SIZE, Number(sp.limit) || PAGE_SIZE);
  const list = all.slice(0, limit);

  const next = new URLSearchParams(Object.entries(sp).filter(([, v]) => v) as [string, string][]);
  next.set("limit", String(limit + PAGE_SIZE));

  return (
    <>
      {/* Hero Section */}
      <section className="bg-cream/70">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="max-w-3xl">
            <p className="inline-block rounded-full bg-sage/20 px-3 py-1 text-xs font-medium text-sage">
              JELAJAHI PENGALAMAN LOKAL
            </p>
            <h1 className="mt-4 font-serif text-5xl font-bold leading-tight">HerExperience</h1>
            <p className="mt-4 text-lg text-ink/80 leading-relaxed">
              Jelajahi keasrian desa bersama perempuan pemandu, belajar kriya tradisi, dan rasakan kehangatan
              hidup di desa secara langsung dari tangan para penjaga tradisi Gabugan.
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-xs text-ink/75">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 size={15} className="text-sage" /> Dipandu Langsung Oleh Perempuan Desa
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 size={15} className="text-sage" /> Ekowisata Berkelanjutan
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Bar & Kategori */}
      <section className="mx-auto max-w-7xl px-6 -mt-6">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-cream">
          {/* Baris Pencarian & Dropdown */}
          <form action="/her-experience" className="grid gap-3 sm:grid-cols-[1.5fr_1fr_1fr_auto]">
            <div className="flex items-center gap-2 rounded-xl bg-cream/50 px-3 py-2 text-sm ring-1 ring-cream">
              <Search size={16} className="text-terracotta" />
              <input
                name="q"
                defaultValue={sp.q}
                placeholder="Cari aktivitas, nama pemandu, atau kriya…"
                className="w-full bg-transparent outline-none"
              />
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-cream/50 px-3 py-2 text-sm ring-1 ring-cream">
              <MapPin size={15} className="text-sage" />
              <select name="desa" defaultValue="" className="w-full bg-transparent outline-none">
                <option value="">Semua Lokasi</option>
                {villages.map((v) => (
                  <option key={v.slug} value={v.slug}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-cream/50 px-3 py-2 text-sm ring-1 ring-cream">
              <select name="urut" defaultValue={sp.urut || "terbaru"} className="w-full bg-transparent outline-none">
                <option value="terbaru">Terbaru</option>
                <option value="termurah">Biaya Terendah</option>
                <option value="termahal">Biaya Tertinggi</option>
              </select>
            </div>

            <button
              type="submit"
              className="rounded-xl bg-terracotta px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-terracotta-dark"
            >
              Cari
            </button>
          </form>

          {/* Kategori Pills */}
          <div className="mt-5 border-t border-cream pt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink/60 mb-2">Kategori Layanan</p>
            <div className="flex flex-wrap gap-2">
              {serviceCategories.map((c) => {
                const active = (sp.kategori || "semua") === c.slug;
                const href = c.slug === "semua" ? "/her-experience" : `/her-experience?kategori=${c.slug}`;
                return (
                  <Link
                    key={c.slug}
                    href={href}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      active ? "bg-terracotta text-white" : "bg-cream text-ink/80 hover:bg-sand/40"
                    }`}
                  >
                    {c.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Grid Katalog Layanan */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="font-serif text-2xl font-bold">
            Pengalaman Wisata Autentik dari Perempuan Desa
          </h2>
          <span className="text-xs text-ink/65">
            Menampilkan {list.length} dari total {all.length} aktivitas terkurasi
          </span>
        </div>

        {list.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl bg-cream/60 py-16 text-center">
            <SearchX size={40} className="text-terracotta" aria-hidden />
            <p className="mt-4 font-serif text-xl">Belum ada pengalaman wisata yang cocok</p>
            <p className="mt-1 text-sm text-ink/70">Coba ubah kata kunci atau pilih kategori layanan lain.</p>
            <Link
              href="/her-experience"
              className="mt-5 rounded-lg bg-terracotta px-5 py-2.5 text-sm font-medium text-white"
            >
              Reset Filter
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((s) => {
              const store = getStore(s.storeSlug);
              const village = getVillage(store.villageSlug);
              return (
                <article
                  key={s.slug}
                  className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-cream transition-all hover:shadow-md"
                >
                  <Link href={`/her-experience/${s.slug}`} className="relative block">
                    <ImageBox src={s.image} alt={s.name} className="h-56 w-full object-cover" />
                    <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-forest backdrop-blur-xs">
                      {s.category}
                    </span>
                    <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-md bg-ink/75 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-xs">
                      <Clock size={12} /> {s.duration}
                    </span>
                  </Link>

                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-xs text-ink/60">{village.name}</p>
                    <h3 className="mt-1 font-serif text-xl font-bold leading-snug">
                      <Link href={`/her-experience/${s.slug}`} className="hover:text-terracotta">
                        {s.name}
                      </Link>
                    </h3>

                    {/* Profil Singkat Pemandu */}
                    <div className="mt-3 flex items-center gap-2 text-xs text-ink/75">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sand/40 font-bold text-terracotta">
                        {store.name.slice(0, 2).toUpperCase()}
                      </span>
                      <span>Dipandu {store.name}</span>
                    </div>

                    <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-ink/70">{s.description}</p>

                    <div className="mt-auto flex items-end justify-between border-t border-cream/70 pt-4">
                      <div>
                        <p className="text-xs text-ink/60">Biaya Pengalaman</p>
                        <p className="font-serif text-lg font-bold text-terracotta">
                          Mulai {rupiah(s.priceFrom ?? 0)}
                          <span className="text-xs font-normal text-ink/65">/orang</span>
                        </p>
                      </div>
                      <Link
                        href={`/her-experience/${s.slug}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-terracotta px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-terracotta-dark"
                      >
                        Lihat Layanan
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {all.length > list.length && (
          <div className="mt-10 text-center">
            <Link
              href={`/her-experience?${next.toString()}`}
              scroll={false}
              className="inline-flex items-center gap-2 rounded-xl bg-cream px-6 py-3 text-sm font-medium hover:bg-sand/40"
            >
              Muat Lebih Banyak Pengalaman <ChevronDown size={14} />
            </Link>
          </div>
        )}
      </section>

      {/* Section Dampak Nyata */}
      <section className="bg-sage text-white py-14">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr] items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/80">
                DAMPAK NYATA PEREMPUAN DESA
              </p>
              <h2 className="mt-2 font-serif text-3xl font-bold sm:text-4xl leading-tight">
                Menyemai Kemandirian, Merawat Tradisi Leluhur Bersama WaniKarya
              </h2>
              <p className="mt-4 text-white/85 text-sm leading-relaxed max-w-xl">
                Setiap paket wisata yang Anda nikmati mengalirkan pendapatan langsung bagi para ibu rumah tangga,
                kelompok wanita tani (KWT), dan perajin kriya di Gabugan. Anda bukan sekadar pelancong, melainkan mitra
                pelestari budaya dan penggerak ekonomi desa yang berkelanjutan.
              </p>
              <div className="mt-8 grid grid-cols-3 gap-4 border-t border-white/20 pt-6">
                <div>
                  <p className="font-serif text-3xl font-bold">100%</p>
                  <p className="text-xs text-white/80 mt-1">Dikelola Komunitas Lokal</p>
                </div>
                <div>
                  <p className="font-serif text-3xl font-bold">15+</p>
                  <p className="text-xs text-white/80 mt-1">Ibu Pengrajin & Pemandu</p>
                </div>
                <div>
                  <p className="font-serif text-3xl font-bold">3.2 Ha</p>
                  <p className="text-xs text-white/80 mt-1">Kebun Salak & Sawah Alami</p>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl bg-white/10 p-6 shadow-sm">
              <h3 className="font-serif text-xl font-bold text-white">Pemesanan Langsung Tanpa Perantara</h3>
              <p className="mt-3 text-xs leading-relaxed text-white/80">
                Seluruh layanan wisata dikelola langsung oleh kelompok perempuan dan pengurus Desa Wisata Gabugan. Anda
                dapat berkoordinasi jadwal khusus, rombongan keluarga, maupun menu hidangan via kontak resmi penyedia.
              </p>
              <Link
                href="/her-village/gabugan"
                className="mt-6 inline-block rounded-xl bg-white px-5 py-2.5 text-xs font-semibold text-forest shadow-xs hover:bg-cream"
              >
                Kenali Ekosistem Mitra Desa ↗
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
