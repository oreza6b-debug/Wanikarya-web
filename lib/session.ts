// MOCK SESI. Ganti dengan sesi Supabase saat BE siap.
// Ubah role/storeSlug di sini untuk menguji tampilan lain.
export type Session = {
  userId: string;
  name: string;
  role: "buyer" | "womanpreneur" | "admin";
  storeSlug?: string;
} | null;

export function getSession(): Session {
  return { userId: "u-sumarsih", name: "Bu Sumarsih", role: "womanpreneur", storeSlug: "bu-sumarsih" };
  // return null; // simulasi belum login
}
