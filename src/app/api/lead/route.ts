import { handleLeadRequestHardened } from "@/lib/lead-service-handoff";

export async function POST(request: Request) {
  return handleLeadRequestHardened(request);
}
