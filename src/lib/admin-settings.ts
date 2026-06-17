import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { ensureAdminSchema } from "@/lib/admin-schema";

export const OPENAI_SETTING_KEYS = {
  apiKey: "openai.apiKey",
  textModel: "openai.textModel",
  imageModel: "openai.imageModel",
} as const;

export class AdminSettingsEncryptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminSettingsEncryptionError";
  }
}

type AdminSettingRow = {
  key: string;
  value: string;
  encrypted: boolean;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function getEncryptionSecret() {
  const source = process.env.ADMIN_SETTINGS_ENCRYPTION_KEY
    ? "ADMIN_SETTINGS_ENCRYPTION_KEY"
    : process.env.SESSION_SECRET
      ? "SESSION_SECRET"
      : null;
  const secret =
    process.env.ADMIN_SETTINGS_ENCRYPTION_KEY || process.env.SESSION_SECRET || "";

  if (!source || !secret) {
    throw new AdminSettingsEncryptionError(
      "Aucune clé de chiffrement disponible. Définissez ADMIN_SETTINGS_ENCRYPTION_KEY ou SESSION_SECRET."
    );
  }

  return {
    source,
    key: createHash("sha256").update(secret).digest(),
    usingFallback: source === "SESSION_SECRET",
  };
}

export function getAdminSettingsEncryptionStatus() {
  try {
    const secret = getEncryptionSecret();
    return {
      available: true,
      source: secret.source,
      usingFallback: secret.usingFallback,
    };
  } catch {
    return {
      available: false,
      source: null,
      usingFallback: false,
    };
  }
}

export function encryptAdminSecret(value: string) {
  const { key } = getEncryptionSecret();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [
    "enc",
    "v1",
    iv.toString("base64url"),
    tag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(":");
}

export function decryptAdminSecret(value: string) {
  if (!value.startsWith("enc:v1:")) {
    throw new AdminSettingsEncryptionError("Format de secret admin non supporté.");
  }

  const [, , ivRaw, tagRaw, encryptedRaw] = value.split(":");
  if (!ivRaw || !tagRaw || !encryptedRaw) {
    throw new AdminSettingsEncryptionError("Secret admin incomplet.");
  }

  try {
    const { key } = getEncryptionSecret();
    const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivRaw, "base64url"));
    decipher.setAuthTag(Buffer.from(tagRaw, "base64url"));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedRaw, "base64url")),
      decipher.final(),
    ]);
    return decrypted.toString("utf8");
  } catch (error) {
    if (error instanceof AdminSettingsEncryptionError) throw error;
    throw new AdminSettingsEncryptionError(
      "Impossible de déchiffrer la clé OpenAI stockée dans le dashboard."
    );
  }
}

async function getSettingRow(key: string) {
  await ensureAdminSchema();
  const rows = await prisma.$queryRaw<AdminSettingRow[]>`
    SELECT "key", "value", "encrypted", "updatedBy", "createdAt", "updatedAt"
    FROM "admin_settings"
    WHERE "key" = ${key}
    LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function getAdminSetting(key: string) {
  const row = await getSettingRow(key);
  return row?.value ?? null;
}

export async function getAdminSettingRow(key: string) {
  return getSettingRow(key);
}

export async function getDecryptedAdminSetting(key: string) {
  const row = await getSettingRow(key);
  if (!row) return null;
  if (!row.encrypted) return row.value;
  return decryptAdminSecret(row.value);
}

export async function upsertAdminSetting({
  key,
  value,
  encrypted = false,
  updatedBy,
}: {
  key: string;
  value: string;
  encrypted?: boolean;
  updatedBy?: string | null;
}) {
  await ensureAdminSchema();
  await prisma.$executeRaw`
    INSERT INTO "admin_settings" ("key", "value", "encrypted", "updatedBy", "createdAt", "updatedAt")
    VALUES (${key}, ${value}, ${encrypted}, ${updatedBy ?? null}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT ("key") DO UPDATE SET
      "value" = EXCLUDED."value",
      "encrypted" = EXCLUDED."encrypted",
      "updatedBy" = EXCLUDED."updatedBy",
      "updatedAt" = CURRENT_TIMESTAMP
  `;
}

export async function deleteAdminSetting(key: string) {
  await ensureAdminSchema();
  await prisma.$executeRaw`
    DELETE FROM "admin_settings"
    WHERE "key" = ${key}
  `;
}

export function maskSecret(value: string) {
  if (value.length <= 12) return "••••••••";
  return `${value.slice(0, 7)}…${value.slice(-4)}`;
}
