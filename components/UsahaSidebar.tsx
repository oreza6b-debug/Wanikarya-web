"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useOrders } from "./OrdersProvider";
import { getSession } from "@/lib/session";

// Menu Mode Usaha. Menu lain (Dashboard, Profil Toko, Produk, Jasa, Promo) belum dibuat:
// tambahkan di array `links` saat halamannya ada.
const links = [
  { href: "/usaha/pesanan", label: "Pesanan Masuk" },
  { href: "/usaha/keuangan", label: "Financial Tracker" },
];

export default function UsahaSidebar() {
  const pathname = usePathname();
  const { orders } = useOrders();
  const s = getSession();
  const perluDiproses = orders.filter((o) => o.storeSlug === s?.storeSlug && o.status === "dibayarkan").length;

  return (
    <aside className="h-fit rounded-2xl bg-cream/60 p-4">
      <p className="rounded-full bg-sage/20 px-3 py-1 text-center text-xs font-semibold text-sage">Mode Usaha</p>
      <p className="mt-3 text-sm font-semibold">{s?.name}</p>
      <nav aria-label="Menu usaha" className="mt-4 space-y-1 text-sm">
        {links.map((l) => {
          const active = pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center justify-between rounded-lg px-3 py-2 ${
                active ? "bg-terracotta font-medium text-white" : "hover:bg-sand/40"
              }`}
            >
              {l.label}
              {l.href === "/usaha/pesanan" && perluDiproses > 0 && (
                <span className={`rounded-full px-2 text-xs ${active ? "bg-white/25" : "bg-terracotta text-white"}`}>
                  {perluDiproses}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <Link href="/pesanan" className="mt-4 block rounded-lg bg-white px-3 py-2 text-center text-xs font-medium hover:bg-sand/40">
        ↔ Ke Mode Pembeli
      </Link>
    </aside>
  );
}
