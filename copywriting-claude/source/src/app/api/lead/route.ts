import { handleLeadRequest } from "@/lib/lead-service";

export async function POST(request: Request) {
  return handleLeadRequest(request);
}
