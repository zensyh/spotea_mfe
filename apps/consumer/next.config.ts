import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  basePath: '/consumer',
  assetPrefix: '/consumer',
  transpilePackages: ['@repo/ui', '@repo/auth'],
  reactCompiler: true,
};

export default nextConfig;
