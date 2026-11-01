import {notFound} from 'next/navigation';
import {getTranslations} from 'next-intl/server';
import {getCategories,getPublishedPosts} from '@/lib/posts';
import PageIntro from '@/components/PageIntro';
import PostCard from '@/components/PostCard';
import {pageMetadata} from '@/lib/seo';
export async function generateMetadata({params}:{params:{slug:string}}){
  const category=(await getCategories()).find(item=>item.slug===params.slug);
  return pageMetadata({title:category?.name||'Không tìm thấy chuyên mục',description:category?`Các bài viết thuộc chuyên mục ${category.name} trên website Tôn Phúc.`:'Chuyên mục không tồn tại.',path:`/chuyen-muc/${params.slug}`,noindex:!category});
}
export default async function CategoryPage({params}:{params:{slug:string}}){
  const [categories,posts,t]=await Promise.all([getCategories(),getPublishedPosts(),getTranslations('News')]);
  const category=categories.find(item=>item.slug===params.slug);if(!category)notFound();
  const filtered=posts.filter(post=>post.category_slug===params.slug);
  return <><PageIntro title={category.name} eyebrow={t('eyebrow')}/><section className="container section">{filtered.length?<div className="news-grid">{filtered.map(post=><PostCard key={post.slug} post={post}/>)}</div>:<p className="empty-state">{t('empty')}</p>}</section></>;
}
