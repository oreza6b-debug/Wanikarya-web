import { redirect } from "next/navigation";

export default async function JasaWisataSlugRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/her-experience/${slug}`);
}
