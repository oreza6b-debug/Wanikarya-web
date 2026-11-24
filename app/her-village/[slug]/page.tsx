import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Phone, Mail, Clock, ArrowRight, ArrowLeft, ShieldCheck } from "lucide-react";
import ImageBox from "@/components/ImageBox";
import ProductCard from "@/components/ProductCard";
import WomanpreneurCard from "@/components/WomanpreneurCard";
import { getVillage, getAllVillages, getProducts, getServices, getWomanpreneurs } from "@/lib/queries";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const v = getVillage(slug);
  if (!v) return { title: "Desa Tidak Ditemukan | WaniKarya" };
  return {
    title: `${v.name} | HerVillage – WaniKarya`,
    description: v.description,
  };
}

export function generateStaticParams() {
  return getAllVillages().map((v) => ({ slug: v.slug }));
}

export default async function VillageDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const v = getVillage(slug);

  if (!v) {
    notFound();
  }

  const villageProducts = getProducts({ desa: v.slug });
  const villageWps = getWomanpreneurs({ desa: v.slug });

  return (
    <>
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="border-b border-cream bg-paper text-xs text-ink/70">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-6 py-3">
          <Link href="/" className="hover:text-terracotta">
            Beranda
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/her-village" className="hover:text-terracotta">
            HerVillage
          </Link>
          <span aria-hidden="true">/</span>
          <span className="font-medium text-ink">{v.name}</span>
        </div>
      </nav>

      {/* Hero Desa */}
      <section className="bg-cream/70 border-b border-cream">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-12 lg:grid-cols-2">
          <div>
            <span className="rounded-full bg-sage/20 px-3 py-1 text-xs font-semibold text-sage uppercase tracking-wider">
              {v.badge}
            </span>
            <h1 className="mt-4 font-serif text-4xl font-bold sm:text-5xl">{v.name}</h1>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-ink/65">
              <MapPin size={13} className="text-terracotta" /> {v.location}
            </p>
            <p className="mt-4 text-base leading-relaxed text-ink/80">{v.description}</p>

            <div className="mt-6 grid grid-cols-3 gap-3 text-xs">
              <div className="rounded-xl bg-white p-3 ring-1 ring-cream">
                <span className="text-ink/60">Sentra Usaha</span>
                <p className="font-serif text-xl font-bold text-terracotta">{v.clusters} Klaster</p>
              </div>
              <div className="rounded-xl bg-white p-3 ring-1 ring-cream">
                <span className="text-ink/60">Fasilitas Wisata</span>
                <p className="font-semibold text-ink mt-1">{v.facilities}</p>
              </div>
              <div className="rounded-xl bg-white p-3 ring-1 ring-cream">
                <span className="text-ink/60">Womanpreneur</span>
                <p className="font-serif text-xl font-bold text-forest">{villageWps.length} Terdaftar</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#womanpreneurs"
                className="rounded-xl bg-terracotta px-5 py-2.5 text-xs font-semibold text-white hover:bg-terracotta-dark"
              >
                Kenali Womanpreneur Desa
              </a>
              <Link
                href="/her-village"
                className="inline-flex items-center gap-1.5 rounded-xl bg-white px-5 py-2.5 text-xs font-semibold text-ink/80 ring-1 ring-cream hover:bg-cream"
              >
                <ArrowLeft size={13} /> Seluruh Desa
              </Link>
            </div>
          </div>

          <div>
            <div className="overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-cream">
              <ImageBox src="/images/hero.jpg" alt={v.name} className="h-80 w-full object-cover sm:h-96" />
            </div>
          </div>
        </div>
      </section>

      {/* Womanpreneurs di Desa Ini */}
      <section id="womanpreneurs" className="mx-auto max-w-7xl px-6 py-14">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-terracotta">HERSTORY</p>
            <h2 className="font-serif text-3xl font-bold">Womanpreneur di {v.name}</h2>
          </div>
          <Link href="/her-story" className="text-sm font-semibold text-terracotta hover:underline">
            Lihat Semua Sosok →
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {villageWps.map((wp) => (
            <WomanpreneurCard key={wp.slug} w={wp} />
          ))}
        </div>
      </section>

      {/* Produk Unggulan Desa Ini */}
      {villageProducts.length > 0 && (
        <section className="bg-cream/40 py-14 border-t border-cream">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-terracotta">HERMARKET</p>
                <h2 className="font-serif text-3xl font-bold">Produk Asli dari {v.name}</h2>
              </div>
              <Link href="/her-market" className="text-sm font-semibold text-terracotta hover:underline">
                Lihat Seluruh Produk →
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {villageProducts.map((prod) => (
                <ProductCard key={prod.slug} p={prod} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
