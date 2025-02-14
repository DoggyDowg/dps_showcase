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

    // Handle PDF.js worker
    config.resolve.alias.canvas = false;
    
    if (isServer) {
      config.module.rules.push({
        test: /pdf\.js$/,
        use: 'null-loader'
      });
    }

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
  // Add transpilePackages for Three.js and PDF.js
  transpilePackages: ['three', 'pdfjs-dist']
}

module.exports = nextConfig 