import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/auth";
import { getCanonicalLocalizedPath, isLocale, type Locale } from "@/lib/seo";

// Routes admin publiques (pas d'auth requise)
const PUBLIC_ROUTES = ["/admin/login"];
const SUPPORTED_LOCALES: Locale[] = ["fr", "en", "es"];

function detectPreferredLocale(request: NextRequest): Locale {
  const cookieLocale =
    request.cookies.get("NEXT_LOCALE")?.value ??
    request.cookies.get("locale")?.value ??
    request.cookies.get("lang")?.value;

  if (cookieLocale && isLocale(cookieLocale.toLowerCase())) {
    return cookieLocale.toLowerCase() as Locale;
  }

  const acceptLanguage = request.headers.get("accept-language") ?? "";
  for (const languageRange of acceptLanguage.split(",")) {
    const locale = languageRange.trim().split(";")[0]?.toLowerCase().split("-")[0];
    if (locale && SUPPORTED_LOCALES.includes(locale as Locale)) return locale as Locale;
  }

  return "fr";
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1. Routes admin UI ────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    // Autoriser la page de login sans token
    if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
      return NextResponse.next();
    }

    const token = request.cookies.get("admin_session")?.value;
    const session = await decrypt(token);

    if (!session) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Session valide -> laisse passer
    return NextResponse.next();
  }

  // ── 2. Routes API admin ───────────────────────────────────────────────────
  if (pathname.startsWith("/api/admin")) {
    // /api/admin/logout est accessible sans session (pour effacer le cookie)
    if (pathname === "/api/admin/logout") {
      return NextResponse.next();
    }

    const token = request.cookies.get("admin_session")?.value;
    const session = await decrypt(token);

    if (!session) {
      return NextResponse.json(
        { error: "Non authentifié." },
        { status: 401 }
      );
    }

    return NextResponse.next();
  }

  // ── 3. Routage public i18n ────────────────────────────────────────────────
  if (pathname === "/") {
    const locale = detectPreferredLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}`;
    return NextResponse.redirect(url);
  }

  const canonicalPath = getCanonicalLocalizedPath(pathname);
  if (canonicalPath) {
    const url = request.nextUrl.clone();
    url.pathname = canonicalPath;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/admin/:path*",
    "/api/admin/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|llms.txt|.*\\..*).*)",
  ],
};
