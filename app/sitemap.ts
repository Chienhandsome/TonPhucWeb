import type {MetadataRoute} from 'next';
import {getCatalog, getArticles} from '@/lib/catalog';
import {getCategories, getPublishedPosts} from '@/lib/posts';
import {absoluteUrl} from '@/lib/seo';
import {publicRecords} from '@/lib/cms/public';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const {categories,products,productsInCategory}=await getCatalog();
  const [articles, postCategories, posts] = await Promise.all([getArticles(), getCategories(), getPublishedPosts()]);
  const cms=await publicRecords();
  const paths = [
    '/', '/gioi-thieu', '/san-pham', '/tin-tuc', '/lien-he',
    ...categories.flatMap(category => [
      ...(productsInCategory(category.slug).length ? [`/${category.slug}`] : []),
      ...(category.children || []).filter(child=>productsInCategory(child.slug).length>0).map(child => `/${child.slug}`),
    ]),
    ...products.map(product => `/${product.slug}`),
    ...articles.map(article => article.href || `/${article.slug}`),
    ...postCategories.filter(category=>posts.some(post=>post.category_slug===category.slug)).map(category => `/chuyen-muc/${category.slug}`),
    ...cms.filter(r=>r.kind==='article_category'&&cms.some(a=>a.kind==='article'&&a.data.category_id===r.id)).map(r=>`/chuyen-muc/${r.slug}`),
    ...cms.filter(r=>r.kind==='tag'&&cms.some(p=>p.kind==='product'&&(p.data.tag_ids||[]).includes(r.id))).map(r=>`/tag/${r.slug}`),
  ];
  return Array.from(new Set(paths)).map(path => ({url: absoluteUrl(path)}));
}
