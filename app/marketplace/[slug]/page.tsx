import { redirect } from "next/navigation";

export default async function MarketplaceSlugRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/her-market/${slug}`);
}
