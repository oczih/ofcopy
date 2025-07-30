import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "creatorhubbucket.s3.eu-north-1.amazonaws.com", // <- add this
      "images.unsplash.com",
      "lh3.googleusercontent.com"
    ],
  },
};

export default nextConfig;
