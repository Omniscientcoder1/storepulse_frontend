import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";

import { SiteHeader } from "@storepulse/ui/components/site-header";
import { SiteFooter } from "@storepulse/ui/components/site-footer";

import "./globals.css";

const displaySans = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display-sans",
});

const bodySans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body-sans",
});

const siteUrl = "https://storepulse.com";
const title = "StorePulse — Turn your WhatsApp & Facebook DMs into a real online store";
const description =
  "StorePulse gives Bangladeshi small businesses a branded storefront, an order dashboard, and a unified WhatsApp/Messenger inbox — built around how you already sell.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s — StorePulse",
  },
  description,
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: "StorePulse",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL ?? "https://app.storepulse.com";
const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
const whatsappUrl = whatsappNumber ? `https://wa.me/${whatsappNumber}` : "https://wa.me/";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${displaySans.variable} ${bodySans.variable}`}>
      <body className="font-body bg-background text-foreground antialiased">
        <SiteHeader adminUrl={adminUrl} />
        {children}
        <SiteFooter whatsappUrl={whatsappUrl} />
      </body>
    </html>
  );
}
