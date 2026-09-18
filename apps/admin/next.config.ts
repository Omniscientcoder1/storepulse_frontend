import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // packages/ui and packages/api-client ship raw TS/TSX source (no build
  // step of their own), so Next has to transpile them as part of this app's
  // own compilation.
  transpilePackages: ["@storepulse/ui", "@storepulse/api-client"],
};

export default nextConfig;
