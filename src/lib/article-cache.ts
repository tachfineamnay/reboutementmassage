import { revalidatePath } from "next/cache";
import { getArticlePublicPath, getStoriesIndexPath } from "./routes";

type ArticleRoute = {
  locale: string;
  slug: string;
};

export function revalidateArticlePublicPaths(
  ...articles: Array<ArticleRoute | null | undefined>
) {
  const paths = new Set<string>(["/sitemap.xml"]);

  for (const article of articles) {
    if (!article) continue;
    paths.add(getStoriesIndexPath(article.locale));
    paths.add(getArticlePublicPath(article));
  }

  for (const path of paths) {
    revalidatePath(path);
  }
}
