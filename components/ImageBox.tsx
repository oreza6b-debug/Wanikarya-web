"use client";
import { useState } from "react";

// Menampilkan foto; bila file belum ada di /public/images, tampil blok warna sementara.
export default function ImageBox({
  src, alt, className = "", dim = false,
}: { src?: string; alt: string; className?: string; dim?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex items-center justify-center bg-gradient-to-br from-sand/60 to-terracotta/40 text-center text-xs text-ink/50 ${className}`}
      >
        <span className="px-3">{alt}</span>
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} onError={() => setFailed(true)}
    className={`object-cover ${dim ? "opacity-50 grayscale" : ""} ${className}`} />;
}
