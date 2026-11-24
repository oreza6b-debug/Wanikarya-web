import Link from "next/link";
import { ShoppingBag, Bell } from "lucide-react";
import ImageBox from "./ImageBox";
import { rupiah } from "@/lib/format";
import { finalPrice, getStore, getVillage } from "@/lib/queries";
import type { Product } from "@/lib/data";

export default function ProductCard({ p, variant = "market" }: { p: Product; variant?: "market" | "compact" }) {
  const store = getStore(p.storeSlug);
  const village = getVillage(store.villageSlug);
  const soldOut = p.stock === 0;
  const price = finalPrice(p);
  const href = `/her-market/${p.slug}`;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-cream">
      <Link href={href} className="relative block">
        <ImageBox src={p.image} alt={p.name} dim={soldOut} className="h-52 w-full" />
        {p.promoPercent && !soldOut && (
          <span className="absolute left-3 top-3 rounded bg-terracotta px-2 py-0.5 text-xs font-medium text-white">
            Hemat {p.promoPercent}%
          </span>
        )}
        {!p.promoPercent && !soldOut && variant === "market" && (
          <span className="absolute left-3 top-3 rounded bg-cream px-2 py-0.5 text-xs font-medium text-terracotta">
            {p.label}
          </span>
        )}
        {soldOut && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="rounded-full bg-white px-5 py-2 font-serif font-semibold text-terracotta">Habis Terpesan</span>
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs text-ink/65">{store.businessName} • {village.name}</p>
        <h3 className={`mt-1 font-serif text-lg font-semibold leading-snug ${soldOut ? "text-ink/50" : ""}`}>
          <Link href={href}>{p.name}</Link>
        </h3>
        {variant === "market" && (
          <p className="mt-2 line-clamp-2 text-sm text-ink/70">{p.description}</p>
        )}
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div>
            {p.promoPercent && !soldOut && (
              <p className="text-xs text-ink/50 line-through">{rupiah(p.price)}</p>
            )}
            <p className="font-serif text-lg font-semibold text-terracotta">{rupiah(price)}</p>
          </div>
          {variant === "market" && (
            soldOut ? (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-cream px-3 py-2 text-sm text-ink/60">
                <Bell size={14} /> Kabari Bila Ada
              </span>
            ) : (
              <Link href={href} className="inline-flex items-center gap-1.5 rounded-lg bg-terracotta px-4 py-2 text-sm font-medium text-white hover:bg-terracotta-dark">
                <ShoppingBag size={14} /> Pesan
              </Link>
            )
          )}
        </div>
      </div>
    </article>
  );
}
