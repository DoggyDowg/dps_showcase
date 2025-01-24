/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    // SVG handling
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    })

    return config
  },
  images: {
    domains: [
      'urguvlckmcehdiibsiwf.supabase.co'
    ],
  },
}

module.exports = nextConfig 