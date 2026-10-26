import type { NextConfig } from "next";

const config: NextConfig = {
  transpilePackages: ["@assessment/core", "@assessment/api-types"],
};

export default config;
