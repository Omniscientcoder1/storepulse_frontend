import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @storepulse/api-client ships raw TS source (no build step of its own), so
  // Next has to transpile it as part of this app's own compilation — same
  // reasoning as apps/admin and apps/mother.
  transpilePackages: ["@storepulse/api-client"],
};

export default nextConfig;
