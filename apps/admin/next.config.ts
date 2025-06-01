import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      'via.placeholder.com', // For placeholder images
      'randomuser.me',
      'cyihruftnrlpdcjhochq.supabase.co', // The Supabase project URL
      'engageind.com',
      'budofightgear.com.au',
      'boxraw.com' // For boxraw product images
    ],
  }
};

export default nextConfig;
