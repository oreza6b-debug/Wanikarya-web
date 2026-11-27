"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { Session, UserRole } from "@/lib/session";

type AuthContextValue = {
  session: Session;
  loading: boolean;
  refreshSession: () => Promise<Session>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchBrowserSession(): Promise<Session> {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
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

export function AuthProvider({
  initialSession,
  children,
}: {
  initialSession: Session;
  children: ReactNode;
}) {
  const [session, setSession] = useState<Session>(initialSession);
  const [loading, setLoading] = useState(false);

  const refreshSession = useCallback(async () => {
    setLoading(true);
    try {
      const next = await fetchBrowserSession();
      setSession((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
      return next;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setSession(initialSession);
  }, [initialSession]);

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, authSession) => {
      if (!authSession) {
        setSession(null);
      } else {
        void refreshSession();
      }
    });

    return () => subscription.unsubscribe();
  }, [refreshSession]);

  return (
    <AuthContext.Provider value={{ session, loading, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useSession harus dipakai di dalam <AuthProvider>");
  }
  return ctx;
}
