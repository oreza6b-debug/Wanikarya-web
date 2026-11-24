"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import ImageBox from "./ImageBox";
import type { Womanpreneur } from "@/lib/data";

// FR-HOME-06: banner berganti otomatis tiap 5 detik, tanpa tombol geser manual.
export default function Spotlight({ items }: { items: Womanpreneur[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (items.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((n) => (n + 1) % items.length), 5000);
    return () => clearInterval(t);
  }, [items.length]);

  const w = items[i];
  return (
    <section className="bg-sage text-white">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="mb-6 flex items-center justify-between text-sm">
          <h2 className="font-medium text-white/80">HerStory Spotlight</h2>
          <Link href="/her-story" className="hover:underline">
            Kenali Semua →
          </Link>
        </div>
        <div className="grid items-center gap-10 md:grid-cols-[360px_1fr]" key={w.slug} aria-live="polite">
          <ImageBox src={w.photo} alt={w.name} className="h-[340px] w-full rounded-2xl" />
          <div>
            <p className="text-sm text-white/80">
              {w.businessName} • {w.category} • Desa Wisata Gabugan
            </p>
            <h3 className="mt-2 font-serif text-4xl font-semibold">{w.name}</h3>
            <blockquote className="mt-5 max-w-2xl font-serif text-xl italic leading-relaxed text-white/90">
              “{w.quote}”
            </blockquote>
            <Link
              href={`/her-story/${w.slug}`}
              className="mt-7 inline-block rounded-lg bg-terracotta px-5 py-2.5 text-sm font-medium hover:bg-terracotta-dark"
            >
              Kenali Lebih Dekat
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
