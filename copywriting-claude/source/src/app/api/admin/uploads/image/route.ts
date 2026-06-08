import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { saveUploadedImage } from "@/lib/upload";

export async function POST(req: NextRequest) {
  // 1. Protection par authentification admin
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  try {
    // 2. Extraction des données du formulaire multipart
    const formData = await req.formData().catch(() => null);
    if (!formData) {
      return NextResponse.json(
        { error: "Requête invalide. FormData attendu." },
        { status: 400 }
      );
    }

    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Aucun fichier fourni dans le champ 'file'." },
        { status: 400 }
      );
    }

    // Récupération facultative du type/sous-dossier
    const typeParam = formData.get("type")?.toString() || "stories/inline";
    
    // Validation stricte du type/sous-dossier de destination
    const allowedTypes = ["stories/covers", "stories/inline", "landing", "og"];
    if (!allowedTypes.includes(typeParam)) {
      return NextResponse.json(
        { error: "Type de destination invalide." },
        { status: 400 }
      );
    }

    // 3. Sauvegarde de l'image via notre fonction utilitaire
    const type = typeParam as "stories/covers" | "stories/inline" | "landing" | "og";
    const asset = await saveUploadedImage(file, type);

    // 4. Renvoi du MediaAsset créé
    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    console.error("Erreur dans POST /api/admin/uploads/image :", error);
    const message = error instanceof Error ? error.message : "Une erreur est survenue lors de l'upload.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
