import Link from "next/link";
import { Search, BadgeCheck } from "lucide-react";
import ImageBox from "@/components/ImageBox";
import ProductCard from "@/components/ProductCard";
import Spotlight from "@/components/Spotlight";
import { products, services, villages, womanpreneurs } from "@/lib/data";
import { getStats } from "@/lib/queries";
import { rupiah } from "@/lib/format";

export default function HomePage() {
  const stats = getStats(); // FR-HOME-03: angka dari data aktual
  const featured = products.filter((p) => p.featured).slice(0, 4);
  const service = services[0];
  const village = villages[0];

  return (
    <>
      {/* Pencarian */}
      <div className="bg-cream/60 py-4">
        <form action="/cari" className="mx-auto flex max-w-xl items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm">
          <Search size={16} className="text-terracotta" aria-hidden />
          <input name="q" aria-label="Cari" placeholder="Cari produk, jasa, atau desa wisata…"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
          <button className="rounded-full bg-cream px-4 py-1 text-xs font-medium">Cari</button>
        </form>
      </div>

      {/* Hero */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2">
        <div>
          <p className="text-xs font-medium text-terracotta">Desa Wisata Gabugan • Sleman</p>
          <h1 className="mt-5 font-serif text-5xl font-bold leading-tight">
            Setiap produk punya wajah dan nama pembuatnya.
          </h1>
          <p className="mt-6 max-w-md text-ink/80">
            Dari olahan salak pondoh hingga tenun dan jamu tradisional, temukan karya autentik
            perempuan Desa Wisata Gabugan yang dirawat dengan tangan sendiri.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/her-market" className="rounded-lg bg-terracotta px-6 py-3 text-sm font-medium text-white hover:bg-terracotta-dark">
              Jelajahi Karya Lokal
            </Link>
            <Link href="/her-story" className="rounded-lg bg-cream px-6 py-3 text-sm font-medium hover:bg-sand/40">
              Kenali Pembuatnya
            </Link>
          </div>
        </div>
        <div className="relative">
          <ImageBox src="/images/hero.jpg" alt="Womanpreneur Gabugan di dapur pawon" className="h-[420px] w-full rounded-2xl shadow-lg" />
          <div className="absolute -bottom-5 left-8 flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm shadow-md">
            <BadgeCheck size={18} className="text-terracotta" aria-hidden />
            <div>
              <p className="font-medium">Karya Perempuan Desa</p>
              <p className="text-xs text-ink/65">Diproduksi langsung di Gabugan</p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact counter */}
      <section className="bg-cream">
        <dl className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 py-8 text-center md:grid-cols-4">
          {[
            [stats.villages, "Desa Wisata Bermitra"],
            [stats.womanpreneurs, "Womanpreneur Terdaftar"],
            [stats.products, "Produk Lokal"],
            [stats.services, "Jasa & Pengalaman Wisata"],
          ].map(([n, label]) => (
            <div key={label as string}>
              <dd className="font-serif text-3xl font-semibold text-terracotta">{n}</dd>
              <dt className="mt-1 text-sm text-ink/75">{label}</dt>
            </div>
          ))}
        </dl>
      </section>

      <Spotlight items={womanpreneurs} />

      {/* Karya lokal pilihan */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-medium text-terracotta">Pilihan kurasi</p>
            <h2 className="font-serif text-3xl font-semibold">Karya Lokal Pilihan</h2>
          </div>
          <Link href="/her-market" className="text-sm font-medium text-terracotta">Lihat Semua →</Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => <ProductCard key={p.slug} p={p} variant="compact" />)}
        </div>
      </section>

      {/* Jasa wisata */}
      <section className="bg-cream/60 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-medium text-terracotta">Pengalaman autentik</p>
              <h2 className="font-serif text-3xl font-semibold">Jasa & Pengalaman Wisata</h2>
            </div>
            <Link href="/her-experience" className="text-sm font-medium text-terracotta">Lihat Semua →</Link>
          </div>
          <article className="grid overflow-hidden rounded-2xl bg-white shadow-sm md:grid-cols-[1.1fr_1fr]">
            <ImageBox src={service.image} alt={service.name} className="h-72 w-full md:h-full" />
            <div className="flex flex-col justify-center p-8">
              <p className="text-xs text-ink/65">{village.name} • Sleman</p>
              <h3 className="mt-2 font-serif text-2xl font-semibold">{service.name}</h3>
              <p className="mt-3 text-ink/75">{service.description}</p>
              <div className="mt-6 flex items-end justify-between">
                <div>
                  <p className="text-xs text-ink/65">Mulai dari</p>
                  <p className="font-serif text-xl font-semibold text-terracotta">{rupiah(service.priceFrom!)} / orang</p>
                </div>
                <Link href={`/her-experience/${service.slug}`} className="rounded-lg bg-terracotta px-5 py-2.5 text-sm font-medium text-white hover:bg-terracotta-dark">
                  Lihat Layanan
                </Link>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Preview desa */}
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 md:grid-cols-2">
        <div>
          <p className="text-xs font-medium text-terracotta">Jejaring desa</p>
          <h2 className="mt-2 font-serif text-3xl font-semibold">{village.name}, Sleman, D.I. Yogyakarta</h2>
          <p className="mt-4 text-ink/75">{village.description}</p>
          <Link href={`/her-village/${village.slug}`} className="mt-6 inline-block rounded-lg bg-cream px-5 py-2.5 text-sm font-medium hover:bg-sand/40">
            Jelajahi Desa
          </Link>
        </div>
        {/* Ganti dengan embed Google Maps (FR-VIL-03) saat halaman desa dibuat */}
        <div role="img" aria-label="Peta lokasi Desa Wisata Gabugan"
          className="flex h-64 items-center justify-center rounded-2xl bg-sage/20 text-sm text-ink/50">
          Peta lokasi (Google Maps)
        </div>
      </section>

      {/* Cara kerja + SDG */}
      <section className="bg-cream/60 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <ol className="grid gap-5 md:grid-cols-3">
            {[
              ["Temukan", "Karya & Jasa Lokal", "Telusuri produk kuliner, kerajinan, dan pengalaman wisata langsung dari desa."],
              ["Kenali", "Wajah & Cerita Pembuatnya", "Setiap karya terhubung dengan profil perempuan penggerak di baliknya."],
              ["Terhubung", "Dukung Ekonomi Desa", "Pesan produk atau jadwalkan kunjungan wisata yang berdampak langsung."],
            ].map(([step, title, desc], i) => (
              <li key={step} className="rounded-xl bg-white p-6 shadow-sm">
                <p className="text-xs font-medium text-terracotta">Langkah {i + 1}: {step}</p>
                <h3 className="mt-2 font-serif text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-ink/70">{desc}</p>
              </li>
            ))}
          </ol>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-cream px-6 py-4 text-sm">
            <p className="font-medium">Kontribusi Tujuan Pembangunan Berkelanjutan</p>
            <p className="flex gap-2">
              <span className="rounded bg-white px-3 py-1 text-xs">SDG 5: Kesetaraan Gender</span>
              <span className="rounded bg-white px-3 py-1 text-xs">SDG 8: Ekonomi Inklusif</span>
            </p>
          </div>
        </div>
      </section>

      {/* CTA mitra */}
      <section className="bg-forest text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-8">
          <div>
            <h2 className="font-serif text-2xl font-semibold">Jadi Mitra WaniKarya</h2>
            <p className="mt-1 text-white/80">Bersama memperluas akses pasar dan pendampingan bagi perempuan pelaku usaha desa wisata.</p>
          </div>
          <Link href="/mitra" className="rounded-lg bg-terracotta px-6 py-3 text-sm font-medium hover:bg-terracotta-dark">
            Jadi Mitra WaniKarya
          </Link>
        </div>
      </section>
    </>
  );
}
