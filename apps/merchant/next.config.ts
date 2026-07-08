import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  basePath: '/merchant',
  assetPrefix: '/merchant',
  transpilePackages: ['@repo/ui', '@spotea/auth'],
  reactCompiler: true,
};

export default nextConfig;
