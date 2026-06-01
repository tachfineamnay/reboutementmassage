import { permanentRedirect } from "next/navigation";

export default function LegacyStoriesPage() {
  permanentRedirect("/fr/stories");
}
