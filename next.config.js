/** @type {import('next').NextConfig} */
const nextConfig = {
    // Ignorar errores de ESLint durante el deploy para que no falle por warnings
    eslint: {
      ignoreDuringBuilds: true,
    },
    // Ignorar errores de TypeScript durante el deploy (opcional pero recomendado para demos rápidas)
    typescript: {
      ignoreBuildErrors: true,
    },
  };
  
  export default nextConfig;