
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
  webpack: (config, { isServer, webpack }) => {
    // Apply these fallbacks only to the client-side bundle
    if (!isServer) {
      if (!config.resolve) {
        config.resolve = {};
      }
      // Ensure client-side fallbacks for Node.js core modules
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        "child_process": false,
        "fs": false,
        "os": false,
        "path": false,
        "net": false,
        "tls": false,
        "stream": false,
        "crypto": false,
      };
    }

    // Important: return the modified config
    return config;
  },
};

export default nextConfig;
