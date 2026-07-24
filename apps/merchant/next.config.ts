import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  basePath: '/merchant',
  assetPrefix: '/merchant',
  transpilePackages: ['@repo/ui', '@repo/auth'],
  reactCompiler: true,
};

export default nextConfig;
