/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true
  },
  experimental: {
    // optimizeCss: true, (Removed to fix critters dependency build error)
  },
};

export default nextConfig;
