import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import MetaContactTracker from "@/components/MetaContactTracker";
import MetaPageViewTracker from "@/components/MetaPageViewTracker";
import { MetaPixel } from "@/components/MetaPixel";
import { TikTokPixel } from "@/components/TikTokPixel";
import { absoluteUrl, isLocale } from "@/lib/seo";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl()),
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  const htmlLang = isLocale(lang) ? lang : "fr";

  return (
    <html lang={htmlLang} className={`${cormorant.variable} ${dmSans.variable}`}>
      <body>
        <GoogleAnalytics />
        <MetaPixel />
        <TikTokPixel />
        <Suspense fallback={null}>
          <MetaPageViewTracker />
          <MetaContactTracker lang={htmlLang.toUpperCase() as "FR" | "EN" | "ES"} />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
