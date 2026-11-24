import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBag,
  MapPin,
  Star,
  ShieldCheck,
  Truck,
  Heart,
  Share2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import ImageBox from "@/components/ImageBox";
import ProductCard from "@/components/ProductCard";
import { getProduct, getAllProducts, getStore, getVillage, finalPrice, getProductsByStore } from "@/lib/queries";
import { rupiah } from "@/lib/format";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) return { title: "Produk Tidak Ditemukan | WaniKarya" };
  return {
    title: `${p.name} | HerMarket – WaniKarya`,
    description: p.description,
  };
}

export function generateStaticParams() {
  return getAllProducts().map((p) => ({ slug: p.slug }));
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProduct(slug);

  if (!p) {
    notFound();
  }

  const store = getStore(p.storeSlug);
  const village = getVillage(store.villageSlug);
  const price = finalPrice(p);
  const soldOut = p.stock === 0;
  const sameStoreProducts = getProductsByStore(p.storeSlug)
    .filter((other) => other.slug !== p.slug)
    .slice(0, 3);

  return (
    <>
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="border-b border-cream bg-paper text-xs text-ink/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-terracotta">
              Beranda
            </Link>
            <span aria-hidden="true">/</span>
            <Link href="/her-market" className="hover:text-terracotta">
              HerMarket
            </Link>
            <span aria-hidden="true">/</span>
            <span className="capitalize text-ink/60">{p.categorySlug}</span>
            <span aria-hidden="true">/</span>
            <span className="font-medium text-ink">{p.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1 text-ink/65 hover:text-terracotta">
              <Share2 size={13} /> Bagikan
            </button>
            <button className="flex items-center gap-1 text-ink/65 hover:text-terracotta">
              <Heart size={13} /> Simpan
            </button>
          </div>
        </div>
      </nav>

      {/* Detail Utama Produk */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Sisi Kiri: Foto Produk */}
          <div>
            <div className="relative overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-cream">
              <ImageBox src={p.image} alt={p.name} className="h-96 w-full object-cover sm:h-[460px]" dim={soldOut} />
              {p.promoPercent && !soldOut && (
                <span className="absolute left-4 top-4 rounded-lg bg-terracotta px-3 py-1 text-xs font-semibold text-white shadow-xs">
                  Diskon {p.promoPercent}%
                </span>
              )}
              {p.label && (
                <span className="absolute bottom-4 left-4 rounded-lg bg-cream/95 px-3 py-1 text-xs font-medium text-terracotta backdrop-blur-xs">
                  {p.label}
                </span>
              )}
            </div>

            {/* Badges Keaslian */}
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-ink/75">
              <div className="flex items-center gap-2 rounded-xl bg-cream/60 p-3">
                <ShieldCheck size={18} className="text-sage" />
                <span>Langsung dari sanggar/pawon {store.name} tanpa perantara</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-cream/60 p-3">
                <Truck size={18} className="text-terracotta" />
                <span>Dikirim langsung dari {village.name}, Sleman</span>
              </div>
            </div>
          </div>

          {/* Sisi Kanan: Spesifikasi & Pembelian */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-xs text-ink/65">
              <span className="capitalize">{p.categorySlug}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-amber-600 font-medium">
                <Star size={13} fill="currentColor" /> 4.9 (38 ulasan)
              </span>
            </div>

            <h1 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">{p.name}</h1>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-ink/65">
              <MapPin size={13} className="text-terracotta" />
              {village.location}
            </p>

            {/* Box Harga */}
            <div className="mt-6 rounded-2xl bg-cream/50 p-5 ring-1 ring-cream">
              <div className="flex items-baseline gap-3">
                <span className="font-serif text-3xl font-bold text-terracotta">{rupiah(price)}</span>
                {p.promoPercent && (
                  <>
                    <span className="text-sm text-ink/50 line-through">{rupiah(p.price)}</span>
                    <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                      Hemat {rupiah(p.price - price)} ({p.promoPercent}%)
                    </span>
                  </>
                )}
              </div>
              <p className="mt-2 text-xs text-ink/70">
                {soldOut ? (
                  <span className="font-semibold text-red-600">Stok habis terpesan saat ini</span>
                ) : (
                  <span>Status Stok: Tersedia {p.stock} bungkus siap kirim</span>
                )}
              </p>
            </div>

            {/* Cerita Produk */}
            <div className="mt-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-terracotta">Cerita & Rasa Khas</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink/80">{p.description}</p>
            </div>

            {/* Spesifikasi Teknis */}
            <div className="mt-6 grid grid-cols-2 gap-3 rounded-xl bg-white p-4 text-xs ring-1 ring-cream">
              <div>
                <span className="text-ink/60">Berat / Takaran</span>
                <p className="mt-0.5 font-medium text-ink">{p.weight || "150–250 gram"}</p>
              </div>
              <div>
                <span className="text-ink/60">Kemasan</span>
                <p className="mt-0.5 font-medium text-ink">{p.packaging || "Kedap Udara Ramah Lingkungan"}</p>
              </div>
              <div>
                <span className="text-ink/60">Dapur / Sanggar</span>
                <p className="mt-0.5 font-medium text-ink">{store.businessName}</p>
              </div>
              <div>
                <span className="text-ink/60">Sertifikasi & Mutu</span>
                <p className="mt-0.5 font-medium text-sage">P-IRT Desa & Halal Indonesia</p>
              </div>
            </div>

            {/* Tombol Pesan */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {soldOut ? (
                <button
                  disabled
                  className="w-full rounded-xl bg-cream py-3.5 text-center text-sm font-semibold text-ink/50"
                >
                  Habis Terjual (Sedang Diproduksi Ulang)
                </button>
              ) : (
                <>
                  <Link
                    href={`/her-story/${store.slug}#pesan`}
                    className="flex-1 rounded-xl bg-terracotta py-3.5 text-center text-sm font-semibold text-white shadow-sm transition-colors hover:bg-terracotta-dark"
                  >
                    Pesan Sekarang Langsung via Pengrajin
                  </Link>
                  <Link
                    href="/her-market"
                    className="rounded-xl bg-cream px-5 py-3.5 text-sm font-medium text-ink/80 hover:bg-sand/40"
                  >
                    Katalog Lainnya
                  </Link>
                </>
              )}
            </div>

            {/* Profil Pembuat */}
            <div className="mt-8 rounded-2xl bg-paper p-5 ring-1 ring-cream">
              <div className="flex items-center gap-4">
                <ImageBox src={store.photo} alt={store.name} className="h-14 w-14 rounded-full" />
                <div className="flex-1">
                  <p className="text-xs text-ink/65">Profil Pembuat</p>
                  <h3 className="font-serif text-lg font-semibold">{store.businessName}</h3>
                  <p className="text-xs text-terracotta">{store.name} • Penggerak Desa Gabugan</p>
                </div>
                <Link
                  href={`/her-story/${store.slug}`}
                  className="rounded-lg bg-cream px-3 py-1.5 text-xs font-medium text-terracotta hover:bg-sand/40"
                >
                  Lihat Profil →
                </Link>
              </div>
              <blockquote className="mt-3 border-t border-cream/70 pt-3 font-serif text-xs italic text-ink/75">
                “{store.quote}”
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* Nilai Berkelanjutan */}
      <section className="bg-sage text-white py-12">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-6 md:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="text-xs font-medium text-white/80">Pemberdayaan Berkelanjutan</p>
            <h2 className="mt-2 font-serif text-3xl font-semibold leading-snug">
              Dari Petik Segar Lereng Merapi Hingga Meja Anda
            </h2>
            <p className="mt-4 max-w-xl text-white/85 text-sm leading-relaxed">
              Setiap pembelian {p.name} secara langsung mendukung kesejahteraan keluarga perajin di Kelompok Wanita Tani
              (KWT) dan sanggar lokal Desa Wisata Gabugan tanpa potongan komisi yang memberatkan.
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 p-6 text-sm">
            <p className="font-semibold text-lg">100% Bahan Baku Lokal</p>
            <p className="mt-1 text-white/80">Dihasilkan dalam radius 500 meter dari kebun dan pawon desa.</p>
          </div>
        </div>
      </section>

      {/* Produk Lain dari Pembuat yang Sama */}
      {sameStoreProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-14">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-xs font-medium text-terracotta">Pilihan Otentik Lainnya</p>
              <h2 className="font-serif text-2xl font-semibold">Karya Lain dari {store.businessName}</h2>
            </div>
            <Link href={`/her-story/${store.slug}`} className="text-sm font-medium text-terracotta hover:underline">
              Lihat Semua Produk →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sameStoreProducts.map((prod) => (
              <ProductCard key={prod.slug} p={prod} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
