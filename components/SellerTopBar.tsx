"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ArrowLeftRight, Store, LogIn, UserPlus } from "lucide-react";
import { getSession } from "@/lib/session";

// Top-bar mode usaha sesuai mockup WPA-01 s.d. WPA-05
export default function SellerTopBar() {
  const s = getSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

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
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu Profil & Login"
              aria-expanded={menuOpen}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-terracotta text-sm font-bold text-white transition hover:bg-terracotta-dark"
            >
              {s?.name?.charAt(0) ?? "S"}
            </button>

            {menuOpen && (
              <div className="absolute right-0 z-50 mt-2 w-56 rounded-2xl bg-white p-2 shadow-lg ring-1 ring-sand/30">
                <div className="border-b border-cream px-3 py-2">
                  <p className="text-xs font-bold text-ink">{s?.name ?? "Bu Sumarsih"}</p>
                  <p className="text-[11px] text-ink/55">Pawon Salak Lestari</p>
                </div>
                <div className="py-1.5 space-y-0.5 text-xs">
                  <Link
                    href="/pesanan"
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-ink/80 transition hover:bg-cream hover:text-terracotta"
                  >
                    <ArrowLeftRight size={14} />
                    Beralih ke Mode Pembeli
                  </Link>
                  <div className="my-1 border-t border-cream" />
                  <Link
                    href="/login"
                    className="flex items-center gap-2 rounded-xl px-3 py-2 font-semibold text-terracotta transition hover:bg-cream"
                  >
                    <LogIn size={14} />
                    Masuk / Ganti Akun
                  </Link>
                  <Link
                    href="/daftar"
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-ink/80 transition hover:bg-cream hover:text-terracotta"
                  >
                    <UserPlus size={14} />
                    Daftar Akun Baru
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
