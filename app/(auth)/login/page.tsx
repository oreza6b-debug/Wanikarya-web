"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, User, CheckCircle2 } from "lucide-react";
import ImageBox from "@/components/ImageBox";
import { loginAction } from "@/app/actions/auth";
import { useSession } from "@/components/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { refreshSession } = useSession();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setPending(true);
    try {
      const res = await loginAction({ identifier, password });
      if (!res.ok) {
        setErrorMsg(res.error ?? "Gagal masuk ke akun.");
        return;
      }

      await refreshSession();

      const nextParam =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("next")
          : null;
      const safeNext =
        nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//") && !nextParam.includes("\\")
          ? nextParam
          : null;

      let target = res.role === "womanpreneur" ? "/usaha/dashboard" : "/";
      if (safeNext) {
        if (safeNext.startsWith("/usaha") && res.role !== "womanpreneur") {
          target = "/pesanan";
        } else {
          target = safeNext;
        }
      }

      router.push(target);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Card */}
      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-sand/30">
        {/* Hero image rounded di dalam card */}
        <div className="relative h-44 w-full overflow-hidden rounded-2xl bg-sage/20">
          <ImageBox
            src="/images/bu-sumarsih.jpg"
            alt="Pawon Salak Lestari - Ibu Nurul Aini"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-ink/80 via-ink/25 to-transparent p-4">
            <div className="mb-1.5 flex items-center gap-2">
              <span className="rounded-md bg-forest/85 px-2 py-0.5 text-[11px] font-semibold text-white">
                Pawon Salak Lestari
              </span>
              <span className="text-[11px] font-medium text-white/90">
                Ibu Nurul Aini
              </span>
            </div>
            <p className="font-serif text-sm italic leading-snug text-white">
              &ldquo;Setiap karya punya wajah dan cerita pembuatnya.&rdquo;
            </p>
          </div>
        </div>

        <div className="pt-6">
          {/* Title */}
          <h2 className="font-serif text-2xl font-bold text-ink">
            Selamat Datang Kembali
          </h2>
          <p className="mt-1 mb-6 text-xs leading-relaxed text-ink/60">
            Akses portal komunitas wirausaha dan pembeli Desa Wisata Gabugan.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email / WhatsApp */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink/75">
                Alamat Email atau Nomor WhatsApp
              </label>
              <div className="relative">
                <User
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35"
                />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="contoh: nurulaini@wanikarya.id"
                  className="w-full rounded-xl bg-cream/65 py-3 pl-10 pr-4 text-xs text-ink placeholder:text-ink/35 outline-none ring-1 ring-sand/25 transition focus:ring-2 focus:ring-terracotta/40"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-semibold text-ink/75">
                  Kata Sandi
                </label>
                <Link
                  href="/lupa-sandi"
                  className="text-xs font-medium text-terracotta hover:underline"
                >
                  Lupa Kata Sandi?
                </Link>
              </div>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi akun Anda"
                  className="w-full rounded-xl bg-cream/65 py-3 pl-10 pr-10 text-xs text-ink placeholder:text-ink/35 outline-none ring-1 ring-sand/25 transition focus:ring-2 focus:ring-terracotta/40"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Tampilkan atau sembunyikan kata sandi"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/40 transition hover:text-ink/70"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label className="flex cursor-pointer select-none items-center gap-2 pt-0.5">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-sand/50 accent-terracotta"
              />
              <span className="text-xs text-ink/65">
                Ingat sesi saya di peramban ini
              </span>
            </label>

            {/* Error */}
            {errorMsg && (
              <div className="rounded-xl bg-red-50 px-3.5 py-2.5 text-xs text-red-700 ring-1 ring-red-200">
                {errorMsg}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={pending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-terracotta py-3 text-sm font-semibold text-white transition hover:bg-terracotta-dark disabled:opacity-60"
            >
              {pending ? "Memproses..." : "Masuk ke Akun WaniKarya →"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-sand/35" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-[11px] font-medium tracking-wider text-ink/40">
                ATAU
              </span>
            </div>
          </div>

          {/* Register link */}
          <div className="text-center text-xs text-ink/60">
            <p>Belum terdaftar di ekosistem desa?</p>
            <Link
              href="/daftar"
              className="mt-1 inline-block font-semibold text-ink transition hover:text-terracotta hover:underline"
            >
              Daftar sebagai Pembeli atau Pengrajin Baru ↗
            </Link>
          </div>

          {/* Trust bar */}
          <div className="mt-5 flex items-center justify-between rounded-xl bg-cream/60 px-3.5 py-2.5 text-[11px] text-ink/65">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="shrink-0 text-forest" />
              Keamanan data terverifikasi
            </span>
            <span className="text-ink/55">Gabugan, Sleman</span>
          </div>
        </div>
      </div>
    </div>
  );
}
