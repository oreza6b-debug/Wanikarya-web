"use client";

import Link from "next/link";
import { Bell, ArrowLeftRight, Store } from "lucide-react";
import { getSession } from "@/lib/session";

// Top-bar mode usaha sesuai mockup WPA-01 s.d. WPA-05
export default function SellerTopBar() {
  const s = getSession();

  return (
    <div className="sticky top-0 z-30 border-b border-cream bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-2.5">
        {/* Logo */}
        <Link href="/usaha/dashboard" className="flex items-center gap-2 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-terracotta">
            <Store size={16} className="text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-bold text-terracotta leading-tight">WaniKarya</p>
            <p className="text-[10px] text-ink/50 leading-tight">DESA GABUGAN</p>
          </div>
        </Link>

        {/* Mode Badge */}
        <div className="flex flex-1 items-center gap-3">
          <span className="flex items-center gap-1.5 rounded-full bg-sage/20 px-3 py-1.5 text-xs font-bold text-forest">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Mode Usaha (Pawon Salak Lestari)
          </span>
          <Link
            href="/pesanan"
            className="flex items-center gap-1.5 rounded-full bg-cream px-3 py-1.5 text-xs font-semibold text-ink/70 hover:bg-sand/40 transition"
          >
            <ArrowLeftRight size={12} />
            Beralih ke Mode Pembeli
          </Link>
        </div>

        {/* Right: Notif + User */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            aria-label="Notifikasi"
            className="relative rounded-full p-2 hover:bg-cream transition"
          >
            <Bell size={18} className="text-ink/60" />
          </button>
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-ink leading-tight">{s?.name ?? "Bu Sumarsih"}</p>
            <p className="text-[11px] text-ink/50 leading-tight">Pawon Salak Lestari</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-terracotta text-white text-sm font-bold">
            {s?.name?.charAt(0) ?? "S"}
          </div>
        </div>
      </div>
    </div>
  );
}
