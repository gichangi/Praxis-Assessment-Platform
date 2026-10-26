/** @type {import('next').NextConfig} */
const { PHASE_DEVELOPMENT_SERVER } = require("next/constants");

module.exports = (phase) => {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;
  return {
    experimental: { serverComponentsExternalPackages: [] },
    distDir: isDev ? ".next" : ".next-production",
    // Emit a self-contained server bundle for Docker.
    output: isDev ? undefined : "standalone",
  };
};
