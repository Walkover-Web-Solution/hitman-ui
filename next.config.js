// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
console.log(process.env.NEXT_PUBLIC_UI_URL, '123456')
module.exports = withBundleAnalyzer({
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  assetPrefix: process.env.NEXT_PUBLIC_UI_URL,
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
});