import "server-only";
import { z } from "zod";
import {
  AdminSettingsEncryptionError,
  OPENAI_SETTING_KEYS,
  getAdminSetting,
  getAdminSettingRow,
  getAdminSettingsEncryptionStatus,
  getDecryptedAdminSetting,
  maskSecret,
} from "@/lib/admin-settings";

type JsonSchema = Record<string, unknown>;
type OpenAIConfigSource = "dashboard" | "env" | "none";

export class OpenAIConfigurationError extends Error {
  constructor(message = "OPENAI_API_KEY n'est pas configurée.") {
    super(message);
    this.name = "OpenAIConfigurationError";
  }
}

export class OpenAIRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "OpenAIRequestError";
    this.status = status;
  }
}

export async function resolveOpenAIConfig() {
  let dashboardApiKey: string | null = null;
  const dashboardKeyRow = await getAdminSettingRow(OPENAI_SETTING_KEYS.apiKey);

  if (dashboardKeyRow) {
    try {
      dashboardApiKey = dashboardKeyRow.encrypted
        ? await getDecryptedAdminSetting(OPENAI_SETTING_KEYS.apiKey)
        : dashboardKeyRow.value;
    } catch (error) {
      if (error instanceof AdminSettingsEncryptionError) {
        throw new OpenAIConfigurationError(error.message);
      }
      throw error;
    }
  }

  const apiKey = dashboardApiKey || process.env.OPENAI_API_KEY || "";
  const source: OpenAIConfigSource = dashboardApiKey
    ? "dashboard"
    : process.env.OPENAI_API_KEY
      ? "env"
      : "none";
  if (!apiKey) {
    throw new OpenAIConfigurationError();
  }

  const dashboardTextModel = await getAdminSetting(OPENAI_SETTING_KEYS.textModel);
  const dashboardImageModel = await getAdminSetting(OPENAI_SETTING_KEYS.imageModel);

  return {
    apiKey,
    source,
    textModel: dashboardTextModel || process.env.OPENAI_TEXT_MODEL || "gpt-5.5",
    imageModel: dashboardImageModel || process.env.OPENAI_IMAGE_MODEL || "gpt-image-1",
    dashboardKeyUpdatedAt: dashboardKeyRow?.updatedAt ?? null,
  };
}

export async function getOpenAISettingsStatus() {
  const dashboardKeyRow = await getAdminSettingRow(OPENAI_SETTING_KEYS.apiKey);
  const dashboardTextModel = await getAdminSetting(OPENAI_SETTING_KEYS.textModel);
  const dashboardImageModel = await getAdminSetting(OPENAI_SETTING_KEYS.imageModel);
  const encryption = getAdminSettingsEncryptionStatus();

  let dashboardKeyConfigured = false;
  let maskedDashboardKey: string | null = null;
  let decryptError: string | null = null;

  if (dashboardKeyRow) {
    dashboardKeyConfigured = true;
    try {
      const decrypted = dashboardKeyRow.encrypted
        ? await getDecryptedAdminSetting(OPENAI_SETTING_KEYS.apiKey)
        : dashboardKeyRow.value;
      maskedDashboardKey = decrypted ? maskSecret(decrypted) : "••••••••";
    } catch (error) {
      maskedDashboardKey = "••••••••";
      decryptError =
        error instanceof Error
          ? error.message
          : "Impossible de déchiffrer la clé OpenAI dashboard.";
    }
  }

  const envKeyConfigured = Boolean(process.env.OPENAI_API_KEY);
  const source: OpenAIConfigSource = dashboardKeyConfigured
    ? "dashboard"
    : envKeyConfigured
      ? "env"
      : "none";

  return {
    configured: dashboardKeyConfigured || envKeyConfigured,
    source,
    dashboardKeyConfigured,
    envKeyConfigured,
    maskedKey:
      source === "dashboard"
        ? maskedDashboardKey
        : envKeyConfigured
          ? maskSecret(process.env.OPENAI_API_KEY || "")
          : null,
    updatedAt: dashboardKeyRow?.updatedAt?.toISOString() ?? null,
    textModel: dashboardTextModel || process.env.OPENAI_TEXT_MODEL || "gpt-5.5",
    imageModel: dashboardImageModel || process.env.OPENAI_IMAGE_MODEL || "gpt-image-1",
    encryption,
    decryptError,
  };
}

function extractOutputText(payload: unknown) {
  if (!payload || typeof payload !== "object") return "";
  const record = payload as Record<string, unknown>;

  if (typeof record.output_text === "string") {
    return record.output_text;
  }

  const output = record.output;
  if (!Array.isArray(output)) return "";

  const chunks: string[] = [];
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const content = (item as Record<string, unknown>).content;
    if (!Array.isArray(content)) continue;

    for (const part of content) {
      if (!part || typeof part !== "object") continue;
      const partRecord = part as Record<string, unknown>;
      if (typeof partRecord.text === "string") chunks.push(partRecord.text);
      if (typeof partRecord.output_text === "string") chunks.push(partRecord.output_text);
    }
  }

  return chunks.join("\n").trim();
}

export async function createOpenAIJsonResponse<T>({
  system,
  user,
  jsonSchema,
  schemaName,
  outputSchema,
}: {
  system: string;
  user: string;
  jsonSchema: JsonSchema;
  schemaName: string;
  outputSchema: z.ZodType<T>;
}) {
  const { apiKey, textModel } = await resolveOpenAIConfig();

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: textModel,
      store: false,
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: system }],
        },
        {
          role: "user",
          content: [{ type: "input_text", text: user }],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: schemaName,
          strict: false,
          schema: jsonSchema,
        },
      },
    }),
  });

  const payload = (await response.json().catch(() => null)) as unknown;
  if (!response.ok) {
    const message =
      payload && typeof payload === "object"
        ? ((payload as { error?: { message?: string } }).error?.message ??
          "Erreur OpenAI.")
        : "Erreur OpenAI.";
    throw new OpenAIRequestError(message, response.status);
  }

  const outputText = extractOutputText(payload);
  if (!outputText) {
    throw new OpenAIRequestError("Réponse OpenAI vide ou illisible.", 502);
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(outputText);
  } catch {
    throw new OpenAIRequestError("Réponse OpenAI non JSON.", 502);
  }

  return outputSchema.parse(parsedJson);
}
