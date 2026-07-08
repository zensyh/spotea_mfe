import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@repo/ui', '@spotea/auth'],
  reactCompiler: true,
};

export default nextConfig;
