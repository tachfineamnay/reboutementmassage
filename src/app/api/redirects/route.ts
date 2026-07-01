import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");

  if (!path) {
    return NextResponse.json(null);
  }

  try {
    const rule = await prisma.redirectRule.findFirst({
      where: { sourcePath: path, active: true },
    });

    if (rule) {
      // Mettre à jour les statistiques de redirection en arrière-plan
      prisma.redirectRule
        .update({
          where: { id: rule.id },
          data: {
            hits: { increment: 1 },
            lastHitAt: new Date(),
          },
        })
        .catch((err) => console.error("Failed to update redirect rule hits:", err));

      return NextResponse.json({
        targetPath: rule.targetPath,
        statusCode: rule.statusCode,
      });
    }
  } catch (error) {
    console.error("Error looking up RedirectRule:", error);
  }

  return NextResponse.json(null);
}
