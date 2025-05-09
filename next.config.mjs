// @ts-check

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      "brandfetch.com",
      "example.com",
      "images.unsplash.com",
      "firebasestorage.googleapis.com",
      "storage.googleapis.com",
      "lh3.googleusercontent.com",
      "avatars.githubusercontent.com",
      "s3.amazonaws.com",
      "via.placeholder.com",
      "picsum.photos",
      "supabase.co",
    ],
  },
  experimental: {
    serverComponentsExternalPackages: [],
  },
};

export default nextConfig;
