"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "lucide-react";

const links = [
  { href: "/", label: "Homepage" },
  { href: "/her-market", label: "HerMarket" },
  { href: "/her-experience", label: "HerExperience" },
  { href: "/her-story", label: "HerStory" },
  { href: "/her-village", label: "HerVillage" },
  { href: "/her-finance", label: "HerFinance" },
  { href: "/about", label: "About Us" },
  { href: "/mitra", label: "Mitra Kami" },
];

export default function Navbar() {
  const pathname = usePathname();
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
          <Link
            href="/login"
            className="rounded-lg bg-terracotta px-5 py-2 font-medium text-white hover:bg-terracotta-dark"
          >
            Login
          </Link>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-terracotta text-white" aria-hidden>
            <User size={16} />
          </span>
        </div>
      </nav>
    </header>
  );
}
