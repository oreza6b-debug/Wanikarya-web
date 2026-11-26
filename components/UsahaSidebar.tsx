"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useOrders } from "./OrdersProvider";
import { useSession } from "@/components/AuthProvider";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  MapPin,
  Percent,
  TrendingUp,
  Store,
  ArrowLeftRight,
} from "lucide-react";

const links = [
  { href: "/usaha/dashboard", label: "Dashboard Usaha", icon: LayoutDashboard },
  { href: "/usaha/pesanan", label: "Pesanan Masuk", icon: ShoppingBag },
  { href: "/usaha/produk", label: "Produk", icon: Package },
  { href: "/usaha/jasa-promo", label: "Jasa Wisata", icon: MapPin },
  { href: "/usaha/jasa-promo", label: "Promo", icon: Percent },
  { href: "/usaha/keuangan", label: "Financial Tracker", icon: TrendingUp },
  { href: "/usaha/profil", label: "Profil Usaha", icon: Store },
];

// Deduplicate untuk nav (Jasa & Promo ke halaman yang sama)
const navLinks = [
  { href: "/usaha/dashboard", label: "Dashboard Usaha", icon: LayoutDashboard },
  { href: "/usaha/pesanan", label: "Pesanan Masuk", icon: ShoppingBag },
  { href: "/usaha/produk", label: "Produk", icon: Package },
  { href: "/usaha/jasa-promo", label: "Jasa Wisata", icon: MapPin },
  { href: "/usaha/keuangan", label: "Financial Tracker", icon: TrendingUp },
  { href: "/usaha/profil", label: "Profil Usaha", icon: Store },
];

export default function UsahaSidebar() {
  const pathname = usePathname();
  const { orders } = useOrders();
  const { session: s } = useSession();
  const storeLabel = s?.storeName ?? "Toko Saya";
  const perluDiproses = orders.filter(
    (o) => o.storeSlug === s?.storeSlug && o.status === "dibayarkan"
  ).length;

  return (
    <aside className="h-fit rounded-2xl bg-cream/60 p-4">
      {/* Header Sidebar */}
      <div className="mb-3 rounded-xl bg-terracotta/10 px-3 py-2 text-center">
        <p className="text-xs font-bold text-terracotta">⊙ Mode Usaha ({storeLabel})</p>
      </div>
      <div className="mb-1 flex items-center gap-2 px-1">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-terracotta text-white text-sm font-bold">
          {s?.name?.charAt(0) ?? "W"}
        </div>
        <div>
          <p className="text-sm font-semibold text-ink leading-tight">{s?.name}</p>
          <p className="text-[11px] text-ink/55">{storeLabel}</p>
        </div>
      </div>

      {/* Nav */}
      <nav aria-label="Menu usaha" className="mt-4 space-y-1 text-sm">
        {navLinks.map((l) => {
          const active = pathname === l.href || (l.href !== "/usaha/dashboard" && pathname.startsWith(l.href));
          const Icon = l.icon;
          return (
            <Link
              key={l.href + l.label}
              href={l.href}
              className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 transition ${
                active
                  ? "bg-terracotta font-semibold text-white"
                  : "text-ink/75 hover:bg-sand/40"
              }`}
            >
              <span className="flex items-center gap-2">
                <Icon size={15} />
                {l.label}
              </span>
              {l.href === "/usaha/pesanan" && perluDiproses > 0 && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    active ? "bg-white/25 text-white" : "bg-terracotta text-white"
                  }`}
                >
                  {perluDiproses}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Ke Mode Pembeli */}
      <Link
        href="/pesanan"
        className="mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-2.5 text-xs font-semibold text-ink/70 hover:bg-sand/40 transition"
      >
        <ArrowLeftRight size={13} />
        Kembali ke Mode Pembeli
      </Link>
    </aside>
  );
}
