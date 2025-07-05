const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  // ... your existing next.config.ts content goes here
  // This is a wrapper for analyzing bundle size
};

module.exports = withBundleAnalyzer(nextConfig);
