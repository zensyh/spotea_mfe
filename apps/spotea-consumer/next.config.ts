import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@repo/ui'],
  reactCompiler: true,
};

export default nextConfig;
