import { permanentRedirect } from "next/navigation";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export const dynamic = "force-dynamic";

export default async function LegacyStoryRedirect({ params }: Props) {
  const { slug } = await params;
  permanentRedirect(`/stories/${slug}`);
}
