import path from "path";
import fs from "fs/promises";

// ─────────────────────────────────────────────────────────────────────────────
// Stockage uploads (Server-side only)
// ─────────────────────────────────────────────────────────────────────────────

// En production Coolify: /app/storage/uploads
// En développement: <racine du projet>/uploads
export function getUploadsDir(): string {
  return process.env.UPLOAD_DIR ?? "uploads";
}

export function getUploadUrl(filename: string): string {
  return `/api/uploads/${filename}`;
}

export function getLocalPath(filename: string): string {
  return path.join(getUploadsDir(), filename);
}

export async function ensureUploadsDir(): Promise<void> {
  const dir = getUploadsDir();
  await fs.mkdir(dir, { recursive: true });
}
