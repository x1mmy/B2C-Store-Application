import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'via.placeholder.com', // For placeholder images
      'randomuser.me', // For testimonial images
      'cyihruftnrlpdcjhochq.supabase.co', // The Supabase project URL
      'engageind.com', // Temporarily keep this until images are migrated
      'budofightgear.com.au' // Another external image source
    ],
  }
};

export default nextConfig;
