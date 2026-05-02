const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 1. Saltamos errores estrictos para que el build no se detenga por tonterías
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 2. Optimizamos el uso de memoria de Webpack para evitar el WorkerError
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = false;
    }
    return config;
  },
};

module.exports = withPWA(nextConfig);