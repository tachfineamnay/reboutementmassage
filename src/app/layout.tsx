import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "Gregory Tordjman — Méthode TMS® | Saint-Barth & Saint-Martin",
  description: "Reboutement, therapeutic massage & manual therapy. On-site. In 20 minutes. Saint-Barthélemy, Saint-Martin, aboard.",
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
