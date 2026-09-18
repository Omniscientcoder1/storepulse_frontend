import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @storepulse/api-client and each @storepulse/theme-* package ship raw TS
  // source (no build step of their own), so Next has to transpile them as
  // part of this app's own compilation — same reasoning as apps/admin and
  // apps/mother for api-client. Add new theme packages here as they're
  // registered in lib/theme-registry.ts.
  transpilePackages: [
    "@storepulse/api-client",
    "@storepulse/theme-electronics",
    "@storepulse/theme-fashion",
  ],
};

export default nextConfig;
