/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { serverComponentsExternalPackages: [] },
};

const { PHASE_DEVELOPMENT_SERVER } = require("next/constants");

module.exports = (phase) => ({
  ...nextConfig,
  // Keep the production preview separate from a running development server.
  distDir: phase === PHASE_DEVELOPMENT_SERVER ? ".next" : ".next-production",
});
