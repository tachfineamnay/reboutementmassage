import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { OpenAIConfigurationError, OpenAIRequestError, resolveOpenAIConfig } from "@/lib/openai";

function extractOutputText(payload: unknown) {
  if (!payload || typeof payload !== "object") return "";
  const record = payload as Record<string, unknown>;
  if (typeof record.output_text === "string") return record.output_text;

  const output = record.output;
  if (!Array.isArray(output)) return "";

  return output
    .flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const content = (item as Record<string, unknown>).content;
      if (!Array.isArray(content)) return [];
      return content
        .map((part) => {
          if (!part || typeof part !== "object") return "";
          const recordPart = part as Record<string, unknown>;
          return typeof recordPart.text === "string" ? recordPart.text : "";
        })
        .filter(Boolean);
    })
    .join("\n")
    .trim();
}

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const config = await resolveOpenAIConfig();
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.textModel,
        store: false,
        input: "Réponds uniquement par OK.",
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

    return NextResponse.json({
      ok: true,
      source: config.source,
      textModel: config.textModel,
      message: extractOutputText(payload) || "Connexion OpenAI valide.",
    });
  } catch (error) {
    if (error instanceof OpenAIConfigurationError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }

    if (error instanceof OpenAIRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "Test OpenAI impossible." }, { status: 500 });
  }
}
