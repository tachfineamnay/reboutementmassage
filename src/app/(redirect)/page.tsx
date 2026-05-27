import { permanentRedirect } from "next/navigation";
import { DEFAULT_LOCALE } from "@/lib/seo";

export default function RootRedirect() {
  permanentRedirect(`/${DEFAULT_LOCALE}`);
}
