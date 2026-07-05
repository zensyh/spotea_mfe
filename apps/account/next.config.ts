import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  basePath: '/account',
  assetPrefix: '/account',
  transpilePackages: ['@repo/ui'],
  reactCompiler: true,
};

export default nextConfig;
