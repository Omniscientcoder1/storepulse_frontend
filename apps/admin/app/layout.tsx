import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StorePulse Admin",
  description: "StorePulse admin dashboard — orders, products, customers, and settings.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
