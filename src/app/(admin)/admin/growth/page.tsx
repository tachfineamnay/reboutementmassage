import { redirect } from "next/navigation";

export default function AdminGrowthRedirectPage() {
  redirect("/admin/dashboard");
}
