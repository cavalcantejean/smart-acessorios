/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    ppr: false, // Explicitly disable Partial Prerendering
    // asyncWebAssembly: true, // Removed: Not a recognized option or handled differently now
  },
  images: {
    unoptimized: true, // Disable Image Optimization API for static export
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
  webpack: (config, { isServer, webpack }) => { // Add webpack to params if needed for version checks or specific plugins, though not strictly for experiments
  // Initialize experiments if it doesn't exist
  if (!config.experiments) {
    config.experiments = {};
  }

  // Enable WebAssembly experiments
  config.experiments.asyncWebAssembly = true;
  // For older Webpack 5 versions, layers was also needed for some WASM setups,
  // but asyncWebAssembly is the primary flag. Next.js might handle layers internally.
  // config.experiments.layers = true;

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
        "@google-cloud/storage": false,
      };
    }

    // Important: return the modified config
    return config;
  },
};

module.exports = nextConfig;
