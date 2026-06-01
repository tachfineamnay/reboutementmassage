import { notFound, permanentRedirect } from "next/navigation";
import { normalizeArticleLocale } from "@/lib/routes";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function LegacyLocaleArticlePage({ params }: Props) {
  const { locale, slug } = await params;

  const validLocales = ["fr", "en", "es"];
  const l = locale.toLowerCase();

  if (!validLocales.includes(l)) {
    notFound();
  }

  const normalizedLang = normalizeArticleLocale(l);
  permanentRedirect(`/${normalizedLang}/stories/${slug}`);
}
