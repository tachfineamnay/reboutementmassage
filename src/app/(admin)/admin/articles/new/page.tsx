import type { Metadata } from "next";
import NewArticleForm from "@/components/admin/NewArticleForm";

export const metadata: Metadata = {
  title: "Nouvel Article — Platform Admin",
  robots: { index: false, follow: false },
};

export default function NewArticlePage() {
  return (
    <div className="admin-page admin-page--centered">
      <NewArticleForm />
    </div>
  );
}
