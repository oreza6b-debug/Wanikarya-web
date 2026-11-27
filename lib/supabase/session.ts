import { createClient } from "@/lib/supabase/server";
import type { Session, UserRole } from "@/lib/session";

export async function getServerSession(): Promise<Session> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, role")
    .eq("id", user.id)
    .maybeSingle();

  const role: UserRole =
    profile?.role === "womanpreneur" || profile?.role === "admin"
      ? profile.role
      : "buyer";

  let storeInfo:
    | { id: string; slug: string; business_name: string }
    | null = null;

  if (role === "womanpreneur") {
    const { data: store } = await supabase
      .from("stores")
      .select("id, slug, business_name")
      .eq("owner_id", user.id)
      .maybeSingle();
    storeInfo = store ?? null;
  }

  const fallbackName =
    (typeof user.user_metadata?.full_name === "string" &&
      user.user_metadata.full_name.trim()) ||
    user.email?.split("@")[0] ||
    "Pengguna WaniKarya";

  return {
    userId: user.id,
    email: user.email ?? "",
    name: profile?.full_name || fallbackName,
    phone: profile?.phone ?? null,
    role,
    storeId: storeInfo?.id,
    storeSlug: storeInfo?.slug,
    storeName: storeInfo?.business_name,
  };
}
