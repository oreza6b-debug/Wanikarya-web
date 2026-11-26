"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Lock,
  LogIn,
  Mail,
  Phone,
  RefreshCw,
  ShoppingBag,
  Sprout,
  User,
  UserPlus,
} from "lucide-react";
import { registerAction } from "@/app/actions/auth";
import { useSession } from "@/components/AuthProvider";

export default function DaftarPage() {
  const router = useRouter();
  const { refreshSession } = useSession();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agree, setAgree] = useState(false);
  const [pending, setPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState({
    nama: "",
    whatsapp: "",
    email: "",
    password: "",
    konfirmasi: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (!agree) {
      setErrorMsg("Harap setujui Syarat & Ketentuan terlebih dahulu.");
      return;
    }
    if (form.password !== form.konfirmasi) {
      setErrorMsg("Kata sandi dan konfirmasi tidak cocok.");
      return;
    }

    setPending(true);
    try {
      const res = await registerAction({ ...form, agree });
      if (!res.ok) {
        setErrorMsg(res.error ?? "Pendaftaran gagal.");
        return;
      }
      if (res.error) {
        setErrorMsg(res.error);
        return;
      }

      await refreshSession();
      router.push("/");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-sand/30">
        {/* Role badge */}
        <div className="mb-5 flex justify-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-sage/20 px-4 py-1.5 text-xs font-semibold text-forest">
            <ShoppingBag size={13} />
            Akses Akun Pembeli &amp; Pelancong
          </div>
        </div>

        {/* Tab switcher */}
        <div className="mb-6 flex rounded-xl bg-cream/80 p-1 ring-1 ring-sand/25">
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold text-ink/65 transition hover:text-ink"
          >
            <LogIn size={13} />
            Masuk
          </button>
          <button
            type="button"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white py-2 text-xs font-semibold text-terracotta shadow-xs"
          >
            <UserPlus size={13} />
            Daftar Baru
          </button>
        </div>

        {/* Title */}
        <h2 className="font-serif text-2xl font-bold text-ink">
          Buat Akun Baru
        </h2>
        <p className="mt-1 mb-6 text-xs leading-relaxed text-ink/60">
          Bergabunglah untuk mendukung karya lokal perempuan Desa Wisata Gabugan.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama Lengkap */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-semibold text-ink/75">
                Nama Lengkap
              </label>
              <span className="text-[11px] text-ink/45">Wajib</span>
            </div>
            <div className="relative">
              <User
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35"
              />
              <input
                type="text"
                name="nama"
                value={form.nama}
                onChange={handleChange}
                placeholder="Nurul Aini"
                className="w-full rounded-xl bg-cream/65 py-3 pl-10 pr-4 text-xs text-ink placeholder:text-ink/35 outline-none ring-1 ring-sand/25 transition focus:ring-2 focus:ring-terracotta/40"
                required
              />
            </div>
          </div>

          {/* WhatsApp */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-semibold text-ink/75">
                Nomor WhatsApp Aktif
              </label>
              <span className="text-[11px] text-ink/45">Wajib</span>
            </div>
            <div className="relative">
              <Phone
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35"
              />
              <input
                type="tel"
                name="whatsapp"
                value={form.whatsapp}
                onChange={handleChange}
                placeholder="08123456789"
                className="w-full rounded-xl bg-cream/65 py-3 pl-10 pr-4 text-xs text-ink placeholder:text-ink/35 outline-none ring-1 ring-sand/25 transition focus:ring-2 focus:ring-terracotta/40"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-semibold text-ink/75">
                Alamat Email
              </label>
              <span className="text-[11px] text-ink/45">Wajib</span>
            </div>
            <div className="relative">
              <Mail
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35"
              />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="nama@email.com"
                className="w-full rounded-xl bg-cream/65 py-3 pl-10 pr-4 text-xs text-ink placeholder:text-ink/35 outline-none ring-1 ring-sand/25 transition focus:ring-2 focus:ring-terracotta/40"
                required
              />
            </div>
          </div>

          {/* Kata Sandi */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink/75">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35"
              />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimal 8 karakter"
                className="w-full rounded-xl bg-cream/65 py-3 pl-10 pr-10 text-xs text-ink placeholder:text-ink/35 outline-none ring-1 ring-sand/25 transition focus:ring-2 focus:ring-terracotta/40"
                minLength={8}
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

          {/* Konfirmasi Kata Sandi */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink/75">
              Konfirmasi Kata Sandi
            </label>
            <div className="relative">
              <RefreshCw
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35"
              />
              <input
                type={showConfirm ? "text" : "password"}
                name="konfirmasi"
                value={form.konfirmasi}
                onChange={handleChange}
                placeholder="Ulangi kata sandi"
                className="w-full rounded-xl bg-cream/65 py-3 pl-10 pr-10 text-xs text-ink placeholder:text-ink/35 outline-none ring-1 ring-sand/25 transition focus:ring-2 focus:ring-terracotta/40"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                aria-label="Tampilkan atau sembunyikan konfirmasi kata sandi"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/40 transition hover:text-ink/70"
              >
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Agree */}
          <label className="flex cursor-pointer select-none items-start gap-2.5 pt-0.5">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-sand/50 accent-terracotta"
            />
            <span className="text-xs leading-relaxed text-ink/65">
              Saya menyetujui{" "}
              <Link href="/syarat-ketentuan" className="font-medium text-terracotta hover:underline">
                Syarat &amp; Ketentuan
              </Link>{" "}
              serta{" "}
              <Link href="/kebijakan-privasi" className="font-medium text-terracotta hover:underline">
                Kebijakan Privasi
              </Link>{" "}
              WaniKarya.
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
            className="w-full rounded-xl bg-terracotta py-3 text-sm font-semibold text-white transition hover:bg-terracotta-dark disabled:opacity-60"
          >
            {pending ? "Mendaftarkan..." : "Daftar Akun Baru →"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-sand/35" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-xs text-ink/45">atau</span>
          </div>
        </div>

        {/* Login link */}
        <p className="text-center text-xs text-ink/60">
          Sudah memiliki akun?{" "}
          <Link
            href="/login"
            className="font-semibold text-terracotta hover:underline"
          >
            Masuk sekarang
          </Link>
        </p>

        {/* Benefit card */}
        <div className="mt-5 flex items-start gap-3 rounded-2xl bg-cream/65 p-4 ring-1 ring-sand/20">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage/20 text-forest">
            <Sprout size={16} />
          </div>
          <div>
            <p className="mb-0.5 text-xs font-semibold text-ink">
              Dukungan Langsung 100%
            </p>
            <p className="text-xs leading-relaxed text-ink/60">
              Tiap transaksi Anda langsung mendukung perajin perempuan &amp;
              pelestarian alam Gabugan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
