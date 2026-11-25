"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { rupiah } from "@/lib/format";
import type { Product } from "@/lib/data";
import ImageBox from "./ImageBox";
import { ShoppingCart, Zap, Plus, Minus, Check } from "lucide-react";

interface ProductPurchaseSectionProps {
  product: Product;
  storeName: string;
}

export default function ProductPurchaseSection({ product, storeName }: ProductPurchaseSectionProps) {
  const { addToCart, setCheckoutItem, setIsCheckoutOpen } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const soldOut = product.stock === 0;
  const currentPrice = product.promoPercent
    ? Math.round((product.price * (100 - product.promoPercent)) / 100)
    : product.price;

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleIncrease = () => {
    if (product.stock && quantity >= product.stock) return;
    setQuantity((prev) => prev + 1);
  };

  const handleAddToCart = () => {
    if (soldOut) return;
    addToCart(product, quantity, storeName);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  const handleBuyNow = () => {
    if (soldOut) return;
    setCheckoutItem({
      slug: product.slug,
      name: product.name,
      price: currentPrice,
      originalPrice: product.price,
      image: product.image,
      quantity,
      storeName,
      stock: product.stock,
    });
    setIsCheckoutOpen(true);
  };

  return (
    <>
      {/* 1. In-Page Actions (Tampil di dalam kolom detail produk) */}
      <div className="mt-6 rounded-2xl bg-white p-5 ring-1 ring-cream">
        {/* Quantity selector */}
        {!soldOut && (
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-semibold text-ink/80">Atur Jumlah Pembelian:</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-xl bg-cream/70 p-1">
                <button
                  type="button"
                  onClick={handleDecrease}
                  disabled={quantity <= 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-ink/80 shadow-xs hover:bg-cream disabled:opacity-40"
                  aria-label="Kurangi jumlah"
                >
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center font-serif text-sm font-bold text-ink">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={handleIncrease}
                  disabled={product.stock > 0 && quantity >= product.stock}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-ink/80 shadow-xs hover:bg-cream disabled:opacity-40"
                  aria-label="Tambah jumlah"
                >
                  <Plus size={14} />
                </button>
              </div>
              <span className="text-xs text-ink/50">
                (Sisa stok: {product.stock})
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons in Page */}
        {soldOut ? (
          <button
            disabled
            className="w-full rounded-xl bg-cream py-3.5 text-center text-sm font-semibold text-ink/50 cursor-not-allowed"
          >
            Habis Terjual (Sedang Diproduksi Ulang)
          </button>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleAddToCart}
              className={`flex items-center justify-center gap-2 rounded-xl border-2 border-terracotta bg-cream/40 py-3.5 text-center text-sm font-bold text-terracotta transition-all hover:bg-terracotta hover:text-white ${
                addedAnimation ? "bg-emerald-600 text-white border-emerald-600" : ""
              }`}
            >
              {addedAnimation ? (
                <>
                  <Check size={18} /> Dimasukkan
                </>
              ) : (
                <>
                  <ShoppingCart size={18} /> + Keranjang
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              className="flex items-center justify-center gap-2 rounded-xl bg-terracotta py-3.5 text-center text-sm font-bold text-white shadow-sm transition-all hover:bg-terracotta-dark"
            >
              <Zap size={18} className="fill-current" /> Beli Langsung
            </button>
          </div>
        )}
      </div>

      {/* 2. Pop Up / Bar di Bawah yang Tetap Stay Walaupun di-Scroll (Sticky Bottom Action Bar) */}
      <div className="fixed bottom-0 inset-x-0 z-40 border-t border-cream bg-white/95 backdrop-blur-md shadow-[0_-6px_25px_rgba(0,0,0,0.08)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          {/* Sisi Kiri: Info Ringkas Produk & Kuantitas */}
          <div className="flex items-center gap-3">
            <div className="hidden h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-cream sm:block">
              <ImageBox src={product.image} alt={product.name} className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="line-clamp-1 max-w-[180px] font-serif text-sm font-bold text-ink sm:max-w-xs md:max-w-sm">
                {product.name}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-base font-bold text-terracotta">
                  {rupiah(currentPrice)}
                </span>
                {product.promoPercent && (
                  <span className="hidden text-xs text-ink/50 line-through sm:inline">
                    {rupiah(product.price)}
                  </span>
                )}
              </div>
            </div>

            {/* Stepper Kuantitas di Bar Bawah */}
            {!soldOut && (
              <div className="hidden items-center rounded-xl bg-cream/70 p-1 md:flex ml-4">
                <button
                  type="button"
                  onClick={handleDecrease}
                  disabled={quantity <= 1}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-ink/80 shadow-xs hover:bg-cream disabled:opacity-40"
                  aria-label="Kurangi jumlah"
                >
                  <Minus size={12} />
                </button>
                <span className="w-8 text-center text-xs font-bold text-ink">{quantity}</span>
                <button
                  type="button"
                  onClick={handleIncrease}
                  disabled={product.stock > 0 && quantity >= product.stock}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-ink/80 shadow-xs hover:bg-cream disabled:opacity-40"
                  aria-label="Tambah jumlah"
                >
                  <Plus size={12} />
                </button>
              </div>
            )}
          </div>

          {/* Sisi Kanan: 2 Tombol (+ Keranjang & Beli Langsung) */}
          {soldOut ? (
            <button
              disabled
              className="rounded-xl bg-cream px-6 py-2.5 text-xs font-semibold text-ink/50"
            >
              Stok Habis
            </button>
          ) : (
            <div className="flex items-center gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                className={`flex items-center gap-1.5 rounded-xl border-2 border-terracotta bg-cream/40 px-3.5 py-2.5 text-xs font-bold text-terracotta transition-all hover:bg-terracotta hover:text-white sm:px-5 sm:py-3 sm:text-sm ${
                  addedAnimation ? "bg-emerald-600 text-white border-emerald-600" : ""
                }`}
              >
                {addedAnimation ? (
                  <>
                    <Check size={16} /> Dimasukkan
                  </>
                ) : (
                  <>
                    <ShoppingCart size={16} /> <span className="hidden xs:inline">+</span> Keranjang
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                className="flex items-center gap-1.5 rounded-xl bg-terracotta px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-terracotta-dark sm:px-6 sm:py-3 sm:text-sm"
              >
                <Zap size={16} className="fill-current" /> Beli Langsung
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
