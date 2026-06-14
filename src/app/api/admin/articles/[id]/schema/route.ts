import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ensureAdminSchema } from "@/lib/admin-schema";

type Params = { params: Promise<{ id: string }> };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeCustomJsonLd(value: unknown): Prisma.InputJsonValue {
  if (value === null || typeof value === "undefined") return [];

  if (Array.isArray(value)) {
    if (!value.every((item) => isPlainObject(item))) {
      throw new Error("Un tableau JSON-LD doit contenir uniquement des objets.");
    }
    return value as Prisma.InputJsonValue;
  }

  if (isPlainObject(value)) {
    return value as Prisma.InputJsonValue;
  }

  throw new Error("Le JSON-LD doit être un objet ou un tableau d'objets.");
}

// GET /api/admin/articles/[id]/schema — Lire le JSON-LD personnalisé
export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  await ensureAdminSchema();

  const { id } = await params;
  const seo = await prisma.articleSeo.findUnique({
    where: { articleId: id },
    select: { customJsonLd: true },
  });

  return NextResponse.json({ customJsonLd: seo?.customJsonLd ?? [] });
}

// PUT /api/admin/articles/[id]/schema — Sauvegarder le JSON-LD personnalisé
export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  await ensureAdminSchema();

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  const article = await prisma.article.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!article) {
    return NextResponse.json({ error: "Article non trouvé" }, { status: 404 });
  }

  let customJsonLd: Prisma.InputJsonValue;
  try {
    customJsonLd = normalizeCustomJsonLd((body as { customJsonLd?: unknown }).customJsonLd);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "JSON-LD invalide" },
      { status: 422 }
    );
  }

  const seo = await prisma.articleSeo.upsert({
    where: { articleId: id },
    create: {
      articleId: id,
      customJsonLd,
    },
    update: {
      customJsonLd,
    },
    select: { customJsonLd: true },
  });

  return NextResponse.json({ customJsonLd: seo.customJsonLd });
}
