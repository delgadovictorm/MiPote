const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Desactivamos esto para aliviar el build
  swcMinify: false, // 🛠️ PASO CLAVE: Desactivamos el minificador SWC que causa el WorkerError
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    // Forzamos a que no use demasiados hilos de CPU
    workerThreads: false,
    cpus: 1
  },
  webpack: (config) => {
    config.optimization.minimize = true;
    return config;
  },
};

module.exports = withPWA(nextConfig);