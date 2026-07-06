import type { Metadata } from "next";
import OverviewPage from "../overview/page";

export const metadata: Metadata = {
  title: "Content & SEO — TMS Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function ContentPage() {
  return <OverviewPage />;
}
