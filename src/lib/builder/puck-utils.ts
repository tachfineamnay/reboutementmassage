import { revalidatePath } from "next/cache";
import type { LandingPage } from "@prisma/client";
import { localeToLang } from "@/lib/growth/types";

export function getLandingPublicPath(landing: Pick<LandingPage, "locale" | "slug">) {
  return `/${localeToLang(landing.locale)}/${landing.slug}`;
}

export function revalidateLandingStudioPaths(landing: Pick<LandingPage, "id" | "locale" | "slug">) {
  revalidatePath("/admin/pages");
  revalidatePath("/admin/landings");
  revalidatePath("/admin/dashboard");
  revalidatePath(`/admin/pages/${landing.id}/studio`);
  revalidatePath(`/admin/pages/${landing.id}/settings`);
  revalidatePath(`/admin/landings/${landing.id}/edit`);
  revalidatePath(getLandingPublicPath(landing));
}

export function getPreviewUrl(landing: Pick<LandingPage, "locale" | "slug" | "previewToken">) {
  const publicPath = getLandingPublicPath(landing);
  return landing.previewToken ? `${publicPath}?preview=${encodeURIComponent(landing.previewToken)}` : publicPath;
}
