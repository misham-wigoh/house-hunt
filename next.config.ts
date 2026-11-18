import type { NextConfig } from "next";

// Images uploaded to the WordPress media library are served from the same
// host as the GraphQL endpoint, so derive the allowed host from that URL.
const wordpressUrl = process.env.WORDPRESS_GRAPHQL_URL;
const wordpressHost = wordpressUrl ? new URL(wordpressUrl) : null;

const nextConfig: NextConfig = {
  output: "standalone",
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86400,
    remotePatterns: wordpressHost
      ? [
          {
            protocol: wordpressHost.protocol.replace(":", "") as "http" | "https",
            hostname: wordpressHost.hostname,
            port: wordpressHost.port,
            pathname: "/wp-content/uploads/**",
          },
        ]
      : [],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
