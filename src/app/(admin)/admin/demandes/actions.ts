"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ensureAdminSchema } from "@/lib/admin-schema";

export async function archiveLeadAction(formData: FormData) {
  const session = await getSession();
  if (!session) {
    throw new Error("Non authentifié.");
  }

  await ensureAdminSchema();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.leadSubmission.update({
    where: { id },
    data: { status: "ARCHIVED" },
  });

  revalidatePath("/admin/overview");
  revalidatePath("/admin/demandes");
  revalidatePath(`/admin/demandes/${id}`);
}
