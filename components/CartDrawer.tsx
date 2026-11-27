"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useSession } from "@/components/AuthProvider";
import { rupiah } from "@/lib/format";
import ImageBox from "./ImageBox";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    totalPrice,
    totalItems,
    setCheckoutItem,
    setIsCheckoutOpen,
  } = useCart();

  const { session } = useSession();
  const router = useRouter();

  if (!isCartOpen) return null;

  const handleCheckoutAll = () => {
    setIsCartOpen(false);
    if (!session) {
      router.push("/login");
      return;
    }
    setCheckoutItem(null); // checkout whole cart
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-paper shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cream px-6 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-terracotta" />
            <h2 className="font-serif text-lg font-bold">Keranjang Belanja</h2>
            <span className="rounded-full bg-cream px-2.5 py-0.5 text-xs font-semibold text-terracotta">
              {totalItems} item
            </span>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="rounded-lg p-1.5 text-ink/60 hover:bg-cream hover:text-ink"
            aria-label="Tutup keranjang"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cream/70 text-ink/40">
                <ShoppingBag size={32} />
              </div>
              <p className="mt-4 font-serif text-base font-semibold text-ink">Keranjang Anda Masih Kosong</p>
              <p className="mt-1 text-xs text-ink/60">
                Temukan karya autentik perempuan desa di HerMarket dan tambahkan ke sini.
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-6 rounded-xl bg-terracotta px-5 py-2.5 text-xs font-semibold text-white hover:bg-terracotta-dark"
              >
                Mulai Belanja
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.slug}
                className="flex gap-4 rounded-2xl bg-white p-4 shadow-xs ring-1 ring-cream"
              >
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-cream">
                  <ImageBox src={item.image} alt={item.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <p className="text-[10px] font-medium text-ink/50 uppercase tracking-wide">
                      {item.storeName || "Karya Desa"}
                    </p>
                    <h3 className="line-clamp-1 font-serif text-sm font-semibold text-ink">
                      {item.name}
                    </h3>
                    <p className="mt-0.5 font-serif text-sm font-bold text-terracotta">
                      {rupiah(item.price)}
                    </p>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 rounded-lg bg-cream/60 px-2 py-1">
                      <button
                        onClick={() => updateQuantity(item.slug, item.quantity - 1)}
                        className="p-0.5 text-ink/70 hover:text-terracotta"
                        aria-label="Kurangi jumlah"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-5 text-center text-xs font-semibold text-ink">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.slug, item.quantity + 1)}
                        className="p-0.5 text-ink/70 hover:text-terracotta"
                        aria-label="Tambah jumlah"
                        disabled={item.stock > 0 && item.quantity >= item.stock}
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.slug)}
                      className="text-red-500 hover:text-red-700"
                      aria-label="Hapus dari keranjang"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary */}
        {cart.length > 0 && (
          <div className="border-t border-cream bg-white p-6">
            <div className="mb-4 flex items-baseline justify-between">
              <span className="text-xs text-ink/70">Total Belanja</span>
              <span className="font-serif text-xl font-bold text-terracotta">
                {rupiah(totalPrice)}
              </span>
            </div>
            <button
              onClick={handleCheckoutAll}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-terracotta py-3.5 text-center text-sm font-semibold text-white shadow-sm transition-colors hover:bg-terracotta-dark"
            >
              Checkout Keranjang <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
