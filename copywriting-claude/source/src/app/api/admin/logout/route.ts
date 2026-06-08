import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth";

export async function POST() {
  await deleteSession();
  // Renvoie un 200 JSON — le client fait la redirection
  return NextResponse.json({ success: true });
}
