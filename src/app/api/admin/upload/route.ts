import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { saveUploadedMedia } from "@/lib/upload";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const formData = await req.formData().catch(() => null);
  if (!formData)
    return NextResponse.json({ error: "FormData invalide" }, { status: 400 });

  const file = formData.get("file");
  if (!(file instanceof File))
    return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 });

  try {
    const asset = await saveUploadedMedia(file, { folder: "media" });
    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload impossible.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
