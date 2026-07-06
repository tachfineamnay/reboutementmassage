import path from "path";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";
import type { MediaAssetType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const IMAGE_MIME_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const VIDEO_MIME_TYPES: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
};

const DOCUMENT_MIME_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;

const ALLOWED_UPLOAD_FOLDERS = new Set([
  "stories/covers",
  "stories/inline",
  "landing",
  "og",
  "media",
]);

export function getUploadsConfig() {
  const uploadDir = process.env.UPLOAD_DIR || "uploads";
  const publicPath = process.env.UPLOAD_PUBLIC_PATH || "/uploads";
  return { uploadDir, publicPath };
}

/**
 * Valide un fichier image selon son type MIME et sa taille.
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  // Vérification de l'existence
  if (!file) {
    return { isValid: false, error: "Aucun fichier fourni." };
  }

  // Vérification du type MIME
  const mimeType = file.type;
  if (!IMAGE_MIME_TYPES[mimeType]) {
    return {
      isValid: false,
      error: "Type de fichier non supporté. Utilisez uniquement JPEG, PNG ou WebP.",
    };
  }

  // Vérification de la taille
  if (file.size > MAX_IMAGE_SIZE) {
    return {
      isValid: false,
      error: "Fichier trop volumineux. La taille maximale est de 5 Mo.",
    };
  }

  // Vérification supplémentaire de l'extension du nom de fichier original
  const ext = path.extname(file.name).toLowerCase().replace(".", "");
  const allowedExtensions = ["jpg", "jpeg", "png", "webp"];
  if (!allowedExtensions.includes(ext)) {
    return {
      isValid: false,
      error: "Extension de fichier non autorisée.",
    };
  }

  return { isValid: true };
}

function safeUploadFolder(folder: string) {
  const normalized = folder.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  if (!ALLOWED_UPLOAD_FOLDERS.has(normalized)) {
    throw new Error("Sous-dossier de destination non valide.");
  }
  return normalized;
}

function mediaDefinition(file: File) {
  if (IMAGE_MIME_TYPES[file.type]) {
    return {
      ext: IMAGE_MIME_TYPES[file.type],
      maxSize: MAX_IMAGE_SIZE,
      assetType: "IMAGE" as MediaAssetType,
      kind: "image" as const,
      allowedExtensions: ["jpg", "jpeg", "png", "webp"],
    };
  }

  if (VIDEO_MIME_TYPES[file.type]) {
    return {
      ext: VIDEO_MIME_TYPES[file.type],
      maxSize: MAX_VIDEO_SIZE,
      assetType: "VIDEO" as MediaAssetType,
      kind: "video" as const,
      allowedExtensions: ["mp4", "webm"],
    };
  }

  if (DOCUMENT_MIME_TYPES[file.type]) {
    return {
      ext: DOCUMENT_MIME_TYPES[file.type],
      maxSize: MAX_DOCUMENT_SIZE,
      assetType: "DOCUMENT" as MediaAssetType,
      kind: "document" as const,
      allowedExtensions: ["pdf"],
    };
  }

  return null;
}

function assertFileSignature(buffer: Buffer, kind: "image" | "video" | "document", mimeType: string) {
  if (kind === "document" && !buffer.subarray(0, 4).equals(Buffer.from("%PDF"))) {
    throw new Error("Document PDF invalide.");
  }

  if (kind === "video" && mimeType === "video/mp4") {
    const signature = buffer.subarray(4, 8).toString("ascii");
    if (signature !== "ftyp") throw new Error("Fichier MP4 invalide.");
  }

  if (kind === "video" && mimeType === "video/webm") {
    const isWebm =
      buffer[0] === 0x1a &&
      buffer[1] === 0x45 &&
      buffer[2] === 0xdf &&
      buffer[3] === 0xa3;
    if (!isWebm) throw new Error("Fichier WebM invalide.");
  }
}

/**
 * Génère l'URL publique pour un fichier sauvegardé.
 */
export function getPublicUploadUrl(relativeFilename: string): string {
  const { publicPath } = getUploadsConfig();
  // S'assurer que le chemin commence par un slash
  const cleanPublicPath = publicPath.startsWith("/") ? publicPath : `/${publicPath}`;
  // Remplacer les antislashs Windows par des slashs
  const normalizedFilename = relativeFilename.replace(/\\/g, "/");
  return `${cleanPublicPath}/${normalizedFilename}`;
}

/**
 * Sauvegarde une image sur le disque et l'enregistre en base de données.
 */
export async function saveUploadedImage(
  file: File,
  type: "stories/covers" | "stories/inline" | "landing" | "og" = "stories/inline"
) {
  const validation = validateImageFile(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const { uploadDir } = getUploadsConfig();

  // 1. Validation de sécurité du type / sous-dossier pour éviter le path traversal
  const allowedTypes = ["stories/covers", "stories/inline", "landing", "og"];
  if (!allowedTypes.includes(type)) {
    throw new Error("Sous-dossier de destination non valide.");
  }

  // 2. Création automatique du dossier s'il n'existe pas
  const folderPath = path.join(uploadDir, type);
  await fs.mkdir(folderPath, { recursive: true });

  // 3. Génération d'un nom de fichier unique sécurisé
  const ext = IMAGE_MIME_TYPES[file.type];
  const uniqueFilename = `${uuidv4()}.${ext}`;
  const relativeFilename = path.join(type, uniqueFilename);
  const localPath = path.join(folderPath, uniqueFilename);

  // 4. Conversion du fichier en buffer et lecture des dimensions via sharp
  const buffer = Buffer.from(await file.arrayBuffer());
  let width: number | null = null;
  let height: number | null = null;

  const metadata = await sharp(buffer).metadata();
  width = metadata.width ?? null;
  height = metadata.height ?? null;

  if (!width || !height) {
    throw new Error("Image invalide ou illisible.");
  }

  // 5. Écriture du fichier sur le disque
  await fs.writeFile(localPath, buffer);

  // 6. Enregistrement en base de données dans la table MediaAsset
  const url = getPublicUploadUrl(relativeFilename);

  const asset = await prisma.mediaAsset.create({
    data: {
      filename: relativeFilename.replace(/\\/g, "/"), // stocker avec des slashs
      originalName: file.name,
      mimeType: file.type,
      url,
      localPath,
      size: file.size,
      width,
      height,
    },
  });

  return asset;
}

export async function saveUploadedMedia(
  file: File,
  {
    folder = "media",
    assetType,
    destinationId,
    altFr,
    altEn,
    altEs,
    consentNotes,
    usageNotes,
    externalUrl,
  }: {
    folder?: string;
    assetType?: MediaAssetType;
    destinationId?: string | null;
    altFr?: string | null;
    altEn?: string | null;
    altEs?: string | null;
    consentNotes?: string | null;
    usageNotes?: string | null;
    externalUrl?: string | null;
  } = {}
) {
  const definition = mediaDefinition(file);
  if (!definition) {
    throw new Error("Type de fichier non supporté.");
  }

  if (file.size > definition.maxSize) {
    throw new Error("Fichier trop volumineux pour son type.");
  }

  const originalExt = path.extname(file.name).toLowerCase().replace(".", "");
  if (!definition.allowedExtensions.includes(originalExt)) {
    throw new Error("Extension de fichier non autorisée.");
  }

  const safeFolder = safeUploadFolder(folder);
  const { uploadDir } = getUploadsConfig();
  const folderPath = path.join(uploadDir, safeFolder);
  await fs.mkdir(folderPath, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  assertFileSignature(buffer, definition.kind, file.type);

  let width: number | null = null;
  let height: number | null = null;
  if (definition.kind === "image") {
    const metadata = await sharp(buffer).metadata();
    width = metadata.width ?? null;
    height = metadata.height ?? null;
    if (!width || !height) throw new Error("Image invalide ou illisible.");
  }

  const uniqueFilename = `${uuidv4()}.${definition.ext}`;
  const relativeFilename = path.join(safeFolder, uniqueFilename);
  const localPath = path.join(folderPath, uniqueFilename);
  await fs.writeFile(localPath, buffer);

  return prisma.mediaAsset.create({
    data: {
      filename: relativeFilename.replace(/\\/g, "/"),
      originalName: file.name,
      mimeType: file.type,
      url: getPublicUploadUrl(relativeFilename),
      localPath,
      size: file.size,
      width,
      height,
      assetType: assetType ?? definition.assetType,
      destinationId: destinationId ?? undefined,
      altFr: altFr ?? undefined,
      altEn: altEn ?? undefined,
      altEs: altEs ?? undefined,
      consentNotes: consentNotes ?? undefined,
      usageNotes: usageNotes ?? undefined,
      externalUrl: externalUrl ?? undefined,
    },
  });
}
