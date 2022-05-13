const {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
} = require("next/constants");

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
//   env: {
//     API_URL: "http://localhost:3000",
//   },
// };

// module.exports = nextConfig;

// /** @type {import('next').NextConfig} */
module.exports = (phase) => {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;
  const env = {
    API_URL: isDev
      ? "http://localhost:3000"
      : "https://food-days-api.bjarke.xyz",
  };
  return {
    reactStrictMode: true,
    env,
  };
};
