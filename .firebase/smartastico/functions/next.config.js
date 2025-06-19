"use strict";

// next.config.js
var nextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  experimental: {
    ppr: false
    // Explicitly disable Partial Prerendering
    // asyncWebAssembly: true, // Removed: Not a recognized option or handled differently now
  },
  images: {
    unoptimized: true,
    // Disable Image Optimization API for static export
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "app-files-v1.softr-files.com",
        port: "",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        port: "",
        pathname: "/**"
      }
    ]
  },
  webpack: (config, { isServer, webpack }) => {
    if (!config.experiments) {
      config.experiments = {};
    }
    config.experiments.asyncWebAssembly = true;
    if (!config.resolve) {
      config.resolve = {};
    }
    if (!config.resolve.fallback) {
      config.resolve.fallback = {};
    }
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback || {},
        "assert": false,
        "child_process": false,
        "crypto": false,
        "fs": false,
        "http": false,
        "https": false,
        "http2": false,
        "net": false,
        "os": false,
        "path": false,
        "stream": false,
        "tls": false,
        "url": false,
        "util": false,
        "zlib": false,
        // Specific libraries that are server-side only
        "firebase-admin": false,
        "@google-cloud/firestore": false,
        "genkit": false,
        "@genkit-ai/googleai": false,
        // Fallbacks for node: prefixed modules
        "node:events": false,
        "node:process": false,
        "node:stream": false,
        "events": false,
        "process": false,
        // Add fallbacks for firebase-admin dependencies if necessary
        "farmhash-modern": false,
        "@fastify/busboy": false,
        // Ensure other problematic modules from the error log have fallbacks
        "google-logging-utils": false,
        "gcp-metadata": false,
        // "google-auth-library": false, // Be cautious if client SDK also uses this
        "@google-cloud/storage": false
      };
    }
    return config;
  }
};
module.exports = nextConfig;
