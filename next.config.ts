
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
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
    // Ensure resolve and resolve.fallback objects exist
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
        ...(config.resolve.fallback || {}), // Keep existing fallbacks if any
        "child_process": false,
        "fs": false,
        "os": false,
        "path": false,
        "net": false,
        "tls": false,
        "stream": false,
        "crypto": false,
        "firebase-admin": false, 
        "@google-cloud/firestore": false,
      };
    }

    // Important: return the modified config
    return config;
  },
};

export default nextConfig;
