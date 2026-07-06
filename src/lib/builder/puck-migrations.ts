import { migrate } from "@puckeditor/core";
import { createDefaultPuckDataFromLanding, type PuckLandingSource } from "@/lib/builder/default-puck-data";
import { parsePuckData, safeParsePuckData, type TmsPuckData } from "@/lib/builder/puck-data-schema";

export function migratePuckData(value: unknown, landing?: PuckLandingSource): TmsPuckData {
  const parsed = safeParsePuckData(value);
  if (parsed.success) return parsed.data as TmsPuckData;

  try {
    return parsePuckData(migrate(value as never));
  } catch {
    return createDefaultPuckDataFromLanding(landing ?? {});
  }
}
