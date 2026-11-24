import { Suspense } from "react";
import Link from "next/link";
import { ShoppingBag, CalendarDays, MapPin, SearchX } from "lucide-react";
import SearchBox from "@/components/SearchBox";
import ImageBox from "@/components/ImageBox";
import { searchAll, finalPrice, getStore, getVillage } from "@/lib/queries";
import { rupiah } from "@/lib/format";

export const metadata = { title: "Pencarian Terpadu | WaniKarya" };

export default async function CariPage({
  searchParams,
}: { searchParams: Promise<{ q?: string; jenis?: string; urut?: string }> }) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const { prods, svcs, wps, vils, total } = searchAll({ q, jenis: sp.jenis, urut: sp.urut });

  return (
    <>
      <section className="bg-cream/70 py-10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-terracotta">Eksplorasi ekosistem desa</p>
              <h1 className="font-serif text-4xl font-semibold">Pencarian Terpadu</h1>
            </div>
            <p className="max-w-md text-sm text-ink/75">
              Temukan karya pangan otentik, pengalaman jelajah perdesaan, serta para perintis perempuan berdaya di lereng Merapi.
            </p>
          </div>
          <Suspense><SearchBox /></Suspense>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <h2 className="font-serif text-2xl font-semibold">
          Ditemukan {total} hasil{q && <> untuk <span className="text-terracotta">“{q}”</span></>}
        </h2>

        {total === 0 ? (
          <div className="mt-10 flex flex-col items-center rounded-2xl bg-cream/60 py-16 text-center">
            <SearchX size={40} className="text-terracotta" aria-hidden />
            <p className="mt-4 font-serif text-xl">Tidak ada hasil yang cocok</p>
            <p className="mt-1 max-w-sm text-sm text-ink/70">Coba kata kunci lain, misalnya “keripik”, “batik”, atau “homestay”.</p>
            <Link href="/cari" className="mt-5 rounded-lg bg-terracotta px-5 py-2.5 text-sm font-medium text-white">Reset Pencarian</Link>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {prods.map((p) => {
                const store = getStore(p.storeSlug);
                return (
                  <article key={p.slug} className="overflow-hidden rounded-2xl bg-white shadow-sm">
                    <div className="relative">
                      <ImageBox src={p.image} alt={p.name} className="h-60 w-full" dim={p.stock === 0} />
                      <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs">Produk Kuliner</span>
                      {p.promoPercent && <span className="absolute bottom-3 right-3 rounded bg-red-700 px-2 py-0.5 text-xs font-medium text-white">Hemat {p.promoPercent}%</span>}
                    </div>
                    <div className="p-6">
                      <p className="text-xs text-ink/65">{store.businessName} • {getVillage(store.villageSlug).name}</p>
                      <h3 className="mt-1 font-serif text-xl font-semibold">{p.name}</h3>
                      <p className="mt-2 line-clamp-2 text-sm text-ink/70">{p.description}</p>
                      <div className="mt-5 flex items-end justify-between">
                        <div>
                          {p.promoPercent && <p className="text-xs text-ink/50 line-through">{rupiah(p.price)}</p>}
                          <p className="font-serif text-xl font-semibold text-terracotta">{rupiah(finalPrice(p))}</p>
                        </div>
                        <Link href={`/her-market/${p.slug}`} className="inline-flex items-center gap-1.5 rounded-lg bg-terracotta px-4 py-2 text-sm font-medium text-white hover:bg-terracotta-dark">
                          <ShoppingBag size={14} /> Pesan
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
              {svcs.map((s) => {
                const store = getStore(s.storeSlug);
                return (
                  <article key={s.slug} className="overflow-hidden rounded-2xl bg-white shadow-sm">
                    <div className="relative">
                      <ImageBox src={s.image} alt={s.name} className="h-60 w-full" />
                      <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs">Jasa Wisata</span>
                      <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs">Durasi {s.duration}</span>
                    </div>
                    <div className="p-6">
                      <p className="text-xs text-ink/65">{s.category} • {getVillage(store.villageSlug).name}</p>
                      <h3 className="mt-1 font-serif text-xl font-semibold">{s.name}</h3>
                      <p className="mt-2 line-clamp-2 text-sm text-ink/70">{s.description}</p>
                      <div className="mt-5 flex items-end justify-between">
                        <div>
                          <p className="text-xs text-ink/65">Tarif pengalaman</p>
                          <p className="font-serif text-xl font-semibold">Mulai {rupiah(s.priceFrom ?? 0)}</p>
                        </div>
                        {/* URS: jasa wisata tidak lewat keranjang; pemesanan via kontak penyedia */}
                        <Link href={`/her-experience/${s.slug}`} className="inline-flex items-center gap-1.5 rounded-lg bg-sage px-4 py-2 text-sm font-medium text-white hover:bg-forest">
                          <CalendarDays size={14} /> Lihat Layanan
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {wps.map((w) => (
                <article key={w.slug} className="flex items-center gap-6 rounded-2xl bg-cream p-6">
                  <ImageBox src={w.photo} alt={w.name} className="h-28 w-28 shrink-0 rounded-full" />
                  <div>
                    <p className="text-xs"><span className="rounded-full bg-sand/50 px-2 py-0.5 font-medium">HerStory</span> <span className="text-ink/65">Mitra sejak {w.since}</span></p>
                    <h3 className="mt-2 font-serif text-xl font-semibold">{w.name}</h3>
                    <p className="text-sm text-terracotta">{w.businessName}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-ink/70">{w.description}</p>
                    <Link href={`/her-story/${w.slug}`} className="mt-2 inline-block text-sm font-medium text-terracotta">Lihat Profil ↗</Link>
                  </div>
                </article>
              ))}
              {vils.map((v) => (
                <article key={v.slug} className="rounded-2xl bg-white p-6 shadow-sm">
                  <span className="rounded-full bg-sage/20 px-3 py-1 text-xs font-medium text-sage">Profil Desa Wisata</span>
                  <h3 className="mt-3 font-serif text-2xl font-semibold">{v.name}</h3>
                  <p className="mt-1 flex items-center gap-1 text-xs text-ink/65"><MapPin size={12} aria-hidden />{v.location}</p>
                  <p className="mt-2 line-clamp-3 text-sm text-ink/70">{v.description}</p>
                  <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-cream/70 p-3 text-sm">
                    <div><p className="text-xs text-ink/65">Klaster aktif</p><p className="font-medium">{v.clusters} Sentra Usaha</p></div>
                    <div><p className="text-xs text-ink/65">Fasilitas wisata</p><p className="font-medium">{v.facilities}</p></div>
                  </div>
                  <Link href={`/her-village/${v.slug}`} className="mt-4 inline-block rounded-lg bg-cream px-4 py-2 text-sm font-medium">Jelajahi Desa</Link>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
