import type { Metadata } from "next";
import {
  generateCdmxPrivateSessionMetadata,
  renderCdmxPrivateSessionRoute,
} from "@/app/cdmx-private-session-route";

type PageProps = {
  params: Promise<{ lang: string }>;
};

export function generateMetadata(props: PageProps): Promise<Metadata> {
  return generateCdmxPrivateSessionMetadata(props, "es");
}

export default function CdmxPrivateSessionRoute(props: PageProps) {
  return renderCdmxPrivateSessionRoute(props, "es");
}
