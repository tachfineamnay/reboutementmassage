import "server-only";
import { z } from "zod";

type JsonSchema = Record<string, unknown>;

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

export function getOpenAIModels() {
  return {
    textModel: process.env.OPENAI_TEXT_MODEL || "gpt-5.5",
    imageModel: process.env.OPENAI_IMAGE_MODEL || "gpt-image-1",
  };
}

function getOpenAIKey() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new OpenAIConfigurationError();
  }
  return apiKey;
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
  const apiKey = getOpenAIKey();
  const { textModel } = getOpenAIModels();

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
