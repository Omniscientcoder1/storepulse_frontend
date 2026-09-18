import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

import { loadStorefrontData } from "@/lib/storefront-data";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

export async function generateMetadata(): Promise<Metadata> {
  const { info } = await loadStorefrontData();
  return {
    title: info.business_name,
    description: `Shop ${info.business_name} — powered by StorePulse.`,
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { info } = await loadStorefrontData();
  const primaryColor =
    typeof info.theme_config.primary_color === "string"
      ? info.theme_config.primary_color
      : "#2563eb";

  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable}`}
      style={{ "--storefront-primary": primaryColor } as React.CSSProperties}
    >
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
