import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 reactStrictMode: true, // Optional, keep if you have it
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://spss.io.vn/api/:path*',
      },
    ];
  },
};

export default nextConfig;
