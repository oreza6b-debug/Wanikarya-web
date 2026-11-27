"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useOrders } from "@/components/OrdersProvider";
import { useSession } from "@/components/AuthProvider";
import { createAddressAction, listAddressesAction, type UserAddress } from "@/app/actions/addresses";
import {
  createDemoOrderAction,
  previewCheckoutAction,
  type CheckoutPreview,
  type CreatedOrder,
  type PaymentMethod,
} from "@/app/actions/orders";
import { rupiah } from "@/lib/format";
import ImageBox from "./ImageBox";
import { X, QrCode, CreditCard, Banknote, MapPin, Plus, CheckCircle2, FlaskConical, ExternalLink } from "lucide-react";

const METHODS: { id: PaymentMethod; title: string; sub: string; icon: typeof QrCode }[] = [
  { id: "qris", title: "QRIS (Simulasi)", sub: "GoPay, OVO, Dana, BCA, Livin, BRImo", icon: QrCode },
  { id: "va", title: "Virtual Account (Simulasi)", sub: "BCA, Mandiri, BRI, BNI", icon: CreditCard },
  { id: "cod", title: "Bayar di Tempat / COD (Simulasi)", sub: "Bayar saat paket sampai", icon: Banknote },
];

const input =
  "w-full rounded-lg bg-white px-3 py-2 text-xs ring-1 ring-cream outline-none focus:ring-2 focus:ring-terracotta";

export default function CheckoutModal() {
  const { isCheckoutOpen } = useCart();
  if (!isCheckoutOpen) return null;
  return <CheckoutDialog />; // dipasang ulang tiap dibuka, jadi state selalu bersih
}

function CheckoutDialog() {
  const { setIsCheckoutOpen, checkoutItem, setCheckoutItem, cart, clearCart } = useCart();
  const { session } = useSession();
  const { refresh } = useOrders();

  const itemsToBuy = checkoutItem ? [checkoutItem] : cart;
  const itemsKey = JSON.stringify(itemsToBuy.map((i) => [i.slug, i.quantity]));
  const reqItems = useMemo(
    () => itemsToBuy.map((i) => ({ slug: i.slug, quantity: i.quantity })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [itemsKey]
  );

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [addressId, setAddressId] = useState("");
  const [preview, setPreview] = useState<CheckoutPreview | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: "Rumah", recipient_name: "", recipient_phone: "", full_address: "" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [method, setMethod] = useState<PaymentMethod>("qris");
  const [note, setNote] = useState("");
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");
  const [created, setCreated] = useState<CreatedOrder[] | null>(null);

  useEffect(() => {
    if (!session || created) return;
    let cancelled = false;
    (async () => {
      const [addr, prev] = await Promise.all([listAddressesAction(), previewCheckoutAction(reqItems)]);
      if (cancelled) return;
      if (!addr.ok || !prev.ok) {
        setLoadError(addr.error || prev.error || "Gagal memuat data checkout.");
      } else {
        const list = addr.data ?? [];
        setAddresses(list);
        setAddressId((list.find((a) => a.is_primary) ?? list[0])?.id ?? "");
        setShowForm(list.length === 0);
        setPreview(prev.data ?? null);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [session, reqItems, created]);

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setCheckoutItem(null);
  };

  const handleSaveAddress = async () => {
    setFormError("");
    setSaving(true);
    const res = await createAddressAction({ ...form, is_primary: addresses.length === 0 });
    setSaving(false);
    if (!res.ok || !res.data) {
      setFormError(res.error || "Gagal menyimpan alamat.");
      return;
    }
    setAddresses((prev) => [res.data!, ...prev]);
    setAddressId(res.data.id);
    setShowForm(false);
    setForm({ label: "Rumah", recipient_name: "", recipient_phone: "", full_address: "" });
  };

  const handlePay = async () => {
    if (paying || !addressId) return;
    setPaying(true);
    setPayError("");
    const res = await createDemoOrderAction({ addressId, items: reqItems, paymentMethod: method, note });
    if (!res.ok || !res.data) {
      setPayError(res.error || "Gagal membuat pesanan.");
      setPaying(false);
      return;
    }
    setCreated(res.data);
    if (!checkoutItem) clearCart();
    void refresh();
    setPaying(false);
  };

  const shell = (children: React.ReactNode) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-ink/50 backdrop-blur-xs" onClick={handleClose} aria-hidden="true" />
      <div className="relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-paper p-6 shadow-2xl ring-1 ring-cream sm:p-7">
        <button
          onClick={handleClose}
          className="absolute right-5 top-5 rounded-lg p-1.5 text-ink/60 hover:bg-cream hover:text-ink"
          aria-label="Tutup"
        >
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  );

  if (!session) {
    return shell(
      <div className="py-6 text-center">
        <h2 className="font-serif text-xl font-bold text-ink">Login Dulu Ya</h2>
        <p className="mt-2 text-xs text-ink/65">Kamu perlu login untuk melanjutkan pembelian.</p>
        <Link
          href="/login"
          onClick={handleClose}
          className="mt-5 inline-block rounded-xl bg-terracotta px-6 py-3 text-xs font-semibold text-white hover:bg-terracotta-dark"
        >
          Ke Halaman Login
        </Link>
      </div>
    );
  }

  // ---------- Sukses ----------
  if (created) {
    const grand = created.reduce((a, o) => a + o.totalAmount, 0);
    return shell(
      <div className="py-2 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 size={28} />
        </div>
        <h3 className="mt-3 font-serif text-xl font-bold text-ink">Pembayaran Berhasil</h3>
        <p className="mt-1 text-xs text-ink/65">Mode Demo: tidak ada uang sungguhan yang berpindah.</p>

        <div className="mt-5 space-y-2 text-left">
          {created.map((o) => (
            <Link
              key={o.orderCode}
              href={`/pesanan/${o.orderCode}`}
              onClick={handleClose}
              className="flex items-center justify-between gap-3 rounded-2xl bg-white p-3 ring-1 ring-cream hover:bg-cream/40"
            >
              <div className="min-w-0">
                <p className="font-mono text-xs font-bold text-ink">{o.orderCode}</p>
                <p className="truncate text-[11px] text-ink/60">{o.storeName}</p>
              </div>
              <span className="shrink-0 font-serif text-sm font-bold text-terracotta">{rupiah(o.totalAmount)}</span>
            </Link>
          ))}
        </div>

        <div className="mt-3 flex justify-between border-t border-cream pt-3 font-serif text-base font-bold text-terracotta">
          <span>Total Dibayar</span>
          <span>{rupiah(grand)}</span>
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <Link
            href={created.length === 1 ? `/pesanan/${created[0].orderCode}` : "/pesanan"}
            onClick={handleClose}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-terracotta py-3 text-xs font-semibold text-white hover:bg-terracotta-dark"
          >
            {created.length === 1 ? "Lihat Detail Pesanan" : "Lihat Pembelian Saya"} <ExternalLink size={14} />
          </Link>
          <button
            onClick={handleClose}
            className="w-full rounded-xl bg-cream py-2.5 text-xs font-semibold text-ink/70 hover:bg-sand/30"
          >
            Tutup
          </button>
        </div>
      </div>
    );
  }

  // ---------- Ringkasan ----------
  const canPay = !loading && !loadError && !!preview && !preview.hasProblem && !!addressId && !paying;

  return shell(
    <div>
      <div className="border-b border-cream pb-3">
        <span className="rounded-full bg-cream px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-terracotta">
          {checkoutItem ? "Beli Langsung" : "Pembayaran Keranjang"}
        </span>
        <h2 className="mt-1 font-serif text-xl font-bold text-ink">Checkout</h2>
      </div>

      {loadError && <p className="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-700 ring-1 ring-red-200">{loadError}</p>}

      {/* Alamat */}
      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-ink">
            <MapPin size={13} className="text-terracotta" /> Alamat Pengiriman
          </label>
          {!showForm && addresses.length > 0 && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1 text-[11px] font-semibold text-terracotta hover:underline"
            >
              <Plus size={12} /> Alamat baru
            </button>
          )}
        </div>

        {loading ? (
          <p className="text-xs text-ink/50">Memuat alamat…</p>
        ) : showForm ? (
          <div className="space-y-2 rounded-2xl bg-white p-3 ring-1 ring-cream">
            <input
              className={input}
              placeholder="Label (Rumah / Kantor)"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
            />
            <input
              className={input}
              placeholder="Nama penerima"
              value={form.recipient_name}
              onChange={(e) => setForm({ ...form, recipient_name: e.target.value })}
            />
            <input
              className={input}
              placeholder="Nomor HP penerima"
              inputMode="tel"
              value={form.recipient_phone}
              onChange={(e) => setForm({ ...form, recipient_phone: e.target.value })}
            />
            <textarea
              className={input}
              rows={3}
              placeholder="Alamat lengkap (jalan, RT/RW, desa, kecamatan, kota, kode pos)"
              value={form.full_address}
              onChange={(e) => setForm({ ...form, full_address: e.target.value })}
            />
            {formError && <p className="text-[11px] text-red-600">{formError}</p>}
            <div className="flex justify-end gap-2">
              {addresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormError("");
                  }}
                  className="rounded-lg bg-cream px-3 py-1.5 text-xs font-semibold text-ink"
                >
                  Batal
                </button>
              )}
              <button
                type="button"
                onClick={handleSaveAddress}
                disabled={saving}
                className="rounded-lg bg-terracotta px-4 py-1.5 text-xs font-semibold text-white hover:bg-terracotta-dark disabled:opacity-50"
              >
                {saving ? "Menyimpan…" : "Simpan Alamat"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {addresses.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setAddressId(a.id)}
                className={`flex w-full items-start justify-between gap-3 rounded-xl border p-3 text-left transition-all ${
                  addressId === a.id ? "border-terracotta bg-cream/50" : "border-cream bg-white hover:bg-cream/20"
                }`}
              >
                <div className="min-w-0 text-xs">
                  <p className="font-bold text-ink">
                    {a.label} · {a.recipient_name}
                    {a.is_primary && (
                      <span className="ml-1.5 rounded bg-sage/20 px-1.5 py-0.5 text-[10px] font-semibold text-forest">
                        Utama
                      </span>
                    )}
                  </p>
                  <p className="text-ink/60">{a.recipient_phone}</p>
                  <p className="mt-0.5 leading-relaxed text-ink/75">{a.full_address}</p>
                </div>
                <span
                  className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 ${
                    addressId === a.id ? "border-terracotta bg-terracotta" : "border-ink/30"
                  }`}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Item */}
      <div className="mt-5 max-h-48 space-y-2.5 overflow-y-auto pr-1">
        {itemsToBuy.map((item) => {
          const line = preview?.lines.find((l) => l.slug === item.slug);
          const price = line?.unitPrice || item.price;
          return (
            <div key={item.slug} className="rounded-2xl bg-white p-3 ring-1 ring-cream">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-cream">
                  <ImageBox src={item.image} alt={item.name} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 font-serif text-xs font-semibold text-ink">{item.name}</p>
                  <p className="text-[11px] text-ink/60">
                    {item.quantity} x {rupiah(price)}
                  </p>
                </div>
                <span className="font-serif text-xs font-bold text-terracotta">{rupiah(price * item.quantity)}</span>
              </div>
              {line?.problem && <p className="mt-2 text-[11px] font-semibold text-red-600">{line.problem}</p>}
            </div>
          );
        })}
      </div>

      {/* Metode */}
      <div className="mt-5">
        <label className="mb-2 block text-xs font-semibold text-ink">Metode Pembayaran (Simulasi)</label>
        <div className="space-y-2">
          {METHODS.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMethod(m.id)}
                className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all ${
                  method === m.id ? "border-terracotta bg-cream/50 shadow-xs" : "border-cream bg-white hover:bg-cream/20"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-terracotta/10 text-terracotta">
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-ink">{m.title}</p>
                    <p className="text-[10px] text-ink/50">{m.sub}</p>
                  </div>
                </div>
                <span
                  className={`h-4 w-4 rounded-full border-2 ${
                    method === m.id ? "border-terracotta bg-terracotta" : "border-ink/30"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Catatan */}
      <div className="mt-4">
        <label className="mb-1.5 block text-xs font-semibold text-ink" htmlFor="catatan-penjual">
          Catatan untuk penjual (opsional)
        </label>
        <textarea
          id="catatan-penjual"
          className={input}
          rows={2}
          maxLength={200}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Contoh: tolong dikemas rapi untuk oleh-oleh."
        />
      </div>

      {/* Total */}
      <div className="mt-5 space-y-1.5 rounded-2xl bg-cream/40 p-4 text-xs text-ink/80">
        <div className="flex justify-between">
          <span>Subtotal ({itemsToBuy.reduce((a, b) => a + b.quantity, 0)} produk)</span>
          <span>{preview ? rupiah(preview.subtotal) : "…"}</span>
        </div>
        {preview?.stores.map((s) => (
          <div key={s.storeSlug} className="flex justify-between">
            <span className="truncate pr-2">Ongkir · {s.storeName}</span>
            <span>{rupiah(s.shippingCost)}</span>
          </div>
        ))}
        <div className="flex justify-between border-t border-cream pt-2 font-serif text-base font-bold text-terracotta">
          <span>Total Pembayaran</span>
          <span>{preview ? rupiah(preview.total) : "…"}</span>
        </div>
      </div>

      {/* Banner demo */}
      <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-[11px] leading-relaxed text-amber-900 ring-1 ring-amber-200">
        <FlaskConical size={14} className="mt-0.5 shrink-0" />
        <span>
          <strong>Mode Demo</strong> – tidak ada transaksi uang sebenarnya. Pembayaran otomatis berhasil.
        </span>
      </div>

      {payError && <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-700 ring-1 ring-red-200">{payError}</p>}

      <button
        type="button"
        onClick={handlePay}
        disabled={!canPay}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-terracotta py-3.5 text-center text-sm font-semibold text-white shadow-sm transition-colors hover:bg-terracotta-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        {paying ? "Memproses…" : "Bayar Sekarang (Mode Demo)"}
      </button>
      {!addressId && !loading && !showForm && (
        <p className="mt-2 text-center text-[11px] text-ink/60">Pilih atau tambah alamat dulu.</p>
      )}
    </div>
  );
}
