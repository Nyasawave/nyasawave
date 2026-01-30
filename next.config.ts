import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable static page data collection timeout
  staticPageGenerationTimeout: 10,
};

export default nextConfig;
