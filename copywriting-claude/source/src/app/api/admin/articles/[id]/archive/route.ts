import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

/**
 * POST /api/admin/articles/[id]/archive
 *
 * Passe l'article en ARCHIVED.
 */
export async function POST(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;

  const article = await prisma.article.findUnique({
    where: { id },
    select: { id: true, status: true },
  });
  if (!article)
    return NextResponse.json({ error: "Article non trouvé" }, { status: 404 });

  if (article.status === "ARCHIVED") {
    return NextResponse.json(
      { error: "L'article est déjà archivé." },
      { status: 409 }
    );
  }

  const updated = await prisma.article.update({
    where: { id },
    data: { status: "ARCHIVED" },
    select: { id: true, status: true, updatedAt: true },
  });

  return NextResponse.json(updated);
}
