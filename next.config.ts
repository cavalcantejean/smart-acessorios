
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
        hostname: 'app-files-v1.softr-files.com', // Added this hostname
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com', // Placeholder for potential Firebase Storage use
        port: '',
        pathname: '/**',
      }
    ],
  },
  webpack: (config, { isServer }) => {
    // Apply these fallbacks only to the client-side bundle
    if (!isServer) {
      if (!config.resolve) {
        config.resolve = {};
      }
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}), // Spread existing fallbacks if any
        "child_process": false,
        "fs": false,
        "os": false,
        "path": false,
        "net": false,
        "tls": false,
        "stream": false, // Added common problematic module
        "crypto": false, // Added common problematic module
      };
    }
    // Important: return the modified config
    return config;
  },
};

export default nextConfig;
