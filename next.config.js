const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');
const {PHASE_DEVELOPMENT_SERVER} = require('next/constants');
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

module.exports = phase => withNextIntl({
  ...nextConfig,
  // Keep a running dev server from replacing production chunks during verification.
  distDir: phase === PHASE_DEVELOPMENT_SERVER ? '.next-dev' : '.next',
});
