import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  basePath: "/backoffice",
  assetPrefix: "/backoffice",
  transpilePackages: ["@repo/ui"],
  reactCompiler: true,
};

export default nextConfig;
