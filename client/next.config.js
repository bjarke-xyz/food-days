const {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
} = require("next/constants");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Kept around for auto complete type helping
};

module.exports = (phase) => {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;
  const env = {
    API_URL: isDev
      ? "http://localhost:8787"
      : "https://food-days-api.bjarke.xyz",
  };
  return {
    reactStrictMode: true,
    env,
    images: {
      loader: "imgix",
      path: "https://noop/",
    },
  };
};
