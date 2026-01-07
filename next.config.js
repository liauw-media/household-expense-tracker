/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'household-expense-tracker.vercel.app'],
    },
  },
}

module.exports = nextConfig
