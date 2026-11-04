import content from '@/data/public-content.json';
import {getPublishedPosts} from '@/lib/posts';
import {cache} from 'react';
import {publicRecords,claimedPaths} from '@/lib/cms/public';

export type ContentBlock = {type: string; text?: string; src?: string; rows?: string[][]};
export type Product = {slug: string; title: string; category: string; image: string | null; source: string; blocks: ContentBlock[];price?:number|null;featured?:boolean};
export type Category = {slug: string; title: string; children?: {slug: string; title: string}[]};
export type Article = {slug: string; title: string; image: string | null; excerpt: string; blocks: ContentBlock[]; href?: string};
// Explicit snapshot of public source content, independent of Supabase posts.
// This is not a fallback for database errors. Supabase errors remain visible.
export const products = content.products as Product[];
export const categories = content.categories as Category[];
export const contact = content.contact;
export const brand = {logo: content.logo, photo: content.hero};
export const aboutBlocks = content.about as ContentBlock[];
export const getCatalog=cache(async()=>{
 const [rows,claimed]=await Promise.all([publicRecords(),claimedPaths()]);
 const cats=rows.filter(r=>r.kind==='product_category');
 const dbCategories:Category[]=cats.filter(r=>!r.data.parent_id).sort((a,b)=>(a.data.sort_order||0)-(b.data.sort_order||0)).map(r=>({slug:r.slug,title:r.title,children:cats.filter(c=>c.data.parent_id===r.id).map(c=>({slug:c.slug,title:c.title}))}));
 const combinedCategories=[...dbCategories,...categories.filter(c=>!claimed.has('/'+c.slug)).map(c=>({...c,children:c.children?.filter(child=>!claimed.has('/'+child.slug))}))];
 const dbProducts:Product[]=rows.filter(r=>r.kind==='product'&&cats.some(c=>c.id===r.data.category_id&&!c.data.parent_id)).sort((a,b)=>(a.data.sort_order||0)-(b.data.sort_order||0)).map(r=>({slug:r.slug,title:r.title,category:cats.find(c=>c.id===r.data.category_id)!.slug,image:r.data.image||null,source:'cms',blocks:r.data.blocks||[],price:r.data.price,featured:!!r.data.featured}));
 const combinedProducts=[...dbProducts,...products.filter(p=>!claimed.has('/'+p.slug))];
 const find=(slug:string)=>{for(const c of combinedCategories){if(c.slug===slug)return {...c,parent:null};const child=c.children?.find(x=>x.slug===slug);if(child)return {...child,children:[],parent:c};}return null;};
 const inCategory=(slug?:string)=>{if(!slug)return combinedProducts;const cat=find(slug);if(!cat)return [];if(!cat.parent)return combinedProducts.filter(p=>p.category===slug);const dbChild=cats.find(c=>c.slug===slug);if(dbChild){const ids=new Set(rows.filter(r=>r.kind==='product'&&r.data.secondary_category_id===dbChild.id).map(r=>r.slug));return combinedProducts.filter(p=>ids.has(p.slug));}return productsInCategory(slug);};
 return {products:combinedProducts,categories:combinedCategories,findCategory:find,productsInCategory:inCategory};
});
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
  const [cms,claimed]=await Promise.all([publicRecords(),claimedPaths()]);
  const posts = await getPublishedPosts();
  const articles: Article[] = posts.map(post => ({slug: post.slug, title: post.title, image: post.cover_image, excerpt: post.excerpt || '', blocks: [{type: 'paragraph', text: post.content || post.excerpt || ''}], href: `/bai-viet/${post.slug}`}));
  const known = new Set(articles.map(article => article.slug));
  const cmsArticles=cms.filter(r=>r.kind==='article').map(r=>({slug:r.slug,title:r.title,image:r.data.image||null,excerpt:r.data.excerpt||'',blocks:r.data.blocks||[],href:`/bai-viet/${r.slug}`}));
  return [...cmsArticles,...articles.filter(a=>!claimed.has('/bai-viet/'+a.slug)), ...(content.articles as Article[]).filter(article => !known.has(article.slug)&&!claimed.has('/'+article.slug)&&!cmsArticles.some(a=>a.slug===article.slug))];
});
