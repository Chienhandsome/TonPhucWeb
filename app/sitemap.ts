import type {MetadataRoute} from 'next';
import {categories, getArticles, products} from '@/lib/catalog';
import {getCategories} from '@/lib/posts';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, postCategories] = await Promise.all([getArticles(), getCategories()]);
  const paths = [
    '/', '/gioi-thieu', '/san-pham', '/tin-tuc', '/lien-he',
    ...categories.flatMap(category => [
      `/${category.slug}`,
      ...(category.children || []).map(child => `/${child.slug}`),
    ]),
    ...products.map(product => `/${product.slug}`),
    ...articles.map(article => article.href || `/${article.slug}`),
    ...postCategories.map(category => `/chuyen-muc/${category.slug}`),
  ];
  return Array.from(new Set(paths)).map(path => ({url: new URL(path, 'https://tonphuc.com').href}));
}
