const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development', // Solo se activa en producción
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Aquí pones otras configuraciones si tenías (como env vars)
};

module.exports = withPWA(nextConfig);