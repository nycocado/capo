import type { NextConfig } from 'next';
import path from 'path';

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

const nextConfig: NextConfig = {
  sassOptions: {
    includePaths: [path.join(__dirname, 'node_modules')],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
