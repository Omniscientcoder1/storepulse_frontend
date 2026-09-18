import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StorePulse",
  description: "Multi-tenant e-commerce storefronts for Bangladeshi small businesses.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
