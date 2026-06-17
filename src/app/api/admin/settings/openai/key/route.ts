import { NextResponse } from "next/server";
import { OPENAI_SETTING_KEYS, deleteAdminSetting } from "@/lib/admin-settings";
import { getSession } from "@/lib/auth";
import { getOpenAISettingsStatus } from "@/lib/openai";

export async function DELETE() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  await deleteAdminSetting(OPENAI_SETTING_KEYS.apiKey);
  return NextResponse.json(await getOpenAISettingsStatus());
}
