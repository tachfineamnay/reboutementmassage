import { redirect } from "next/navigation";

/**
 * /admin → redirection permanente vers /admin/overview
 */
export default function AdminRootPage() {
  redirect("/admin/overview");
}
