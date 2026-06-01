import { redirect } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

/**
 * /admin/articles/[id]/edit → redirect vers /admin/articles/[id]
 * La page d'édition est maintenant directement sur [id].
 */
export default async function EditRedirectPage({ params }: Props) {
  const { id } = await params;
  redirect(`/admin/articles/${id}`);
}
