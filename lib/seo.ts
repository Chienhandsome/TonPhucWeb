import type {Metadata} from 'next';

const configuredUrl = new URL(process.env.SITE_URL || 'https://tonphuc.com');
if (!['https:', 'http:'].includes(configuredUrl.protocol)) throw new Error('SITE_URL must be an HTTP(S) URL');
export const SITE_URL = configuredUrl.origin;
export const SITE_NAME = 'Tôn Phúc';
export const DEFAULT_TITLE = 'Gas Lạnh Tôn Phúc — Vật tư điện lạnh TP.HCM';
export const DEFAULT_DESCRIPTION = 'Gas lạnh, ống đồng, block máy nén và vật tư điện lạnh Tôn Phúc. 25A Tân Kỳ Tân Quý, TP.HCM. Hotline 0903.863.797.';

// Fail closed. Production builds are also used for previews, so NODE_ENV alone is insufficient.
export function isIndexingAllowed(): boolean {
  return process.env.SEO_ALLOW_INDEXING === 'true'
    && process.env.NODE_ENV === 'production'
    && (!process.env.VERCEL_ENV || process.env.VERCEL_ENV === 'production')
    && configuredUrl.protocol === 'https:'
    && ['tonphuc.com', 'www.tonphuc.com'].includes(configuredUrl.hostname);
}

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).href;
}

export function imageUrl(value?: string | null): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value, SITE_URL);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : undefined;
  } catch { return undefined; }
}

export function summarize(value: string, limit = 165): string {
  const text = value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (text.length <= limit) return text;
  const start = text.slice(0, limit - 1);
  const boundary = start.lastIndexOf(' ');
  return start.slice(0, boundary > limit * .65 ? boundary : start.length).trimEnd() + '…';
}

type PageMetadata = {title: string; description: string; path: string; image?: string | null; type?: 'website' | 'article'; noindex?: boolean};

export function pageMetadata({title, description, path, image, type = 'website', noindex = false}: PageMetadata): Metadata {
  const canIndex = isIndexingAllowed() && !noindex;
  const canonical = absoluteUrl(path);
  const summary = summarize(description || title);
  const shareTitle = title === DEFAULT_TITLE ? title : `${title} | ${SITE_NAME}`;
  const shareImage = imageUrl(image) || absoluteUrl('/share-image');
  return {
    title,
    description: summary,
    alternates: {canonical},
    robots: {index: canIndex, follow: true, googleBot: {index: canIndex, follow: true, 'max-image-preview': 'large', 'max-snippet': -1}},
    openGraph: {type, locale: 'vi_VN', siteName: SITE_NAME, title: shareTitle, description: summary, url: canonical, images: [{url: shareImage, alt: title}]},
    twitter: {card: 'summary_large_image', title: shareTitle, description: summary, images: [shareImage]},
  };
}

export function catalogMetadata({title, path, count, query, page}: {title: string; path: string; count: number; query?: string; page?: string}): Metadata {
  const q = typeof query === 'string' ? query.trim() : '';
  const total = Math.max(1, Math.ceil(count / 12));
  const current = Math.min(total, Math.max(1, Number.parseInt(page || '1', 10) || 1));
  return pageMetadata({
    title: q ? `Tìm sản phẩm: ${q}` : current > 1 ? `${title} — Trang ${current}` : title,
    description: q ? `Tìm kiếm “${q}” trong danh mục sản phẩm Tôn Phúc.` : `${title} tại Tôn Phúc. Xem hình ảnh, thông tin sản phẩm và liên hệ tư vấn qua hotline 0903.863.797.${current > 1 ? ` Trang ${current}.` : ''}`,
    path: current > 1 && !q ? `${path}?page=${current}` : path,
    noindex: Boolean(q) || count === 0,
  });
}
