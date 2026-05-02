const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  setupExitHandlers: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🛡️ Obligamos a Next.js a no abrir hilos extra que consuman RAM
  experimental: {
    workerThreads: false,
    cpus: 1
  },
  // 🛡️ Desactivamos los procesos que más memoria consumen en el build
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  swcMinify: false, 
  
  // 🛡️ Truco maestro: forzamos a Webpack a no fragmentar tanto el código
  webpack: (config) => {
    config.optimization.splitChunks = false;
    config.optimization.minimize = false; // Desactivamos la minificación pesada
    return config;
  },
};

module.exports = withPWA(nextConfig);