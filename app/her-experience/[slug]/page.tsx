import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  Users,
  Languages,
  MapPin,
  CheckCircle2,
  AlertCircle,
  CalendarDays,
  ArrowRight,
  ShieldCheck,
  MessageCircle,
} from "lucide-react";
import ImageBox from "@/components/ImageBox";
import { getService, getAllServices, getStore, getVillage, getServices } from "@/lib/queries";
import { rupiah } from "@/lib/format";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = getService(slug);
  if (!s) return { title: "Pengalaman Tidak Ditemukan | WaniKarya" };
  return {
    title: `${s.name} | HerExperience – WaniKarya`,
    description: s.description,
  };
}

export function generateStaticParams() {
  return getAllServices().map((s) => ({ slug: s.slug }));
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = getService(slug);

  if (!s) {
    notFound();
  }

  const store = getStore(s.storeSlug);
  const village = getVillage(store.villageSlug);
  const relatedServices = getServices()
    .filter((other) => other.slug !== s.slug)
    .slice(0, 2);

  return (
    <>
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="border-b border-cream bg-paper text-xs text-ink/70">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-6 py-3">
          <Link href="/" className="hover:text-terracotta">
            Beranda
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/her-experience" className="hover:text-terracotta">
            HerExperience
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-ink/60">{s.category}</span>
          <span aria-hidden="true">/</span>
          <span className="font-medium text-ink">{s.name}</span>
        </div>
      </nav>

      {/* Header Info */}
      <section className="mx-auto max-w-7xl px-6 pt-10 pb-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs">
              <span className="rounded-full bg-sage/20 px-3 py-1 font-semibold text-sage uppercase tracking-wider">
                {s.category}
              </span>
              <span className="flex items-center gap-1 text-ink/65">
                <MapPin size={12} className="text-terracotta" /> {village.location}
              </span>
            </div>
            <h1 className="mt-3 font-serif text-3xl font-bold sm:text-4xl lg:text-5xl">{s.name}</h1>
          </div>
          <div className="rounded-2xl bg-cream/70 p-4 text-right ring-1 ring-cream">
            <p className="text-xs text-ink/65">Biaya Partisipasi</p>
            <p className="font-serif text-3xl font-bold text-terracotta">
              {rupiah(s.priceFrom ?? 0)}
              <span className="text-sm font-normal text-ink/70"> / orang</span>
            </p>
          </div>
        </div>

        {/* Galeri Foto Layanan */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2 overflow-hidden rounded-2xl bg-cream shadow-sm">
            <ImageBox src={s.image} alt={s.name} className="h-80 w-full object-cover sm:h-96" />
          </div>
          <div className="grid grid-rows-2 gap-4">
            <div className="overflow-hidden rounded-2xl bg-cream shadow-sm">
              <ImageBox src="/images/market-2.jpg" alt="Pawon Tradisional" className="h-44 w-full object-cover" />
            </div>
            <div className="overflow-hidden rounded-2xl bg-cream shadow-sm">
              <ImageBox src="/images/market-1.jpg" alt="Suasana Sanggar Desa" className="h-44 w-full object-cover" />
            </div>
          </div>
        </div>

        {/* Bar Indikator Cepat */}
        <div className="mt-6 grid grid-cols-2 gap-3 rounded-2xl bg-cream/60 p-5 sm:grid-cols-4 text-xs ring-1 ring-cream">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-terracotta shadow-xs">
              <Clock size={18} />
            </div>
            <div>
              <p className="text-ink/60">Durasi</p>
              <p className="font-semibold text-ink">{s.duration}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sage shadow-xs">
              <Users size={18} />
            </div>
            <div>
              <p className="text-ink/60">Kapasitas Grup</p>
              <p className="font-semibold text-ink">2 – 15 Orang</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-terracotta shadow-xs">
              <Languages size={18} />
            </div>
            <div>
              <p className="text-ink/60">Bahasa Pemandu</p>
              <p className="font-semibold text-ink">Indonesia & Jawa</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-forest shadow-xs">
              <MapPin size={18} />
            </div>
            <div>
              <p className="text-ink/60">Titik Kumpul</p>
              <p className="font-semibold text-ink">Sanggar {store.businessName}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Konten Rinci & Sidebar Pemesanan */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr]">
          {/* Kolom Kiri: Uraian Kegiatan */}
          <div className="space-y-8">
            <div>
              <h2 className="font-serif text-2xl font-bold">Tentang Aktivitas & Pengalaman</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink/80">{s.description}</p>
              <p className="mt-3 text-sm leading-relaxed text-ink/80">
                Pengalaman ini dirancang untuk memperkenalkan kearifan lokal secara utuh: membaur dengan ritme hidup warga
                desa, memahami filosofi bahan alami lereng Merapi, serta mendukung ketahanan ekonomi para perempuan produsen
                mandiri.
              </p>
            </div>

            {/* Alur Kegiatan */}
            <div className="rounded-2xl bg-cream/40 p-6 ring-1 ring-cream">
              <h3 className="font-serif text-xl font-bold text-ink">Alur Pengalaman</h3>
              <ol className="mt-4 space-y-4 text-xs">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-terracotta text-white font-bold">
                    1
                  </span>
                  <div>
                    <strong className="text-sm text-ink">Penyambutan & Wedang Suguhan</strong>
                    <p className="text-ink/75 mt-0.5">Menikmati racikan jamu segar dan perkenalan singkat bersama tuan rumah pawon.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-terracotta text-white font-bold">
                    2
                  </span>
                  <div>
                    <strong className="text-sm text-ink">Praktik Lapangan & Pendampingan Pemandu</strong>
                    <p className="text-ink/75 mt-0.5">Tur interaktif memetik buah segar, mencanting kain batik, atau meracik rempah alami.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-terracotta text-white font-bold">
                    3
                  </span>
                  <div>
                    <strong className="text-sm text-ink">Dialog Tradisi Bersama Perajin</strong>
                    <p className="text-ink/75 mt-0.5">Berbincang santai mengenai sejarah kriya, teknik leluhur, serta tantangan pelestariannya.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-terracotta text-white font-bold">
                    4
                  </span>
                  <div>
                    <strong className="text-sm text-ink">Cendera Mata Buatan Sendiri</strong>
                    <p className="text-ink/75 mt-0.5">Membawa pulang hasil olahan, kain batik celup alami, atau ramuan jamu racikan sendiri.</p>
                  </div>
                </li>
              </ol>
            </div>

            {/* Fasilitas & Persyaratan */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl bg-white p-5 shadow-xs ring-1 ring-cream">
                <h4 className="flex items-center gap-2 font-serif text-base font-semibold text-forest">
                  <CheckCircle2 size={16} className="text-sage" /> Fasilitas Termasuk
                </h4>
                <ul className="mt-3 space-y-2 text-xs text-ink/75">
                  <li>• Pemandu lokal perempuan berpengalaman</li>
                  <li>• Bahan baku, peralatan kriya, atau wadah panen</li>
                  <li>• Wedang hangat & kudapan khas pedesaan</li>
                  <li>• Hasil karya untuk dibawa pulang</li>
                  <li>• Asuransi keselamatan kawasan desa wisata</li>
                </ul>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-xs ring-1 ring-cream">
                <h4 className="flex items-center gap-2 font-serif text-base font-semibold text-amber-900">
                  <AlertCircle size={16} className="text-amber-600" /> Persyaratan Kunjungan
                </h4>
                <ul className="mt-3 space-y-2 text-xs text-ink/75">
                  <li>• Kenakan pakaian santai & alas kaki tertutup</li>
                  <li>• Reservasi minimal H-2 untuk persiapan bahan</li>
                  <li>• Ramah anak dan lansia</li>
                  <li>• Disarankan membawa botol minum sendiri (bebas sampah plastik)</li>
                </ul>
              </div>
            </div>

            {/* Profil Pemandu */}
            <div className="rounded-2xl bg-paper p-6 ring-1 ring-cream">
              <div className="flex items-center gap-4">
                <ImageBox src={store.photo} alt={store.name} className="h-16 w-16 rounded-full" />
                <div>
                  <p className="text-xs text-ink/60">Pemandu / Tuan Rumah</p>
                  <h3 className="font-serif text-xl font-bold">{store.name}</h3>
                  <p className="text-xs text-terracotta">{store.businessName} • Mitra sejak {store.since}</p>
                </div>
              </div>
              <blockquote className="mt-4 border-l-2 border-terracotta pl-3 font-serif text-sm italic text-ink/80">
                “{store.quote}”
              </blockquote>
              <div className="mt-4">
                <Link
                  href={`/her-story/${store.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-terracotta hover:underline"
                >
                  Kenali Kisah Lengkap {store.name} <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Card Reservasi WhatsApp */}
          <div>
            <div className="sticky top-6 rounded-3xl bg-white p-6 shadow-md ring-1 ring-cream">
              <span className="rounded-full bg-sage/20 px-3 py-1 text-xs font-semibold text-sage">
                LAYANAN TERSEDIA
              </span>
              <h3 className="mt-3 font-serif text-2xl font-bold text-ink">Reservasi Langsung</h3>
              <p className="mt-2 text-xs text-ink/70">
                Layanan wisata dipandu secara personal oleh kelompok perempuan lokal. Pemesanan dilakukan langsung kepada
                pengelola untuk penyesuaian jadwal dan rombongan Anda.
              </p>

              <dl className="mt-5 divide-y divide-cream/70 text-xs">
                <div className="flex justify-between py-2.5">
                  <dt className="text-ink/65">Tarif Partisipasi</dt>
                  <dd className="font-bold text-terracotta">{rupiah(s.priceFrom ?? 0)} / orang</dd>
                </div>
                <div className="flex justify-between py-2.5">
                  <dt className="text-ink/65">Rombongan Minimal</dt>
                  <dd className="font-medium text-ink">2 Peserta</dd>
                </div>
                <div className="flex justify-between py-2.5">
                  <dt className="text-ink/65">Lokasi Kunjungan</dt>
                  <dd className="font-medium text-ink">{village.name}, Sleman</dd>
                </div>
                <div className="flex justify-between py-2.5">
                  <dt className="text-ink/65">Status Pelayanan</dt>
                  <dd className="font-semibold text-sage">Siap Menerima Kunjungan</dd>
                </div>
              </dl>

              <a
                href={`https://wa.me/6281234567890?text=Halo%20WaniKarya,%20saya%20tertarik%20reservasi%20layanan:%20${encodeURIComponent(s.name)}`}
                target="_blank"
                rel="noreferrer"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-terracotta py-3.5 text-center text-sm font-semibold text-white shadow-sm transition-colors hover:bg-terracotta-dark"
              >
                <MessageCircle size={16} /> Hubungi Penyedia / Reservasi
              </a>

              <div className="mt-5 space-y-2 border-t border-cream/70 pt-4 text-xs text-ink/70">
                <p className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-sage" /> 100% Keuntungan Mengalir ke Ibu-Ibu Desa
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-sage" /> Respon Cepat via WhatsApp Resmi Desa
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rekomendasi Layanan Lain */}
      {relatedServices.length > 0 && (
        <section className="bg-cream/40 py-14">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-terracotta">Eksplorasi Lainnya</p>
                <h2 className="font-serif text-2xl font-bold">Layanan Terkait di Desa Wisata Gabugan</h2>
              </div>
              <Link href="/her-experience" className="text-sm font-semibold text-terracotta hover:underline">
                Lihat Semua Pengalaman →
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {relatedServices.map((rel) => (
                <article
                  key={rel.slug}
                  className="grid overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-cream sm:grid-cols-[200px_1fr]"
                >
                  <ImageBox src={rel.image} alt={rel.name} className="h-48 w-full object-cover sm:h-full" />
                  <div className="flex flex-col p-5">
                    <span className="text-xs font-medium text-sage">{rel.category}</span>
                    <h3 className="mt-1 font-serif text-lg font-bold">
                      <Link href={`/her-experience/${rel.slug}`} className="hover:text-terracotta">
                        {rel.name}
                      </Link>
                    </h3>
                    <p className="mt-2 line-clamp-2 text-xs text-ink/70">{rel.description}</p>
                    <div className="mt-auto flex items-end justify-between pt-4">
                      <p className="font-serif text-base font-bold text-terracotta">
                        Mulai {rupiah(rel.priceFrom ?? 0)}
                      </p>
                      <Link
                        href={`/her-experience/${rel.slug}`}
                        className="rounded-lg bg-cream px-3 py-1.5 text-xs font-semibold hover:bg-sand/40"
                      >
                        Lihat Detail
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
