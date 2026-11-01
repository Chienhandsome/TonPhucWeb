const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Ảnh bìa có thể nằm ở Supabase Storage hoặc domain cũ trong lúc chuyển nội dung.
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "tonphuc.com" },
    ],
  },
};

module.exports = withNextIntl(nextConfig);
