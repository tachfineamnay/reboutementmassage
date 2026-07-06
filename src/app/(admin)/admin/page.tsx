import { redirect } from "next/navigation";

/**
 * /admin -> redirection permanente vers le tableau de bord principal.
 */
export default function AdminRootPage() {
  redirect("/admin/dashboard");
}
