import { redirect } from "next/navigation";

export default async function DesaSlugRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/her-village/${slug}`);
}
