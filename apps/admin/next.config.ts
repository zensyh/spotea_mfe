import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  basePath: '/admin',
  assetPrefix: '/admin',
  transpilePackages: ['@repo/ui'],
  reactCompiler: true,
};

export default nextConfig;
