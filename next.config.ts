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
        destination: "/works/personal/urban-courts",
        permanent: true,
      },
      {
        source: "/locke",
        destination: "/works",
        permanent: true,
      },
      {
        source: "/dustin",
        destination: "/works/portrait/dustin",
        permanent: true,
      },
      {
        source: "/figma",
        destination: "/works/portrait/figma",
        permanent: true,
      },
      {
        source: "/figma-2023",
        destination: "/works/portrait/figma-2023",
        permanent: true,
      },
      {
        source: "/works/the-bridge-reconstructed",
        destination: "/works/personal/the-bridge-reconstructed",
        permanent: true,
      },
      {
        source: "/works/urban-courts",
        destination: "/works/personal/urban-courts",
        permanent: true,
      },
      {
        source: "/works/desolate-sands",
        destination: "/works/personal/desolate-sands",
        permanent: true,
      },
      {
        source: "/works/locke",
        destination: "/works",
        permanent: true,
      },
      {
        source: "/works/portraits",
        destination: "/works/portrait/portraits",
        permanent: true,
      },
      {
        source: "/works/dustin",
        destination: "/works/portrait/dustin",
        permanent: true,
      },
      {
        source: "/works/figma",
        destination: "/works/portrait/figma",
        permanent: true,
      },
      {
        source: "/works/figma-2023",
        destination: "/works/portrait/figma-2023",
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
