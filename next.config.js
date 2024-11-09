const withNextIntl = require('next-intl/plugin')('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/en', // or whichever locale you want as default
        permanent: true,
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig); 