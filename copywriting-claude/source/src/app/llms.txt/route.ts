import { llmsTxtResponse } from "@/lib/llms";

export const dynamic = "force-static";

export function GET() {
  return llmsTxtResponse();
}
