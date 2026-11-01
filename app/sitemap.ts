import type {MetadataRoute} from 'next';
import {categories, getArticles, products, productsInCategory} from '@/lib/catalog';
import {getCategories, getPublishedPosts} from '@/lib/posts';
import {absoluteUrl} from '@/lib/seo';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, postCategories, posts] = await Promise.all([getArticles(), getCategories(), getPublishedPosts()]);
  const paths = [
    '/', '/gioi-thieu', '/san-pham', '/tin-tuc', '/lien-he',
    ...categories.flatMap(category => [
      ...(productsInCategory(category.slug).length ? [`/${category.slug}`] : []),
      ...(category.children || []).filter(child=>productsInCategory(child.slug).length>0).map(child => `/${child.slug}`),
    ]),
    ...products.map(product => `/${product.slug}`),
    ...articles.map(article => article.href || `/${article.slug}`),
    ...postCategories.filter(category=>posts.some(post=>post.category_slug===category.slug)).map(category => `/chuyen-muc/${category.slug}`),
  ];
  return Array.from(new Set(paths)).map(path => ({url: absoluteUrl(path)}));
}
