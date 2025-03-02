/** @type {import('next').NextConfig} */
const nextConfig = {
  // Нам не нужны внешние домены, так как мы используем только локальные изображения
  images: {
    remotePatterns: [],
    unoptimized: false, // Оптимизируем изображения
  }
};

module.exports = nextConfig; 