"use client";
import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getSession, type Session } from "@/lib/session";

// Guard HANYA untuk pengalaman pengguna. Keamanan sebenarnya (RLS Supabase) ada di BE.
export default function RoleGuard({
  allow, children,
}: { allow: NonNullable<Session>["role"][]; children: ReactNode }) {
  const router = useRouter();
  const s = getSession();
  const ok = !!s && allow.includes(s.role);
  useEffect(() => {
    if (!ok) router.replace("/login");
  }, [ok, router]);
  return ok ? <>{children}</> : null;
}
