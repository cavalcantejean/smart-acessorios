/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    ppr: false, // Explicitly disable Partial Prerendering
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'app-files-v1.softr-files.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
  webpack: (config, { isServer }) => {
    if (!config.resolve) {
      config.resolve = {};
    }
    if (!config.resolve.fallback) {
      config.resolve.fallback = {};
    }

    if (!isServer) {
      // For client-side bundle, provide fallbacks for Node.js core modules
      // and problematic server-side only libraries.
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        "assert": false,
        "child_process": false,
        "crypto": false,
        "fs": false,
        "http": false,
        "https": false, // Corrected from "httpss"
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
      };
    }

    // Important: return the modified config
    return config;
  },
};

module.exports = nextConfig;
