import { NextRequest, NextResponse } from "next/server";
import { stat } from "fs/promises";
import path from "path";
import { getUploadsDir } from "@/lib/server-utils";

type Params = { params: Promise<{ filename: string }> };

// Route publique pour servir les uploads
// GET /api/uploads/[filename]
export async function GET(_req: NextRequest, { params }: Params) {
  const { filename } = await params;

  // Sécurité : empêche les path traversal
  if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    return NextResponse.json({ error: "Nom de fichier invalide" }, { status: 400 });
  }

  const uploadsDir = getUploadsDir();
  const filePath = path.join(uploadsDir, filename);

  // Vérifie l'existence
  try {
    await stat(filePath);
  } catch {
    return NextResponse.json({ error: "Fichier non trouvé" }, { status: 404 });
  }

  // Détermine le Content-Type
  const ext = path.extname(filename).toLowerCase().replace(".", "");
  const mimeMap: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
  };
  const contentType = mimeMap[ext] ?? "application/octet-stream";

  // Lit et sert le fichier
  const fileContent = await import("fs/promises").then((fs) =>
    fs.readFile(filePath)
  );

  return new NextResponse(fileContent, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
