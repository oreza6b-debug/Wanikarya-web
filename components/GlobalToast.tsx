"use client";

import { useCart } from "@/context/CartContext";
import { CheckCircle2, ShoppingCart, X } from "lucide-react";

export default function GlobalToast() {
  const { toastMessage, setToastMessage, setIsCartOpen } = useCart();

  if (!toastMessage) return null;

  return (
    <aside
      role="status"
      aria-live="polite"
      className="fixed top-20 right-4 z-50 flex max-w-sm items-center gap-3 rounded-2xl bg-forest px-4 py-3 text-white shadow-xl ring-1 ring-white/10 transition-all duration-300 animate-in fade-in slide-in-from-top-4"
    >
      <CheckCircle2 size={20} className="shrink-0 text-sand" />
      <div className="flex-1 text-xs">
        <p className="font-medium leading-snug">{toastMessage}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            setToastMessage(null);
            setIsCartOpen(true);
          }}
          className="flex items-center gap-1 rounded-lg bg-sand/20 px-2 py-1 text-xs font-semibold text-sand hover:bg-sand/30"
        >
          <ShoppingCart size={12} /> Buka
        </button>
        <button
          onClick={() => setToastMessage(null)}
          className="text-white/70 hover:text-white"
          aria-label="Tutup notifikasi"
        >
          <X size={15} />
        </button>
      </div>
    </aside>
  );
}
