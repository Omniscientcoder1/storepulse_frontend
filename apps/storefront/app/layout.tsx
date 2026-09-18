import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

import { loadStorefrontData } from "@/lib/storefront-data";
import { getResolvedTenantId } from "@/lib/tenant";

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

/**
 * `middleware.ts`'s matcher excludes `/store-unavailable` and
 * `/store-suspended` (rewriting to them would otherwise re-enter tenant
 * resolution), so those two routes never receive the resolved-tenant header
 * — the only case where that's true for a real request. Metadata/theming
 * there must not fall back to demo tenant content (that would show an
 * unrelated business's name on a generic "store unavailable" page); a
 * genuinely tenant-less generic title is used instead.
 */
async function loadLayoutContext() {
  const hasResolvedTenant = (await getResolvedTenantId()) !== null;
  if (!hasResolvedTenant) return null;
  return loadStorefrontData();
}

export async function generateMetadata(): Promise<Metadata> {
  const context = await loadLayoutContext();
  if (!context) {
    return { title: "StorePulse", description: "Powered by StorePulse." };
  }
  const { info } = context;
  return {
    title: info.business_name,
    description: `Shop ${info.business_name} — powered by StorePulse.`,
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const context = await loadLayoutContext();
  const primaryColor =
    typeof context?.info.theme_config.primary_color === "string"
      ? context.info.theme_config.primary_color
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
