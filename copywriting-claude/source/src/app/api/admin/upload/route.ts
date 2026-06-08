import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import { getSession } from "@/lib/auth";
import { getUploadUrl, getLocalPath, ensureUploadsDir } from "@/lib/server-utils";
import { prisma } from "@/lib/prisma";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const MAX_SIZE = 5 * 1024 * 1024; // 5 Mo

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

  // Validation type MIME
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: "Type non supporté. Utilisez JPG, PNG, WebP ou GIF." },
      { status: 415 }
    );
  }

  // Validation taille
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Fichier trop volumineux (max 5 Mo)." },
      { status: 413 }
    );
  }

  // Génération d'un nom unique
  const filename = `${uuidv4()}.${ext}`;

  // Écriture sur disque
  await ensureUploadsDir();
  const localPath = getLocalPath(filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(localPath, buffer);

  const url = getUploadUrl(filename);

  // Enregistrement en DB
  const asset = await prisma.mediaAsset.create({
    data: {
      filename,
      originalName: file.name,
      mimeType: file.type,
      url,
      localPath,
      size: file.size,
      // width / height seront peuplés lors d'un traitement sharp ultérieur
    },
  });

  return NextResponse.json(asset, { status: 201 });
}
