import path from "path";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";

const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const MAX_SIZE = 5 * 1024 * 1024; // 5 Mo

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
  if (!ALLOWED_MIME_TYPES[mimeType]) {
    return {
      isValid: false,
      error: "Type de fichier non supporté. Utilisez uniquement JPEG, PNG ou WebP.",
    };
  }

  // Vérification de la taille
  if (file.size > MAX_SIZE) {
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
  const ext = ALLOWED_MIME_TYPES[file.type];
  const uniqueFilename = `${uuidv4()}.${ext}`;
  const relativeFilename = path.join(type, uniqueFilename);
  const localPath = path.join(folderPath, uniqueFilename);

  // 4. Conversion du fichier en buffer et lecture des dimensions via sharp
  const buffer = Buffer.from(await file.arrayBuffer());
  let width: number | null = null;
  let height: number | null = null;

  try {
    const metadata = await sharp(buffer).metadata();
    width = metadata.width ?? null;
    height = metadata.height ?? null;
  } catch (error) {
    // Si sharp échoue, on continue sans les dimensions
    console.error("Erreur lors de la lecture des métadonnées avec sharp :", error);
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
