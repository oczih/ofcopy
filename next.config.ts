import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      "creatorhubbucket.s3.eu-north-1.amazonaws.com",
      "images.unsplash.com",
      "lh3.googleusercontent.com"
    ],
  },
};

export default nextConfig;
