import {notFound} from 'next/navigation';
import {getTranslations} from 'next-intl/server';
import {getCategories,getPublishedPosts} from '@/lib/posts';
import PageIntro from '@/components/PageIntro';
import PostCard from '@/components/PostCard';
import {pageMetadata} from '@/lib/seo';
import {publicRecord,publicRecords} from '@/lib/cms/public';
import {cmsMetadata} from '@/lib/cms/metadata';
import Link from 'next/link';
export async function generateMetadata({params}:{params:{slug:string}}){
  const cms=await cmsMetadata('article_category',params.slug,`/chuyen-muc/${params.slug}`);if(cms)return cms;
  const [categories,posts]=await Promise.all([getCategories(),getPublishedPosts()]);
  const category=categories.find(item=>item.slug===params.slug);
  return pageMetadata({title:category?.name||'Không tìm thấy chuyên mục',description:category?`Các bài viết thuộc chuyên mục ${category.name} trên website Tôn Phúc.`:'Chuyên mục không tồn tại.',path:`/chuyen-muc/${params.slug}`,noindex:!category||!posts.some(post=>post.category_slug===params.slug)});
}
export default async function CategoryPage({params}:{params:{slug:string}}){
  const cms=await publicRecord('article_category',params.slug);if(cms){const articles=(await publicRecords()).filter(r=>r.kind==='article'&&r.data.category_id===cms.id);return <section className="container section"><h1>{cms.title}</h1>{articles.map(r=><p key={r.id}><Link href={`/bai-viet/${r.slug}`}>{r.title}</Link></p>)}{!articles.length&&<p>Chưa có bài viết.</p>}</section>;}
  const [categories,posts,t]=await Promise.all([getCategories(),getPublishedPosts(),getTranslations('News')]);
  const category=categories.find(item=>item.slug===params.slug);if(!category)notFound();
  const filtered=posts.filter(post=>post.category_slug===params.slug);
  return <><PageIntro title={category.name} eyebrow={t('eyebrow')}/><section className="container section">{filtered.length?<div className="news-grid">{filtered.map(post=><PostCard key={post.slug} post={post}/>)}</div>:<p className="empty-state">{t('empty')}</p>}</section></>;
}
