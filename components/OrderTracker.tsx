import { fmtDate, type Order, type OrderStatus } from "@/lib/orders";
import { Check, Clock, ShoppingBag, Truck, CheckCircle2 } from "lucide-react";

const STEPS: { status: OrderStatus; label: string; icon: typeof Clock }[] = [
  { status: "dibayarkan", label: "1. Dibayarkan", icon: Check },
  { status: "dikemas", label: "2. Dikemas", icon: ShoppingBag },
  { status: "dikirim", label: "3. Dikirim", icon: Truck },
  { status: "selesai", label: "4. Pesanan Selesai", icon: CheckCircle2 },
];

export default function OrderTracker({ order: o }: { order: Order }) {
  if (o.status === "dibatalkan") {
    const at = o.history.find((h) => h.status === "dibatalkan")?.at;
    return (
      <div className="rounded-2xl bg-red-50 p-5 ring-1 ring-red-200">
        <p className="font-serif text-lg font-semibold text-red-800">Pesanan Dibatalkan</p>
        <p className="mt-1 text-xs text-red-700">
          {o.cancelReason ? `Alasan: ${o.cancelReason}` : "Pesanan ini telah dibatalkan."}
        </p>
        {at && <p className="mt-2 text-[11px] text-red-600/80">{fmtDate(at)}</p>}
      </div>
    );
  }

  const stepOrder: OrderStatus[] = ["dibayarkan", "dikemas", "dikirim", "selesai"];
  const currentIndex = o.status === "selesai" ? 4 : stepOrder.indexOf(o.status) + 1;

  return (
    <div className="rounded-3xl bg-white p-5 shadow-xs ring-1 ring-cream">
      <div className="mb-4 flex items-center justify-between text-xs text-ink/60 border-b border-cream/70 pb-3">
        <span className="font-bold uppercase tracking-wider text-[10px] text-ink/70">
          Pelacakan Status Pesanan
        </span>
        <span className="font-medium">Tahap {Math.min(currentIndex, 4)} dari 4</span>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 relative">
        {STEPS.map((s, idx) => {
          const stepNum = idx + 1;
          const isDone = stepNum < currentIndex || o.status === "selesai";
          const isActive = stepNum === currentIndex && o.status !== "selesai";
          const historyItem = o.history.find((h) => h.status === s.status);

          let subtitle = "Belum";
          if (s.status === "dibayarkan") {
            subtitle = isDone
              ? `${historyItem ? fmtDate(historyItem.at) : "Selesai"}`
              : "Menunggu pembayaran";
          } else if (s.status === "dikemas") {
            subtitle = isDone
              ? "Selesai dikemas"
              : isActive
              ? "Menyiapkan besek anyaman bambu"
              : "Menunggu konfirmasi";
          } else if (s.status === "dikirim") {
            subtitle = isDone
              ? "Paket telah sampai"
              : isActive
              ? `${o.ekspedisi || "J&T Express"} • Sedang Menuju Alamat`
              : "Belum diserahkan ke kurir";
          } else if (s.status === "selesai") {
            subtitle = isDone
              ? "Dikonfirmasi Pembeli"
              : "Menunggu paket diterima";
          }

          return (
            <div key={s.status} className="flex flex-col items-center sm:items-start text-center sm:text-left">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    isDone
                      ? "bg-forest text-white"
                      : isActive
                      ? "bg-terracotta text-white ring-4 ring-terracotta/20"
                      : "bg-cream text-ink/40"
                  }`}
                >
                  {isDone ? <Check size={14} /> : stepNum}
                </span>
                <span
                  className={`hidden sm:inline text-xs font-bold ${
                    isActive ? "text-terracotta" : isDone ? "text-forest" : "text-ink/50"
                  }`}
                >
                  {isDone ? "SELESAI" : isActive ? "AKTIF" : "BELUM"}
                </span>
              </div>

              <p className={`text-xs font-bold ${isActive ? "text-terracotta" : isDone ? "text-ink" : "text-ink/50"}`}>
                {s.label}
              </p>
              <p className="mt-0.5 text-[11px] text-ink/65 leading-tight">{subtitle}</p>
              {historyItem && isDone && (
                <p className="text-[10px] text-ink/45 mt-0.5">{fmtDate(historyItem.at)}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
