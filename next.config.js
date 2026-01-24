/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false, // Mantenemos esto para evitar el error de "addons disabled"
  images: {
    domains: [],
  },
};

module.exports = nextConfig;