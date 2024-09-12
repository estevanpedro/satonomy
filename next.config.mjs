import path from "path"
import { fileURLToPath } from "url"

// Polyfill __dirname for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    dirs: ["app"],
  },
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ordinals.com",
        port: "",
        pathname: "/content/**",
      },
      {
        protocol: "https",
        hostname: "ordin.s3.amazonaws.com",
        port: "",
        pathname: "/inscriptions/**",
      },
    ],
  },
  webpack(config) {
    // Grab the existing rule that handles SVG imports
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.(".svg")
    )

    config.module.rules.push(
      // Reapply the existing rule, but only for svg imports ending in ?url
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      // Convert all other *.svg imports to React components
      {
        test: /\.svg$/i,
        issuer: { not: /\.(css|scss|sass)$/ },
        resourceQuery: { not: /url/ }, // exclude if *.svg?url
        loader: "@svgr/webpack",
        options: {
          dimensions: false,
          titleProp: true,
        },
      }
    )

    // Modify the file loader rule to ignore *.svg, since we have it handled now.
    fileLoaderRule.exclude = /\.svg$/i

    config.resolve.alias = {
      ...config.resolve.alias,
      "bitcore-lib": path.resolve(__dirname, "lib/customBitcore.ts"),
    }
    return config
  },
}

export default nextConfig
