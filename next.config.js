/** @type {import('next').NextConfig} */
const nextConfig = {
  env: { theme: "DEFAULT", currency: "USD" },
  publicRuntimeConfig: { theme: "DEFAULT", currency: "USD" },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "ui-lib.com" },
      { hostname: "localhost", port: "3000" },
      { hostname: "img.vietqr.io" },
    ],
  },
}

module.exports = nextConfig
