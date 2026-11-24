import Link from "next/link";
import { BadgeCheck, ArrowRight, ShoppingBag, Sparkles } from "lucide-react";
import ImageBox from "./ImageBox";
import { getVillage, getProductsByStore, getServicesByStore } from "@/lib/queries";
import type { Womanpreneur } from "@/lib/data";

export default function WomanpreneurCard({ w }: { w: Womanpreneur }) {
  const village = getVillage(w.villageSlug);
  const prods = getProductsByStore(w.slug);
  const svcs = getServicesByStore(w.slug);
  const href = `/her-story/${w.slug}`;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-cream transition-all hover:shadow-md">
      <Link href={href} className="relative block">
        <ImageBox src={w.photo} alt={w.name} className="h-56 w-full" />
        <span className="absolute left-3 top-3 rounded-full bg-cream/95 px-2.5 py-1 text-xs font-medium text-terracotta backdrop-blur-xs">
          {w.category}
        </span>
        {w.verified && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-medium text-sage shadow-xs backdrop-blur-xs">
            <BadgeCheck size={14} className="text-sage" />
            Terverifikasi
          </span>
        )}
        <span className="absolute bottom-3 left-3 rounded-md bg-ink/70 px-2 py-0.5 text-xs text-white backdrop-blur-xs">
          Mitra sejak {w.since}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs text-ink/65">
          {w.businessName} • {village.name}
        </p>

        <h3 className="mt-1 font-serif text-xl font-semibold leading-snug">
          <Link href={href} className="hover:text-terracotta">
            {w.name}
          </Link>
        </h3>

        <blockquote className="mt-2 line-clamp-2 font-serif text-sm italic text-ink/80">
          “{w.quote}”
        </blockquote>

        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-ink/70">
          {w.description}
        </p>

        {/* Micro-stats */}
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-ink/70">
          {prods.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded bg-cream/70 px-2 py-0.5 font-medium">
              <ShoppingBag size={12} className="text-terracotta" />
              {prods.length} Produk
            </span>
          )}
          {svcs.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded bg-sage/15 px-2 py-0.5 font-medium text-forest">
              <Sparkles size={12} className="text-sage" />
              {svcs.length} Layanan Wisata
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-cream/70 pt-4">
          <span className="text-xs text-ink/60">{village.location.split(",")[1]?.trim() || "Sleman"}</span>
          <Link
            href={href}
            className="inline-flex items-center gap-1.5 rounded-lg bg-terracotta px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-terracotta-dark"
          >
            Kenali Profil <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}
