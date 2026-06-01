import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/auth";

// Routes admin publiques (pas d'auth requise)
const PUBLIC_ROUTES = ["/admin/login"];

export async function middleware(request: NextRequest) {
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

    // Session valide → laisse passer
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

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
