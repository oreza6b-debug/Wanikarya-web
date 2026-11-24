import { redirect } from "next/navigation";

export default async function WomanpreneurSlugRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/her-story/${slug}`);
}
