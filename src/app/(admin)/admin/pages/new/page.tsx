import type { Metadata } from "next";
import NewLandingPage from "../../landings/new/page";

export const metadata: Metadata = { title: "Nouvelle page — TMS Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default NewLandingPage;
