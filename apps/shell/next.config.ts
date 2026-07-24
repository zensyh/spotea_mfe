import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@repo/ui', '@repo/auth'],
  reactCompiler: true,
};

export default nextConfig;
