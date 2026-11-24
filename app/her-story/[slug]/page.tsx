import { notFound } from "next/navigation";
import Link from "next/link";
import {
  BadgeCheck,
  MapPin,
  CalendarDays,
  ShoppingBag,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  MessageCircle,
  Users,
  Calendar,
  Clock,
} from "lucide-react";
import ImageBox from "@/components/ImageBox";
import ProductCard from "@/components/ProductCard";
import WomanpreneurCard from "@/components/WomanpreneurCard";
import {
  getWomanpreneur,
  getAllWomanpreneurs,
  getVillage,
  getProductsByStore,
  getServicesByStore,
} from "@/lib/queries";
import { rupiah } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const w = getWomanpreneur(slug);
  if (!w) return { title: "Profil Tidak Ditemukan | WaniKarya" };
  return {
    title: `${w.name} (${w.businessName}) | HerStory – WaniKarya`,
    description: `${w.name} - ${w.businessName}. ${w.description}`,
  };
}

export function generateStaticParams() {
  return getAllWomanpreneurs().map((w) => ({ slug: w.slug }));
}

export default async function HerStoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const w = getWomanpreneur(slug);

  if (!w) {
    notFound();
  }

  const village = getVillage(w.villageSlug);
  const prods = getProductsByStore(w.slug);
  const svcs = getServicesByStore(w.slug);
  const others = getAllWomanpreneurs()
    .filter((other) => other.slug !== w.slug)
    .slice(0, 3);

  return (
    <>
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="border-b border-cream bg-paper text-xs text-ink/70">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-6 py-3">
          <Link href="/" className="hover:text-terracotta">
            Beranda
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/her-story" className="hover:text-terracotta">
            HerStory
          </Link>
          <span aria-hidden="true">/</span>
          <span className="font-medium text-ink">{w.name}</span>
        </div>
      </nav>

      {/* Hero Profil */}
      <section className="bg-cream/70 border-b border-cream">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-12 lg:grid-cols-[420px_1fr]">
          {/* Foto & Badges Kiri */}
          <div>
            <div className="relative overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-cream">
              <ImageBox src={w.photo} alt={w.name} className="h-96 w-full object-cover sm:h-[420px]" />
              <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-ink/85 p-3 text-white backdrop-blur-xs">
                <p className="flex items-center gap-1.5 text-xs font-semibold">
                  <BadgeCheck size={16} className="text-sage" /> Womanpreneur Terverifikasi WaniKarya
                </p>
                <p className="mt-1 text-[11px] text-white/80">
                  Menghidupkan komoditas tradisi lereng Gunung Merapi sejak {w.since}.
                </p>
              </div>
            </div>
          </div>

          {/* Info Utama Kanan */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-sage/20 px-3 py-1 text-xs font-semibold text-sage uppercase tracking-wider">
                {w.category}
              </span>
              <span className="flex items-center gap-1 rounded-full bg-sand/30 px-3 py-1 text-xs font-medium text-ink/80">
                <MapPin size={12} className="text-terracotta" /> {village.name}
              </span>
            </div>

            <h1 className="mt-4 font-serif text-4xl font-bold sm:text-5xl">{w.name}</h1>
            <p className="mt-2 text-2xl font-semibold text-terracotta">{w.businessName}</p>

            <div className="mt-6 grid grid-cols-2 gap-4 max-w-md">
              <div className="rounded-2xl bg-white p-4 shadow-xs ring-1 ring-cream">
                <p className="text-[11px] uppercase tracking-wider text-ink/60">Tahun Berdiri</p>
                <p className="mt-1 font-serif text-2xl font-bold text-ink">{w.since}</p>
                <p className="text-[11px] text-ink/70">Aktif memproduksi</p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-xs ring-1 ring-cream">
                <p className="text-[11px] uppercase tracking-wider text-ink/60">Ibu Rumah Tangga</p>
                <p className="mt-1 font-serif text-2xl font-bold text-forest">6–14 Warga</p>
                <p className="text-[11px] text-ink/70">Diberdayakan di RT desa</p>
              </div>
            </div>

            <p className="mt-6 text-base leading-relaxed text-ink/80">{w.description}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={`https://wa.me/6281234567890?text=Halo%20${encodeURIComponent(w.name)},%20saya%20tertarik%20dengan%20karya%20${encodeURIComponent(w.businessName)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-terracotta px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-terracotta-dark"
              >
                <MessageCircle size={16} /> Hubungi Pemilik Usaha
              </a>
              {prods.length > 0 && (
                <a
                  href="#katalog"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-ink/80 ring-1 ring-cream hover:bg-cream"
                >
                  <ShoppingBag size={15} /> Lihat {prods.length} Produk
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Quote Banner */}
      <section className="bg-forest text-white py-12">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="font-serif text-3xl font-light text-sand/80">“</p>
          <blockquote className="font-serif text-xl sm:text-2xl italic leading-relaxed text-white/95 -mt-3">
            {w.quote}
          </blockquote>
          <p className="mt-4 text-xs tracking-wider uppercase text-white/70">
            — {w.name}, Pendiri {w.businessName}
          </p>
        </div>
      </section>

      {/* Narasi Perjalanan Usaha (Jejak Langkah) */}
      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-terracotta">NARASI PERJALANAN USAHA</p>
          <h2 className="mt-2 font-serif text-3xl font-bold">Jejak Langkah & Ketekunan</h2>
          <p className="mt-1 text-sm text-ink/70">
            Kisah ketulusan seorang ibu mengolah potensi lokal menjadi sumber penghidupan berdaulat di lereng Merapi.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-xs ring-1 ring-cream">
            <span className="font-serif text-sm font-bold text-terracotta">01 • AWAL PERJALANAN</span>
            <h3 className="mt-2 font-serif text-lg font-bold text-ink">Langkah Pertama dari Sudut Rumah</h3>
            <p className="mt-2 text-xs leading-relaxed text-ink/75">
              Dimulai dari pawon keluarga dengan peralatan sederhana. Didorong keinginan mandiri serta meringankan beban
              keluarga di masa paceklik panen.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-xs ring-1 ring-cream">
            <span className="font-serif text-sm font-bold text-terracotta">02 • TANTANGAN & HARGA</span>
            <h3 className="mt-2 font-serif text-lg font-bold text-ink">Mengatasi Anjloknya Hasil Bumi</h3>
            <p className="mt-2 text-xs leading-relaxed text-ink/75">
              Harga komoditas mentah seringkali merugikan petani. Inovasi olahan berdaya simpan tinggi membuktikan bahwa
              hasil bumi dapat bernilai hingga berkali-kali lipat.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-xs ring-1 ring-cream">
            <span className="font-serif text-sm font-bold text-terracotta">03 • INOVASI & RESEP</span>
            <h3 className="mt-2 font-serif text-lg font-bold text-ink">Murni Alami Tanpa Kompromi</h3>
            <p className="mt-2 text-xs leading-relaxed text-ink/75">
              Menolak bahan pengawet sintesis maupun pewarna buatan. Mengandalkan kekayaan daun, buah salak segar, dan
              gula kelapa murni warisan resep leluhur.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-xs ring-1 ring-cream">
            <span className="font-serif text-sm font-bold text-terracotta">04 • PEMBERDAYAAN DUSUN</span>
            <h3 className="mt-2 font-serif text-lg font-bold text-ink">Merajut Berdaya Bersama Tetangga</h3>
            <p className="mt-2 text-xs leading-relaxed text-ink/75">
              Mengajak para ibu rumah tangga sekitar untuk belajar sortir panen, mencelup kain, menganyam bambu, hingga
              pengemasan ramah lingkungan.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-xs ring-1 ring-cream">
            <span className="font-serif text-sm font-bold text-terracotta">05 • GENERASI PENERUS</span>
            <h3 className="mt-2 font-serif text-lg font-bold text-ink">Menyambung Tradisi ke Generasi Muda</h3>
            <p className="mt-2 text-xs leading-relaxed text-ink/75">
              Membuka pintu pawon bagi anak-anak muda desa dan wisatawan yang ingin mengenal seni canting, jamu gendong,
              maupun olahan pangan desa.
            </p>
          </div>

          <div className="rounded-2xl bg-cream/60 p-6 flex flex-col justify-between">
            <div>
              <span className="font-serif text-sm font-bold text-sage">06 • JEJARING DESA</span>
              <h3 className="mt-2 font-serif text-lg font-bold text-forest">Bagian dari {village.name}</h3>
              <p className="mt-2 text-xs leading-relaxed text-ink/75">
                Usaha ini terdaftar dan diverifikasi oleh Pokdarwis desa wisata Gabugan sebagai pilar ekonomi perempuan.
              </p>
            </div>
            <Link
              href={`/her-village/${village.slug}`}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-terracotta hover:underline"
            >
              Jelajahi Profil Desa Gabugan <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      {/* Katalog Produk & Layanan dari Toko ini */}
      <section id="katalog" className="bg-cream/40 py-14 border-t border-cream">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-terracotta">KATALOG RESMI</p>
              <h2 className="font-serif text-3xl font-bold">Karya Olahan & Layanan Wisata</h2>
              <p className="mt-1 text-sm text-ink/70">Karya asli buatan {w.businessName}</p>
            </div>
            <Link href="/her-market" className="text-sm font-semibold text-terracotta hover:underline">
              Lihat Seluruh HerMarket →
            </Link>
          </div>

          {prods.length === 0 && svcs.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center ring-1 ring-cream">
              <p className="font-serif text-lg font-semibold">Katalog Sedang Diperbarui</p>
              <p className="text-xs text-ink/70 mt-1">
                Pengrajin saat ini melayani pesanan khusus dan kunjungan sanggar langsung.
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              {prods.length > 0 && (
                <div>
                  <h3 className="font-serif text-xl font-bold text-ink mb-4 flex items-center gap-2">
                    <ShoppingBag size={18} className="text-terracotta" /> Produk Toko ({prods.length})
                  </h3>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {prods.map((prod) => (
                      <ProductCard key={prod.slug} p={prod} />
                    ))}
                  </div>
                </div>
              )}

              {svcs.length > 0 && (
                <div>
                  <h3 className="font-serif text-xl font-bold text-ink mb-4 flex items-center gap-2">
                    <Sparkles size={18} className="text-sage" /> Jasa & Pengalaman Wisata ({svcs.length})
                  </h3>
                  <div className="grid gap-6 md:grid-cols-2">
                    {svcs.map((svc) => (
                      <article
                        key={svc.slug}
                        className="grid overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-cream sm:grid-cols-[200px_1fr]"
                      >
                        <ImageBox src={svc.image} alt={svc.name} className="h-44 w-full object-cover sm:h-full" />
                        <div className="flex flex-col p-5">
                          <span className="text-xs font-semibold text-sage">{svc.category}</span>
                          <h4 className="mt-1 font-serif text-lg font-bold">
                            <Link href={`/her-experience/${svc.slug}`} className="hover:text-terracotta">
                              {svc.name}
                            </Link>
                          </h4>
                          <p className="mt-2 line-clamp-2 text-xs text-ink/70">{svc.description}</p>
                          <div className="mt-auto flex items-end justify-between pt-4">
                            <p className="font-serif text-sm font-bold text-terracotta">
                              Mulai {rupiah(svc.priceFrom ?? 0)}
                            </p>
                            <Link
                              href={`/her-experience/${svc.slug}`}
                              className="rounded-lg bg-terracotta px-3 py-1.5 text-xs font-semibold text-white hover:bg-terracotta-dark"
                            >
                              Lihat Layanan
                            </Link>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Terhubung Langsung & Form Pesan WhatsApp */}
      <section id="pesan" className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-8 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-cream lg:grid-cols-2">
          <div>
            <span className="rounded-full bg-sage/20 px-3 py-1 text-xs font-semibold text-sage uppercase tracking-wider">
              TERHUBUNG LANGSUNG
            </span>
            <h2 className="mt-3 font-serif text-3xl font-bold">
              Mari Bersilaturahmi dengan {w.businessName}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink/75">
              {w.name} siap melayani pesanan skala oleh-oleh maupun suvenir acara, kemitraan reseller kuliner, serta
              reservasi rombongan jelajah kebun dan sanggar kriya desa.
            </p>

            <div className="mt-6 space-y-4 text-xs text-ink/80">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-terracotta shrink-0 mt-0.5" />
                <div>
                  <strong>Alamat Sanggar & Pawon:</strong>
                  <p>RT 03 / RW 08 Dusun Gabugan, Donokerto, Turi, Sleman, D.I. Yogyakarta 55551</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock size={18} className="text-sage shrink-0 mt-0.5" />
                <div>
                  <strong>Jam Pelayanan Kunjungan:</strong>
                  <p>Senin – Minggu: 08.00 – 16.30 WIB (Disarankan dengan Perjanjian)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form WhatsApp CTA */}
          <div className="rounded-2xl bg-cream/50 p-6 ring-1 ring-cream">
            <h3 className="font-serif text-xl font-bold text-ink">Kirim Pesan ke {w.name}</h3>
            <p className="mt-1 text-xs text-ink/70">
              Pesan Anda akan diteruskan langsung ke WhatsApp pengrajin untuk konfirmasi ketersediaan stok & jadwal.
            </p>

            <form
              action={`https://wa.me/6281234567890`}
              target="_blank"
              className="mt-4 space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold text-ink/80 mb-1">Nama Anda</label>
                <input
                  type="text"
                  placeholder="Contoh: Rian Pratama"
                  className="w-full rounded-xl bg-white px-3 py-2 ring-1 ring-cream outline-none"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-ink/80 mb-1">Keperluan / Minat Pesanan</label>
                <select className="w-full rounded-xl bg-white px-3 py-2 ring-1 ring-cream outline-none">
                  <option>Beli Produk Olahan / Kriya</option>
                  <option>Reservasi Pengalaman Wisata Edukasi</option>
                  <option>Pesanan Jumlah Besar / Suvenir</option>
                  <option>Tanya Informasi Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-ink/80 mb-1">Catatan Tambahan</label>
                <textarea
                  rows={2}
                  placeholder="Tuliskan produk atau rencana tanggal kunjungan Anda…"
                  className="w-full rounded-xl bg-white px-3 py-2 ring-1 ring-cream outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-terracotta py-3 font-semibold text-white shadow-sm transition-colors hover:bg-terracotta-dark"
              >
                Hubungi via WhatsApp
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Profil Rekomendasi Lain */}
      {others.length > 0 && (
        <section className="bg-cream/40 py-14 border-t border-cream">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-terracotta">INSPIRASI LAINNYA</p>
                <h2 className="font-serif text-2xl font-bold">Womanpreneur Lain di Gabugan</h2>
              </div>
              <Link href="/her-story" className="text-sm font-semibold text-terracotta hover:underline">
                Lihat Semua ({getAllWomanpreneurs().length}) →
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((other) => (
                <WomanpreneurCard key={other.slug} w={other} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
