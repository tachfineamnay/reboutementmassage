import "server-only";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
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

type OpenAIConfigSource = "dashboard" | "env" | "none";
export type OpenAIReasoningEffort = "low" | "medium" | "high" | "xhigh";

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
    imageModel: dashboardImageModel || process.env.OPENAI_IMAGE_MODEL || "gpt-image-2",
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
    imageModel: dashboardImageModel || process.env.OPENAI_IMAGE_MODEL || "gpt-image-2",
    encryption,
    decryptError,
  };
}

export function extractOpenAIOutputText(payload: unknown) {
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

export async function createOpenAIClient() {
  const config = await resolveOpenAIConfig();
  return {
    client: new OpenAI({ apiKey: config.apiKey }),
    config,
  };
}

function requestError(error: unknown) {
  if (error instanceof OpenAI.APIError) {
    return new OpenAIRequestError(error.message, error.status ?? 502);
  }
  return error;
}

export async function createOpenAIStructuredResponse<T>({
  schema,
  schemaName,
  instructions,
  input,
  reasoningEffort = "medium",
  webSearch = false,
  background = false,
  metadata,
}: {
  schema: z.ZodType<T>;
  schemaName: string;
  instructions: string;
  input: string;
  reasoningEffort?: OpenAIReasoningEffort;
  webSearch?: boolean;
  background?: boolean;
  metadata?: Record<string, string>;
}) {
  const { client, config } = await createOpenAIClient();
  const tools: OpenAI.Responses.Tool[] = webSearch
    ? [{ type: "web_search", search_context_size: "high" }]
    : [];

  try {
    if (background) {
      const response = await client.responses.create({
        model: config.textModel,
        background: true,
        store: true,
        instructions,
        input,
        reasoning: { effort: reasoningEffort },
        text: { format: zodTextFormat(schema, schemaName) },
        tools,
        tool_choice: webSearch ? "required" : "auto",
        include: webSearch ? ["web_search_call.action.sources"] : undefined,
        metadata,
        prompt_cache_key: `article-studio:${schemaName}:v1`,
      });
      return { response, parsed: null as T | null, config };
    }

    const response = await client.responses.parse({
      model: config.textModel,
      store: false,
      instructions,
      input,
      reasoning: { effort: reasoningEffort },
      text: { format: zodTextFormat(schema, schemaName) },
      tools,
      tool_choice: webSearch ? "required" : "auto",
      include: webSearch ? ["web_search_call.action.sources"] : undefined,
      metadata,
      prompt_cache_key: `article-studio:${schemaName}:v1`,
    });

    if (!response.output_parsed) {
      throw new OpenAIRequestError("Réponse OpenAI structurée vide ou refusée.", 502);
    }

    return { response, parsed: schema.parse(response.output_parsed), config };
  } catch (error) {
    throw requestError(error);
  }
}

export async function retrieveOpenAIResponse(responseId: string) {
  const { client } = await createOpenAIClient();
  try {
    return await client.responses.retrieve(responseId);
  } catch (error) {
    throw requestError(error);
  }
}

export async function cancelOpenAIResponse(responseId: string) {
  const { client } = await createOpenAIClient();
  try {
    return await client.responses.cancel(responseId);
  } catch (error) {
    throw requestError(error);
  }
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
  jsonSchema: Record<string, unknown>;
  schemaName: string;
  outputSchema: z.ZodType<T>;
}) {
  void jsonSchema;
  const result = await createOpenAIStructuredResponse({
    schema: outputSchema,
    schemaName,
    instructions: system,
    input: user,
    reasoningEffort: "medium",
  });
  if (!result.parsed) {
    throw new OpenAIRequestError("Réponse OpenAI vide ou illisible.", 502);
  }
  return result.parsed;
}
