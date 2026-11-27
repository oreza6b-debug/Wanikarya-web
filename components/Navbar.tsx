"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, ShoppingCart, LogIn, LogOut, UserPlus, Store, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useSession } from "@/components/AuthProvider";
import { logoutAction } from "@/app/actions/auth";

const links = [
  { href: "/", label: "Homepage" },
  { href: "/her-market", label: "HerMarket" },
  { href: "/her-experience", label: "HerExperience" },
  { href: "/her-story", label: "HerStory" },
  { href: "/her-village", label: "HerVillage" },
  { href: "/about", label: "About Us" },
  { href: "/mitra", label: "Mitra Kami" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems, setIsCartOpen } = useCart();
  const { session, refreshSession } = useSession();
  const [profileOpen, setProfileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  async function handleLogout() {
    setProfileOpen(false);
    await logoutAction();
    await refreshSession();
    router.push("/login");
    router.refresh();
  }

  useEffect(() => {
    setProfileOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileOpen]);

  if (
    pathname.startsWith("/usaha") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/daftar")
  ) {
    return null;
  }

  return (
    <header className="border-b border-cream bg-paper">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-5 gap-y-2 px-6 py-4 text-sm">
        <Link href="/" className="mr-2 font-serif text-xl font-semibold text-ink">
          WaniKarya
        </Link>
        {links.map((l) => {
          const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={active ? "font-medium text-terracotta" : "text-ink/80 hover:text-terracotta"}
            >
              {l.label}
            </Link>
          );
        })}
        <div className="ml-auto flex items-center gap-3">
          {/* Tombol Keranjang Belanja */}
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="relative flex h-9 w-9 items-center justify-center rounded-full bg-cream text-ink/80 transition-colors hover:bg-sand/40 hover:text-terracotta"
            aria-label="Keranjang Belanja"
          >
            <ShoppingCart size={17} />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-terracotta text-[10px] font-bold text-white shadow-xs">
                {totalItems}
              </span>
            )}
          </button>

          {session ? (
            <>
              <Link
                href="/pesanan"
                className={
                  pathname.startsWith("/pesanan")
                    ? "font-medium text-terracotta"
                    : "text-ink/80 hover:text-terracotta"
                }
              >
                Pembelian Saya
              </Link>
              {session.role === "womanpreneur" && (
                <Link
                  href="/usaha/dashboard"
                  className="rounded-lg bg-sage/20 px-4 py-2 font-medium text-forest hover:bg-sage/30"
                >
                  Mode Usaha
                </Link>
              )}
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen((v) => !v)}
                  aria-label="Menu Akun & Login"
                  aria-expanded={profileOpen}
                  title={session.name}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-terracotta text-white transition hover:bg-terracotta-dark"
                >
                  <User size={16} aria-hidden />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-60 rounded-2xl bg-white p-2 shadow-lg ring-1 ring-sand/30">
                    <div className="border-b border-cream px-3 py-2.5">
                      <p className="text-xs font-bold text-ink">{session.name}</p>
                      <p className="text-[11px] text-ink/55">
                        {session.role === "womanpreneur"
                          ? `Womanpreneur • ${session.storeName ?? "Toko Saya"}`
                          : "Pembeli Terdaftar"}
                      </p>
                    </div>
                    <div className="py-1.5 space-y-0.5 text-xs">
                      <Link
                        href="/pesanan"
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-ink/80 transition hover:bg-cream hover:text-terracotta"
                      >
                        <ShoppingBag size={14} />
                        Pembelian Saya
                      </Link>
                      {session.role === "womanpreneur" && (
                        <Link
                          href="/usaha/dashboard"
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-ink/80 transition hover:bg-cream hover:text-terracotta"
                        >
                          <Store size={14} />
                          Mode Usaha
                        </Link>
                      )}
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
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-red-700 transition hover:bg-red-50"
                      >
                        <LogOut size={14} />
                        Keluar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-terracotta px-5 py-2 font-medium text-white hover:bg-terracotta-dark"
            >
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
