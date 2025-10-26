/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    css: true,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.css$/i,
      use: ['postcss-loader'],
    });
    return config;
  },
};

export default nextConfig;
