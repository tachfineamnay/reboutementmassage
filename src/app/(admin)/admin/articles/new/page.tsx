import type { Metadata } from "next";
import Link from "next/link";
import NewArticleForm from "@/components/admin/NewArticleForm";

export const metadata: Metadata = {
  title: "Nouveau Studio — GT Dash",
  robots: { index: false, follow: false },
};

export default function NewArticlePage() {
  return (
    <div className="admin-page admin-page--narrow">
      <div className="admin-page__header">
        <div>
          <Link href="/admin/articles" className="admin-breadcrumb">
            ← Articles
          </Link>
          <h1 className="admin-page__title">Nouveau Studio Article</h1>
        </div>
      </div>

      <NewArticleForm />
    </div>
  );
}
