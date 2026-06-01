"use server";

import { redirect } from "next/navigation";
import { createSession } from "@/lib/auth";
import { LoginSchema } from "@/lib/schemas";
import { timingSafeEqual } from "crypto";

type LoginState = { error: string } | undefined;

/**
 * Authentification via variables d'environnement (MVP).
 *
 * ADMIN_EMAIL  : email de l'administrateur
 * ADMIN_PASSWORD : mot de passe en clair (stocké uniquement côté serveur)
 * SESSION_SECRET : clé de signature JWT
 *
 * Les credentials ne transitent jamais côté client.
 * La comparaison de mot de passe est timing-safe.
 */
export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  // --- Validation de base ---
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = LoginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Email ou mot de passe invalide." };
  }

  const { email, password } = parsed.data;

  // --- Lecture des credentials serveur ---
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error("[auth] ADMIN_EMAIL ou ADMIN_PASSWORD non défini");
    return { error: "Configuration serveur incorrecte." };
  }

  // --- Comparaison timing-safe (évite les timing attacks) ---
  const emailMatch = safeCompare(email, adminEmail);
  const passwordMatch = safeCompare(password, adminPassword);

  if (!emailMatch || !passwordMatch) {
    return { error: "Identifiants incorrects." };
  }

  // --- Création de la session JWT (cookie httpOnly) ---
  await createSession("env-admin", adminEmail);

  redirect("/admin/overview");
}

/**
 * Comparaison de chaînes en temps constant.
 * Évite les attaques par timing.
 */
function safeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) {
      // Longueurs différentes → compare quand même pour consommer du temps
      timingSafeEqual(bufA, Buffer.alloc(bufA.length));
      return false;
    }
    return timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}
