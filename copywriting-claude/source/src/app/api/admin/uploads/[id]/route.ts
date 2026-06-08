import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  // 1. Protection par authentification admin
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "ID manquant." }, { status: 400 });
  }

  try {
    // 2. Extraction du corps de la requête
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
    }

    // 3. Validation simple
    const altFr = body.altFr !== undefined ? String(body.altFr) : undefined;
    const altEn = body.altEn !== undefined ? String(body.altEn) : undefined;
    const altEs = body.altEs !== undefined ? String(body.altEs) : undefined;

    // 4. Vérifier si le MediaAsset existe
    const asset = await prisma.mediaAsset.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!asset) {
      return NextResponse.json({ error: "Fichier non trouvé." }, { status: 404 });
    }

    // 5. Mise à jour en base de données
    const updatedAsset = await prisma.mediaAsset.update({
      where: { id },
      data: {
        ...(altFr !== undefined && { altFr }),
        ...(altEn !== undefined && { altEn }),
        ...(altEs !== undefined && { altEs }),
      },
    });

    return NextResponse.json(updatedAsset, { status: 200 });
  } catch (error) {
    console.error("Erreur dans PATCH /api/admin/uploads/[id] :", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la mise à jour." },
      { status: 500 }
    );
  }
}
