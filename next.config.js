/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  webpack: (config) => {
    // pdfjs-dist references the Node-only 'canvas' package as an optional
    // fallback; it's never actually used in the browser build, but webpack
    // still tries to resolve it. This tells webpack to skip it.
    config.resolve.alias.canvas = false;
    return config;
  },
};

module.exports = nextConfig;
