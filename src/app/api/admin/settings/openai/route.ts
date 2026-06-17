import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  AdminSettingsEncryptionError,
  OPENAI_SETTING_KEYS,
  deleteAdminSetting,
  encryptAdminSecret,
  upsertAdminSetting,
} from "@/lib/admin-settings";
import { getSession } from "@/lib/auth";
import { getOpenAISettingsStatus } from "@/lib/openai";

const OpenAISettingsUpdateSchema = z.object({
  apiKey: z.string().trim().max(300).optional().default(""),
  textModel: z.string().trim().max(120).optional().default(""),
  imageModel: z.string().trim().max(120).optional().default(""),
});

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  return NextResponse.json(await getOpenAISettingsStatus());
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = OpenAISettingsUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { apiKey, textModel, imageModel } = parsed.data;

  try {
    if (apiKey) {
      await upsertAdminSetting({
        key: OPENAI_SETTING_KEYS.apiKey,
        value: encryptAdminSecret(apiKey),
        encrypted: true,
        updatedBy: session.email,
      });
    }

    if (textModel) {
      await upsertAdminSetting({
        key: OPENAI_SETTING_KEYS.textModel,
        value: textModel,
        updatedBy: session.email,
      });
    } else {
      await deleteAdminSetting(OPENAI_SETTING_KEYS.textModel);
    }

    if (imageModel) {
      await upsertAdminSetting({
        key: OPENAI_SETTING_KEYS.imageModel,
        value: imageModel,
        updatedBy: session.email,
      });
    } else {
      await deleteAdminSetting(OPENAI_SETTING_KEYS.imageModel);
    }

    return NextResponse.json(await getOpenAISettingsStatus());
  } catch (error) {
    if (error instanceof AdminSettingsEncryptionError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }

    return NextResponse.json(
      { error: "Erreur lors de la sauvegarde OpenAI." },
      { status: 500 }
    );
  }
}
