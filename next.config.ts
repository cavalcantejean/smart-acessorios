
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
  webpack: (config, { isServer, dev }) => { // `dev` tells if it's in development mode
    console.log(`[Next.js Webpack Config] Running for: ${isServer ? 'server' : 'client'}, Dev: ${dev}`);
    if (!isServer) {
      console.log('[Next.js Webpack Config] Applying client-side fallbacks...');
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}), // Ensures we're spreading an object
        "child_process": false,
        "fs": false,
        "os": false,
        "path": false,
        "net": false,
        "tls": false,
      };
      console.log('[Next.js Webpack Config] Client fallbacks applied:', JSON.stringify(config.resolve.fallback));
    }
    // Important: return the modified config
    return config;
  },
};

export default nextConfig;
