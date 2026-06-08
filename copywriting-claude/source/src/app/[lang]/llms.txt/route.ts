import { notFound } from "next/navigation";
import { llmsTxtResponse } from "@/lib/llms";
import { isLocale, LOCALES } from "@/lib/seo";

type RouteProps = {
  params: Promise<{ lang: string }>;
};

export const dynamic = "force-static";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function GET(_request: Request, { params }: RouteProps) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return llmsTxtResponse(lang);
}
