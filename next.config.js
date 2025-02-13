/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Handle GLB files
    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      type: 'asset/resource'
    });

    // Handle Three.js imports
    config.module.rules.push({
      test: /three[\/\\]examples[\/\\].*\.js$/,
      use: 'babel-loader'
    });

    // Prevent server-side loading of Three.js
    if (isServer) {
      config.module.rules.push({
        test: /three/,
        use: 'null-loader'
      });
    }

    // Fix for ES modules
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx']
    };

    return config;
  },
  // Disable strict mode temporarily while debugging
  reactStrictMode: false,
  // Configure image domains if needed
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'urguvlckmcehdiibsiwf.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Add transpilePackages for Three.js
  transpilePackages: ['three']
}

module.exports = nextConfig 