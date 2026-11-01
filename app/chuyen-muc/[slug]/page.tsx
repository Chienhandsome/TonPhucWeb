import {notFound} from 'next/navigation';
import {getTranslations} from 'next-intl/server';
import {getCategories,getPublishedPosts} from '@/lib/posts';
import PageIntro from '@/components/PageIntro';
import PostCard from '@/components/PostCard';
export default async function CategoryPage({params}:{params:{slug:string}}){
  const [categories,posts,t]=await Promise.all([getCategories(),getPublishedPosts(),getTranslations('News')]);
  const category=categories.find(item=>item.slug===params.slug);if(!category)notFound();
  const filtered=posts.filter(post=>post.category_slug===params.slug);
  return <><PageIntro title={category.name} eyebrow={t('eyebrow')}/><section className="container section">{filtered.length?<div className="news-grid">{filtered.map(post=><PostCard key={post.slug} post={post}/>)}</div>:<p className="empty-state">{t('empty')}</p>}</section></>;
}