import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.squarespace-cdn.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/projects",
        destination: "/works",
        permanent: true,
      },
      {
        source: "/urban-courts",
        destination: "/works/urban-courts",
        permanent: true,
      },
      {
        source: "/dustin",
        destination: "/works/dustin",
        permanent: true,
      },
      {
        source: "/figma",
        destination: "/works/figma",
        permanent: true,
      },
      {
        source: "/figma-2023",
        destination: "/works/figma-2023",
        permanent: true,
      },
      {
        source: "/shop",
        destination: "/works",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
