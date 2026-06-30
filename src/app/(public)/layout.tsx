import { Suspense } from "react";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import MetaContactTracker from "@/components/MetaContactTracker";
import MetaPageViewTracker from "@/components/MetaPageViewTracker";
import { MetaPixel } from "@/components/MetaPixel";
import "../globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--serif",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--sans",
});

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body>
        <GoogleAnalytics />
        <MetaPixel />
        <Suspense fallback={null}>
          <MetaPageViewTracker />
          <MetaContactTracker />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
