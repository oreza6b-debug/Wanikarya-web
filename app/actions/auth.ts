"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getServerSession } from "@/lib/supabase/session";

export type AuthActionResult = {
  ok: boolean;
  error?: string;
  role?: "buyer" | "womanpreneur" | "admin";
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function loginAction(input: {
  identifier: string;
  password: string;
}): Promise<AuthActionResult> {
  const identifier = input.identifier.trim();
  const password = input.password;

  if (!identifier || !password) {
    return { ok: false, error: "Email dan kata sandi wajib diisi." };
  }

  // Keputusan MVP #1: login hanya memakai email; input nomor WA ditolak dengan pesan ramah.
  if (!EMAIL_REGEX.test(identifier)) {
    return {
      ok: false,
      error:
        "Login saat ini hanya mendukung alamat email. Silakan masuk menggunakan email Anda.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: identifier.toLowerCase(),
    password,
  });

  if (error) {
    if (error.message.toLowerCase().includes("invalid login credentials")) {
      return { ok: false, error: "Email atau kata sandi salah." };
    }
    if (error.message.toLowerCase().includes("email not confirmed")) {
      return {
        ok: false,
        error: "Email akun ini belum dikonfirmasi. Silakan cek kotak masuk email Anda.",
      };
    }
    return { ok: false, error: "Gagal masuk ke akun. Silakan coba lagi." };
  }

  const session = await getServerSession();
  revalidatePath("/", "layout");

  return {
    ok: true,
    role: session?.role ?? "buyer",
  };
}

export async function registerAction(input: {
  nama: string;
  whatsapp: string;
  email: string;
  password: string;
  konfirmasi: string;
  agree: boolean;
}): Promise<AuthActionResult> {
  const fullName = input.nama.trim();
  const phone = input.whatsapp.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!input.agree) {
    return {
      ok: false,
      error: "Harap setujui Syarat & Ketentuan serta Kebijakan Privasi.",
    };
  }
  if (!fullName || !phone || !email || !password) {
    return { ok: false, error: "Semua kolom wajib diisi." };
  }
  if (!EMAIL_REGEX.test(email)) {
    return { ok: false, error: "Format alamat email tidak valid." };
  }
  if (password.length < 8) {
    return { ok: false, error: "Kata sandi minimal 8 karakter." };
  }
  if (password !== input.konfirmasi) {
    return { ok: false, error: "Kata sandi dan konfirmasi tidak cocok." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone,
      },
    },
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("already registered") || msg.includes("already been registered")) {
      return {
        ok: false,
        error: "Email sudah terdaftar. Silakan masuk dengan akun Anda.",
      };
    }
    return { ok: false, error: "Pendaftaran gagal. Silakan periksa data Anda." };
  }

  // Fallback jika Confirm Email masih aktif di dashboard Supabase
  if (!data.session) {
    return {
      ok: true,
      role: "buyer",
      error: "Akun berhasil dibuat. Silakan cek email untuk verifikasi sebelum login.",
    };
  }

  revalidatePath("/", "layout");
  return { ok: true, role: "buyer" };
}

export async function logoutAction(): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    return { ok: false, error: "Gagal keluar dari akun." };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}
