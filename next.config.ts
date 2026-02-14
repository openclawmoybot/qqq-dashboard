import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // GitHub Pages usually serves at /repo-name/
  basePath: process.env.NODE_ENV === 'production' ? '/qqq-dashboard' : '',
};

export default nextConfig;
