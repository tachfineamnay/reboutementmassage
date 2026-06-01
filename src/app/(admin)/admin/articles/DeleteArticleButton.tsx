"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

type Props = {
  id: string;
  title: string;
};

export default function DeleteArticleButton({ id, title }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Supprimer "${title}" ? Cette action est irréversible.`)) return;

    startTransition(async () => {
      await fetch(`/api/admin/articles/${id}`, { method: "DELETE" });
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="admin-action admin-action--danger"
      title="Supprimer"
    >
      {isPending ? "…" : "Supprimer"}
    </button>
  );
}
