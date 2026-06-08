import { NextRequest, NextResponse } from "next/server";
import { stat, readFile } from "fs/promises";
import path from "path";
import { getUploadsConfig } from "@/lib/upload";

type Params = { params: Promise<{ path: string[] }> };

// Route publique pour servir les uploads locaux stockés dans UPLOAD_DIR
// GET /uploads/[...path]
export async function GET(_req: NextRequest, { params }: Params) {
  const { path: pathSegments } = await params;

  if (!pathSegments || pathSegments.length === 0) {
    return NextResponse.json({ error: "Fichier non spécifié." }, { status: 400 });
  }

  // 1. Validation de sécurité contre le path traversal
  for (const segment of pathSegments) {
    if (
      segment === ".." ||
      segment === "." ||
      segment.includes("/") ||
      segment.includes("\\") ||
      segment.includes("%")
    ) {
      return NextResponse.json({ error: "Chemin invalide ou dangereux." }, { status: 400 });
    }
  }

  const { uploadDir } = getUploadsConfig();
  const resolvedUploadDir = path.resolve(uploadDir);
  const filePath = path.resolve(resolvedUploadDir, ...pathSegments);

  // 2. Sécurité : S'assurer que le chemin résolu reste strictement dans le dossier UPLOAD_DIR
  if (!filePath.startsWith(resolvedUploadDir)) {
    return NextResponse.json({ error: "Accès interdit." }, { status: 403 });
  }

  // 3. Vérification de l'existence du fichier
  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) {
      return NextResponse.json({ error: "Non trouvé." }, { status: 404 });
    }
  } catch {
    return NextResponse.json({ error: "Fichier non trouvé." }, { status: 404 });
  }

  // 4. Déterminer le Content-Type
  const ext = path.extname(filePath).toLowerCase().replace(".", "");
  const mimeMap: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
  };
  const contentType = mimeMap[ext];

  // Si l'extension n'est pas une image autorisée, on refuse de servir pour plus de sécurité
  if (!contentType) {
    return NextResponse.json({ error: "Type de fichier non autorisé à la lecture." }, { status: 403 });
  }

  // 5. Lecture et envoi du fichier
  try {
    const fileContent = await readFile(filePath);
    return new NextResponse(fileContent, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Erreur lors de la lecture du fichier :", error);
    return NextResponse.json(
      { error: "Erreur lors de la lecture du fichier." },
      { status: 500 }
    );
  }
}
