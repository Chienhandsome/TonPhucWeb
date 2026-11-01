import content from '@/data/public-content.json';
import {getPublishedPosts} from '@/lib/posts';
import {cache} from 'react';

export type ContentBlock = {type: string; text?: string; src?: string; rows?: string[][]};
export type Product = {slug: string; title: string; category: string; image: string | null; source: string; blocks: ContentBlock[]};
export type Category = {slug: string; title: string; children?: {slug: string; title: string}[]};
export type Article = {slug: string; title: string; image: string | null; excerpt: string; blocks: ContentBlock[]; href?: string};
// Explicit snapshot of public source content, independent of Supabase posts.
// This is not a fallback for database errors. Supabase errors remain visible.
export const products = content.products as Product[];
export const categories = content.categories as Category[];
export const contact = content.contact;
export const brand = {logo: content.logo, photo: content.hero};
export const aboutBlocks = content.about as ContentBlock[];
export function findCategory(slug: string) {
  for (const category of categories) {
    if (category.slug === slug) return {...category, parent: null};
    const child = category.children?.find(item => item.slug === slug);
    if (child) return {...child, children: [], parent: category};
  }
  return null;
}
export function productsInCategory(slug?: string) {
  if (!slug) return products;
  const category = findCategory(slug);
  if (!category) return [];
  if (!category.parent) return products.filter(product => product.category === slug);
  const term = category.title.match(/R\s?\d+[a-z]?/i)?.[0]?.replace(/\s/g, '').toLowerCase();
  return products.filter(product => product.category === category.parent.slug && (term ? product.title.toLowerCase().includes(term) : product.title.toLowerCase().includes(category.title.toLowerCase())));
}
export const getArticles = cache(async (): Promise<Article[]> => {
  const posts = await getPublishedPosts();
  const articles: Article[] = posts.map(post => ({slug: post.slug, title: post.title, image: post.cover_image, excerpt: post.excerpt || '', blocks: [{type: 'paragraph', text: post.content || post.excerpt || ''}], href: `/bai-viet/${post.slug}`}));
  const known = new Set(articles.map(article => article.slug));
  return [...articles, ...(content.articles as Article[]).filter(article => !known.has(article.slug))];
});
