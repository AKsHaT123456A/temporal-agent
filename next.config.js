/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@temporalio/client']
  }
}

module.exports = nextConfig