import { redirect } from "next/navigation";

// /usaha → redirect ke dashboard utama
export default function UsahaPage() {
  redirect("/usaha/dashboard");
}
