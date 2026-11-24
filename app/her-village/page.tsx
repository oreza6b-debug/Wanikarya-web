import Link from "next/link";
import {
  Search,
  MapPin,
  ArrowRight,
  Sparkles,
  Home,
  Users,
  Compass,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
} from "lucide-react";
import ImageBox from "@/components/ImageBox";
import ProductCard from "@/components/ProductCard";
import { villages, womanpreneurs, products, services } from "@/lib/data";
import { rupiah } from "@/lib/format";

export const metadata = {
  title: "HerVillage | WaniKarya",
  description:
    "Menelusuri pesona desa-desa wisata tempat bertumbuhnya kemandirian dan kreativitas perempuan nusantara.",
};

export default function HerVillagePage() {
  const v = villages[0]; // Desa Wisata Gabugan
  const featuredProds = products.slice(0, 3);
  const villageServices = services.slice(0, 3);
  const villageWps = womanpreneurs.slice(0, 4);

  return (
    <>
      {/* Header & Filter Bar */}
      <section className="bg-cream/70 border-b border-cream">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="max-w-3xl">
            <p className="inline-block rounded-full bg-sage/20 px-3 py-1 text-xs font-semibold text-sage">
              JEJARING DESA BERDAYA
            </p>
            <h1 className="mt-4 font-serif text-5xl font-bold">HerVillage</h1>
            <p className="mt-4 text-lg text-ink/80 leading-relaxed">
              Menelusuri pesona desa-desa wisata tempat bertumbuhnya kemandirian dan kreativitas perempuan nusantara.
            </p>
          </div>

          {/* Form Pencarian & Filter Desa */}
          <div className="mt-8 grid gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-cream sm:grid-cols-4">
            <div className="flex items-center gap-2 rounded-xl bg-cream/50 px-3 py-2 text-xs ring-1 ring-cream sm:col-span-1">
              <Search size={15} className="text-terracotta" />
              <input
                placeholder="Cari nama desa atau kawasan…"
                defaultValue="Gabugan"
                className="w-full bg-transparent outline-none"
              />
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-cream/50 px-3 py-2 text-xs ring-1 ring-cream">
              <span className="text-ink/60">Kabupaten:</span>
              <select className="w-full bg-transparent outline-none font-medium text-ink">
                <option>Sleman</option>
                <option>Bantul</option>
                <option>Kulon Progo</option>
              </select>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-cream/50 px-3 py-2 text-xs ring-1 ring-cream">
              <span className="text-ink/60">Potensi:</span>
              <select className="w-full bg-transparent outline-none font-medium text-ink">
                <option>Semua Potensi</option>
                <option>Agrowisata Salak</option>
                <option>Kriya Batik Alami</option>
                <option>Kuliner Tradisional</option>
              </select>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-cream/50 px-3 py-2 text-xs ring-1 ring-cream">
              <span className="text-ink/60">Urutan:</span>
              <select className="w-full bg-transparent outline-none font-medium text-ink">
                <option>Urutan A–Z</option>
                <option>Rekomendasi Utama</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Pilot Partner Card */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <article className="overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-cream lg:grid lg:grid-cols-2">
          <div className="relative">
            <ImageBox src="/images/hero.jpg" alt={v.name} className="h-80 w-full object-cover lg:h-full" />
            <span className="absolute left-4 top-4 rounded-full bg-terracotta px-3 py-1 text-xs font-semibold text-white">
              PILOT PARTNER • {v.badge}
            </span>
            <span className="absolute bottom-4 left-4 rounded-md bg-ink/75 px-3 py-1 text-xs text-white backdrop-blur-xs">
              Ketinggian: 450–500 mdpl • Lereng Selatan Gunung Merapi
            </span>
          </div>

          <div className="flex flex-col justify-between p-8 sm:p-10">
            <div>
              <p className="flex items-center gap-1.5 text-xs text-ink/65">
                <MapPin size={13} className="text-terracotta" /> {v.location}
              </p>
              <h2 className="mt-2 font-serif text-3xl font-bold sm:text-4xl text-ink">{v.name}</h2>
              <p className="mt-4 text-sm leading-relaxed text-ink/80">{v.description}</p>

              <div className="mt-6 flex flex-wrap gap-2 text-xs">
                <span className="rounded-lg bg-cream px-3 py-1 font-medium text-terracotta">
                  🌿 Agrowisata Salak Pondoh
                </span>
                <span className="rounded-lg bg-cream px-3 py-1 font-medium text-terracotta">
                  🎨 Kriya Batik Alami
                </span>
                <span className="rounded-lg bg-cream px-3 py-1 font-medium text-terracotta">
                  🍲 Kuliner Pawon Ndeso
                </span>
                <span className="rounded-lg bg-cream px-3 py-1 font-medium text-terracotta">
                  🏡 Homestay Omah Joglo
                </span>
              </div>
            </div>

            <div className="mt-8 border-t border-cream pt-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-6 text-xs text-ink/70">
                <div>
                  <p className="font-serif text-2xl font-bold text-terracotta">{v.clusters}+</p>
                  <p className="text-[11px]">Klaster Sentra</p>
                </div>
                <div>
                  <p className="font-serif text-2xl font-bold text-forest">{services.length}+</p>
                  <p className="text-[11px]">Paket Wisata</p>
                </div>
                <div>
                  <p className="font-serif text-2xl font-bold text-ink">{womanpreneurs.length}+</p>
                  <p className="text-[11px]">Womanpreneur</p>
                </div>
              </div>

              <Link
                href={`/her-village/${v.slug}`}
                className="inline-flex items-center gap-2 rounded-xl bg-terracotta px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-terracotta-dark transition-colors"
              >
                Jelajahi Profil Desa <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </article>
      </section>

      {/* Dokumentasi & Pilar Potensi Desa */}
      <section className="bg-cream/40 py-16 border-t border-cream">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-semibold uppercase tracking-wider text-terracotta">EMPAT KEKUATAN LOKAL</p>
            <h2 className="mt-2 font-serif text-3xl font-bold">Pilar Potensi Desa Wisata Gabugan</h2>
            <p className="mt-2 text-sm text-ink/75">
              Komprehensivitas potensi Gabugan yang terintegrasi langsung dengan program penguatan ekonomi perempuan.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-white p-6 shadow-xs ring-1 ring-cream">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-sage/20 text-sage mb-4 text-xl">
                🌱
              </span>
              <h3 className="font-serif text-lg font-bold">Agrowisata Salak Pondoh</h3>
              <p className="mt-2 text-xs leading-relaxed text-ink/70">
                Ratusan hektar kebun salak organik bersertifikat. Wisatawan dapat memetik langsung buah matang pohon
                didampingi pemandu wanita tani.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-xs ring-1 ring-cream">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-terracotta/20 text-terracotta mb-4 text-xl">
                🏮
              </span>
              <h3 className="font-serif text-lg font-bold">Budaya Wiwitan & Gamelan</h3>
              <p className="mt-2 text-xs leading-relaxed text-ink/70">
                Upacara syukur panen Wiwitan lestari, latihan gamelan perempuan desa di pendopo malam hari, dan tari bekakak
                penyambutan tamu.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-xs ring-1 ring-cream">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-sand/30 text-terracotta mb-4 text-xl">
                🧶
              </span>
              <h3 className="font-serif text-lg font-bold">Kriya Batik & Anyaman</h3>
              <p className="mt-2 text-xs leading-relaxed text-ink/70">
                Sentra kreasi motif daun salak khas Gabugan dengan pewarna ramah lingkungan indigofera dan kulit manggis,
                serta anyaman bambu tali rapi.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-xs ring-1 ring-cream">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-forest/20 text-forest mb-4 text-xl">
                🌳
              </span>
              <h3 className="font-serif text-lg font-bold">Edukasi Ekosistem Desa</h3>
              <p className="mt-2 text-xs leading-relaxed text-ink/70">
                Laboratorium hidup pengelolaan sampah mandiri, budidaya mina padi (padi & ikan), dan konservasi burung hantu
                Tyto alba sahabat petani.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Produk Unggulan Gabugan */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-terracotta">HERMARKET GABUGAN</p>
            <h2 className="font-serif text-3xl font-bold">Produk Unggulan Karya Desa</h2>
          </div>
          <Link href="/her-market" className="text-sm font-semibold text-terracotta hover:underline">
            Lihat Semua Produk →
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProds.map((prod) => (
            <ProductCard key={prod.slug} p={prod} />
          ))}
        </div>
      </section>

      {/* Paket & Layanan Wisata Desa */}
      <section className="bg-cream/40 py-16 border-t border-cream">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-terracotta">HEREXPERIENCE GABUGAN</p>
              <h2 className="font-serif text-3xl font-bold">Paket & Layanan Wisata</h2>
            </div>
            <Link href="/her-experience" className="text-sm font-semibold text-terracotta hover:underline">
              Lihat Semua Pengalaman →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {villageServices.map((svc) => (
              <article
                key={svc.slug}
                className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-cream transition-all hover:shadow-md"
              >
                <ImageBox src={svc.image} alt={svc.name} className="h-52 w-full object-cover" />
                <div className="flex flex-1 flex-col p-5">
                  <span className="text-xs font-semibold text-sage">{svc.category}</span>
                  <h3 className="mt-1 font-serif text-lg font-bold">
                    <Link href={`/her-experience/${svc.slug}`} className="hover:text-terracotta">
                      {svc.name}
                    </Link>
                  </h3>
                  <p className="mt-2 line-clamp-2 text-xs text-ink/70">{svc.description}</p>
                  <div className="mt-auto flex items-end justify-between border-t border-cream/70 pt-4">
                    <span className="font-serif text-base font-bold text-terracotta">{rupiah(svc.priceFrom ?? 0)}</span>
                    <Link
                      href={`/her-experience/${svc.slug}`}
                      className="rounded-lg bg-terracotta px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-terracotta-dark"
                    >
                      Reservasi
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Womanpreneur Penggerak Utama Desa */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-terracotta">HERSTORY GABUGAN</p>
            <h2 className="font-serif text-3xl font-bold">Womanpreneur Penggerak Utama</h2>
          </div>
          <Link href="/her-story" className="text-sm font-semibold text-terracotta hover:underline">
            Lihat Semua Sosok →
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {villageWps.map((wp) => (
            <Link
              key={wp.slug}
              href={`/her-story/${wp.slug}`}
              className="flex flex-col items-center rounded-2xl bg-white p-6 text-center shadow-xs ring-1 ring-cream transition-all hover:shadow-md group"
            >
              <ImageBox src={wp.photo} alt={wp.name} className="h-28 w-28 rounded-full object-cover ring-2 ring-cream" />
              <h3 className="mt-4 font-serif text-lg font-bold group-hover:text-terracotta">{wp.name}</h3>
              <p className="text-xs font-semibold text-terracotta">{wp.businessName}</p>
              <p className="mt-2 line-clamp-2 text-xs text-ink/70">{wp.description}</p>
              <span className="mt-4 text-xs font-semibold text-sage group-hover:underline">Kenali Profil →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Lokasi & Petunjuk Arah */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="grid gap-8 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-cream lg:grid-cols-[1.3fr_1fr]">
          <div>
            <h3 className="font-serif text-2xl font-bold">Lokasi & Petunjuk Arah</h3>
            <p className="mt-2 text-xs text-ink/75">
              Jalan Gabugan, Padukuhan Gabugan, Kalurahan Donokerto, Kapanewon Turi, Kabupaten Sleman, D.I. Yogyakarta 55551.
            </p>
            <div className="mt-4 overflow-hidden rounded-2xl bg-sage/10 p-8 text-center text-xs text-ink/65 ring-1 ring-sage/20">
              <MapPin size={28} className="mx-auto text-terracotta mb-2" />
              <p className="font-semibold text-ink">Peta Interaktif Desa Wisata Gabugan</p>
              <p className="mt-1">Berjarak sekitar 21 km (±45 menit) ke arah utara dari Titik Nol Kilometer Kota Yogyakarta.</p>
              <a
                href="https://maps.google.com/?q=Desa+Wisata+Gabugan+Sleman"
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-terracotta px-4 py-2 text-xs font-semibold text-white hover:bg-terracotta-dark"
              >
                Buka di Google Maps ↗
              </a>
            </div>
          </div>

          <div className="rounded-2xl bg-cream/50 p-6 ring-1 ring-cream flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-forest">SEKRETARIAT RESMI</p>
              <h4 className="mt-2 font-serif text-xl font-bold">Pengelola Desa Wisata Gabugan</h4>
              <p className="mt-2 text-xs text-ink/75 leading-relaxed">
                Hubungi pengelola untuk pemesanan paket rombongan, studi banding, atau reservasi homestay.
              </p>

              <div className="mt-6 space-y-3 text-xs text-ink/80">
                <p className="flex items-center gap-2">
                  <Phone size={14} className="text-terracotta" /> +62 812-3456-7890
                </p>
                <p className="flex items-center gap-2">
                  <Mail size={14} className="text-sage" /> wisata@gabugan-sleman.desa.id
                </p>
                <p className="flex items-center gap-2">
                  <Clock size={14} className="text-forest" /> Buka Setiap Hari: 08.00 – 17.00 WIB
                </p>
              </div>
            </div>

            <a
              href="https://wa.me/6281234567890?text=Halo%20Pengelola%20Desa%20Wisata%20Gabugan"
              target="_blank"
              rel="noreferrer"
              className="mt-6 block rounded-xl bg-forest py-3 text-center text-xs font-semibold text-white hover:bg-forest/90"
            >
              Hubungi Pengelola Desa via WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
