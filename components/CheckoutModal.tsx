"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart, CartItem } from "@/context/CartContext";
import { useOrders } from "@/components/OrdersProvider";
import { useSession } from "@/components/AuthProvider";
import { rupiah } from "@/lib/format";
import type { Order } from "@/lib/orders";
import ImageBox from "./ImageBox";
import { X, QrCode, CreditCard, Banknote, ArrowRight, Clock, ExternalLink } from "lucide-react";

export default function CheckoutModal() {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    checkoutItem,
    setCheckoutItem,
    cart,
    clearCart,
  } = useCart();
  const { addOrder } = useOrders();
  const { session } = useSession();

  const [paymentMethod, setPaymentMethod] = useState<"qris" | "va" | "cod">("qris");
  const [step, setStep] = useState<"summary" | "pay_instruction">("summary");
  const [orderCode, setOrderCode] = useState("");

  if (!isCheckoutOpen) return null;

  const itemsToBuy: CartItem[] = checkoutItem ? [checkoutItem] : cart;
  const subtotal = itemsToBuy.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = itemsToBuy.length > 0 ? 10000 : 0;
  const total = subtotal + shippingCost;

  const handleProceedPayment = () => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const code = `WK-${today}-${randomNum}`;
    setOrderCode(code);

    const newOrder: Order = {
      kode: code,
      storeSlug: "bu-sumarsih",
      storeName: itemsToBuy[0]?.storeName || "Pawon Salak Lestari",
      buyerId: session?.userId || "u-sumarsih",
      buyerName: session?.name || "Pembeli WaniKarya",
      buyerPhone: "0812-1111-2222",
      address: "RT 03/RW 08 Dusun Gabugan, Donokerto, Turi, Sleman, D.I. Yogyakarta 55551",
      items: itemsToBuy.map((it) => ({
        name: it.name,
        price: it.price,
        normalPrice: it.originalPrice,
        qty: it.quantity,
      })),
      shipping: shippingCost,
      status: "dibayarkan",
      createdAt: new Date().toISOString(),
      history: [{ status: "dibayarkan", at: new Date().toISOString(), by: "Sistem" }],
    };

    addOrder(newOrder);
    setStep("pay_instruction");

    if (!checkoutItem) {
      clearCart();
    }
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setCheckoutItem(null);
    setStep("summary");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/50 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-paper p-6 shadow-2xl ring-1 ring-cream sm:p-7">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-5 top-5 rounded-lg p-1.5 text-ink/60 hover:bg-cream hover:text-ink"
          aria-label="Tutup"
        >
          <X size={18} />
        </button>

        {step === "summary" ? (
          <div>
            {/* Header Sederhana */}
            <div className="border-b border-cream pb-3">
              <span className="rounded-full bg-cream px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-terracotta">
                {checkoutItem ? "Beli Langsung" : "Pembayaran Keranjang"}
              </span>
              <h2 className="mt-1 font-serif text-xl font-bold text-ink">Ringkasan Pembayaran</h2>
            </div>

            {/* List Item yang Dibeli (Sederhana & Ringkas) */}
            <div className="mt-4 space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {itemsToBuy.map((item) => (
                <div
                  key={item.slug}
                  className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-cream"
                >
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-cream">
                    <ImageBox src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="line-clamp-1 font-serif text-xs font-semibold text-ink">{item.name}</p>
                    <p className="text-[11px] text-ink/60">
                      {item.quantity} x {rupiah(item.price)}
                    </p>
                  </div>
                  <span className="font-serif text-xs font-bold text-terracotta">
                    {rupiah(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Pilihan Metode Pembayaran Sederhana */}
            <div className="mt-5">
              <label className="block text-xs font-semibold text-ink mb-2">Metode Pembayaran</label>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("qris")}
                  className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all ${
                    paymentMethod === "qris"
                      ? "border-terracotta bg-cream/50 shadow-xs"
                      : "border-cream bg-white hover:bg-cream/20"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-terracotta/10 text-terracotta">
                      <QrCode size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-ink">QRIS (Semua E-Wallet & Bank)</p>
                      <p className="text-[10px] text-ink/50">GoPay, OVO, Dana, BCA, Livin, BRImo</p>
                    </div>
                  </div>
                  <span
                    className={`h-4 w-4 rounded-full border-2 ${
                      paymentMethod === "qris" ? "border-terracotta bg-terracotta" : "border-ink/30"
                    }`}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("va")}
                  className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all ${
                    paymentMethod === "va"
                      ? "border-terracotta bg-cream/50 shadow-xs"
                      : "border-cream bg-white hover:bg-cream/20"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-terracotta/10 text-terracotta">
                      <CreditCard size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-ink">Transfer Virtual Account</p>
                      <p className="text-[10px] text-ink/50">BCA, Mandiri, BRI, BNI (Otomatis)</p>
                    </div>
                  </div>
                  <span
                    className={`h-4 w-4 rounded-full border-2 ${
                      paymentMethod === "va" ? "border-terracotta bg-terracotta" : "border-ink/30"
                    }`}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("cod")}
                  className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all ${
                    paymentMethod === "cod"
                      ? "border-terracotta bg-cream/50 shadow-xs"
                      : "border-cream bg-white hover:bg-cream/20"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-terracotta/10 text-terracotta">
                      <Banknote size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-ink">Bayar di Tempat (COD)</p>
                      <p className="text-[10px] text-ink/50">Bayar saat paket sampai ke alamat Anda</p>
                    </div>
                  </div>
                  <span
                    className={`h-4 w-4 rounded-full border-2 ${
                      paymentMethod === "cod" ? "border-terracotta bg-terracotta" : "border-ink/30"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Rincian Total */}
            <div className="mt-5 rounded-2xl bg-cream/40 p-4 text-xs text-ink/80 space-y-1.5">
              <div className="flex justify-between">
                <span>Subtotal ({itemsToBuy.reduce((a, b) => a + b.quantity, 0)} produk)</span>
                <span>{rupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Ongkos Kirim Desa</span>
                <span>{rupiah(shippingCost)}</span>
              </div>
              <div className="flex justify-between border-t border-cream pt-2 font-serif text-base font-bold text-terracotta">
                <span>Total Pembayaran</span>
                <span>{rupiah(total)}</span>
              </div>
            </div>

            {/* Tombol Lanjut Bayar */}
            <button
              type="button"
              onClick={handleProceedPayment}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-terracotta py-3.5 text-center text-sm font-semibold text-white shadow-sm transition-colors hover:bg-terracotta-dark"
            >
              Lanjut ke Pembayaran <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          /* Halaman Pop-up Status & Instruksi Pembayaran Sederhana */
          <div className="py-2 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <Clock size={28} />
            </div>

            <h3 className="mt-3 font-serif text-xl font-bold text-ink">Menunggu Pembayaran</h3>
            <p className="mt-1 text-xs text-ink/65">
              Selesaikan pembayaran Anda untuk memproses pesanan desa.
            </p>

            {/* Box Kode & Nominal Pembayaran */}
            <div className="mt-5 rounded-2xl bg-white p-5 text-center shadow-xs ring-1 ring-cream">
              <span className="text-[10px] uppercase font-semibold text-ink/50">Total yang Harus Dibayar</span>
              <p className="mt-1 font-serif text-2xl font-bold text-terracotta">{rupiah(total)}</p>

              <div className="mt-3 inline-block rounded-lg bg-cream/70 px-3 py-1 font-mono text-xs font-bold text-ink">
                Kode Tagihan: {orderCode}
              </div>

              {paymentMethod === "qris" && (
                <div className="mt-4 flex flex-col items-center">
                  <div className="flex h-36 w-36 items-center justify-center rounded-xl border-2 border-dashed border-cream bg-paper p-2">
                    <QrCode size={100} className="text-ink" />
                  </div>
                  <span className="mt-2 text-[10px] text-ink/50">Pindai QRIS ini di aplikasi e-wallet Anda</span>
                </div>
              )}

              {paymentMethod === "va" && (
                <div className="mt-4 rounded-xl bg-cream/50 p-3 text-xs">
                  <span className="text-ink/60">Nomor Rekening Virtual Account:</span>
                  <p className="mt-1 font-mono text-base font-bold text-ink">8802 0812 3456 7890</p>
                  <p className="text-[10px] text-ink/50">Bank BCA / Mandiri / BRI</p>
                </div>
              )}

              {paymentMethod === "cod" && (
                <div className="mt-4 rounded-xl bg-cream/50 p-3 text-xs">
                  <p className="font-semibold text-ink">Metode Bayar di Tempat Aktif</p>
                  <p className="text-[10px] text-ink/60 mt-0.5">Siapkan uang pas saat kurir desa mengantarkan pesanan.</p>
                </div>
              )}
            </div>

            {/* Indikator Alur Status Pesanan */}
            <div className="mt-5 rounded-xl bg-sage/10 p-3 text-left">
              <p className="text-[10px] font-bold uppercase tracking-wider text-sage">Alur Pesanan Berikutnya:</p>
              <div className="mt-1.5 flex items-center justify-between text-[11px] font-medium text-ink/75">
                <span className="text-terracotta font-bold">1. Pembayaran</span>
                <span>→</span>
                <span>2. Dikemas</span>
                <span>→</span>
                <span>3. Dikirim</span>
                <span>→</span>
                <span>4. Selesai</span>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2">
              <Link
                href={`/pesanan/${orderCode}`}
                onClick={handleClose}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-terracotta py-3 text-xs font-semibold text-white hover:bg-terracotta-dark"
              >
                Lihat Detail di Pembelian Saya <ExternalLink size={14} />
              </Link>
              <button
                onClick={handleClose}
                className="w-full rounded-xl bg-cream py-2.5 text-xs font-semibold text-ink/70 hover:bg-sand/30"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
