import type { Metadata, Viewport } from "next";
import { PwaRefresh } from "@/components/pwa-refresh";
import { getCanonicalSiteUrl } from "@/lib/site-url";
import "./globals.css";

const siteUrl = getCanonicalSiteUrl();

export const metadata: Metadata = {
  title: "Vanguard",
  description: "A calm daily jazz companion for Spotify listeners who want to start with the right record.",
  metadataBase: new URL(siteUrl),
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Vanguard"
  },
  formatDetection: {
    telephone: false
  },
  icons: {
    icon: [{ url: "/icons/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icons/apple-icon.svg", type: "image/svg+xml" }]
  }
};

export const viewport: Viewport = {
  themeColor: "#09100f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <PwaRefresh />
        {children}
      </body>
    </html>
  );
}
