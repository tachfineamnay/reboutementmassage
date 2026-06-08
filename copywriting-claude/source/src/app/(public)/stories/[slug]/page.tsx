import { notFound, permanentRedirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getArticlePublicPath } from "@/lib/routes";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function LegacyArticlePage({ params }: Props) {
  const { slug } = await params;

  // Chercher article PUBLISHED slug + locale FR en priorité
  let article = await prisma.article.findFirst({
    where: { slug, status: "PUBLISHED", locale: "FR" },
    select: { slug: true, locale: true },
  });

  if (!article) {
    // Sinon chercher le premier article PUBLISHED avec ce slug
    article = await prisma.article.findFirst({
      where: { slug, status: "PUBLISHED" },
      select: { slug: true, locale: true },
    });
  }

  if (!article) {
    notFound();
  }

  permanentRedirect(getArticlePublicPath({ locale: article.locale, slug: article.slug }));
}
