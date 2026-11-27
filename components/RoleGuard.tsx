"use client";
import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/AuthProvider";
import type { Session } from "@/lib/session";

// Guard HANYA untuk pengalaman pengguna. Keamanan sebenarnya (RLS Supabase) ada di BE.
export default function RoleGuard({
  allow, children,
}: { allow: NonNullable<Session>["role"][]; children: ReactNode }) {
  const router = useRouter();
  const { session, loading } = useSession();
  const ok = !!session && allow.includes(session.role);

  useEffect(() => {
    if (loading) return;
    if (!session) {
      router.replace("/login");
    } else if (!allow.includes(session.role)) {
      router.replace("/pesanan");
    }
  }, [loading, session, allow, router]);

  if (!ok) return null;
  return <>{children}</>;
}
