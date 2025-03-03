/** @type {import('next').NextConfig} */
const nextConfig = {
  // Добавляем внешние домены для изображений
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'instagram.fbeg2-1.fna.fbcdn.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.fbcdn.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.instagram.com',
        port: '',
        pathname: '/**',
      }
    ],
    unoptimized: false, // Оптимизируем изображения
  }
};

module.exports = nextConfig; 