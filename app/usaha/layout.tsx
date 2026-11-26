import type { ReactNode } from "react";
import RoleGuard from "@/components/RoleGuard";
import UsahaSidebar from "@/components/UsahaSidebar";
import SellerTopBar from "@/components/SellerTopBar";

// Area Womanpreneur (Mode Usaha). Guard ini hanya untuk UX; keamanan data tetap di BE (RLS).
export default function UsahaLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allow={["womanpreneur"]}>
      <SellerTopBar />
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-[240px_1fr]">
        <UsahaSidebar />
        <div className="min-w-0">{children}</div>
      </div>
    </RoleGuard>
  );
}
