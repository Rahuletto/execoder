/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  swcMinify: true,
  reactStrictMode: true,
  compress: true,
  webpack: (config) => {
    config.experiments = {
      topLevelAwait: true,
      layers: true,
    };
    config.resolve.fallback = {

      // if you miss it, all the other options in fallback, specified
      // by next.js will be dropped.
      ...config.resolve.fallback,  

      fs: false, // the solution
    };
    return config;
  },
  async redirects() {
    return [
      {
        source: "/codeboard",
        destination: "https://codeboard.tech",
        permanent: true,
      },
      {
        source: '/discord',
        destination: 'https://discord.gg/3JzDV9T5Fn',
        permanent: true,
      },
      {
        source: '/email',
        destination: 'mailto:support@codeboard.tech',
        permanent: true,
      },
      {
        source: '/support',
        destination: 'https://discord.gg/3JzDV9T5Fn',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
