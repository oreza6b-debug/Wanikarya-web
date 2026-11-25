"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { getSession } from "@/lib/session";

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
  const { totalItems, setIsCartOpen } = useCart();
  const session = getSession(); // MOCK: ganti dengan sesi Supabase saat BE siap

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
                  href="/usaha/pesanan"
                  className="rounded-lg bg-sage/20 px-4 py-2 font-medium text-forest hover:bg-sage/30"
                >
                  Mode Usaha
                </Link>
              )}
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full bg-terracotta text-white"
                title={session.name}
              >
                <User size={16} aria-hidden />
              </span>
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
