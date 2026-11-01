import {getTranslations} from 'next-intl/server';
import {getArticles} from '@/lib/catalog';
import PageIntro from '@/components/PageIntro';
import PostCard from '@/components/PostCard';
export const metadata={title:'Tin tức & kiến thức',alternates:{canonical:'/tin-tuc'}};
export const dynamic = 'force-dynamic';
export default async function NewsPage() {
  const [t,articles]=await Promise.all([getTranslations('News'),getArticles()]);
  return <><PageIntro title={t('title')} eyebrow={t('eyebrow')}/><section className="section container"><div className="news-grid">{articles.map(article=><PostCard key={article.slug} article={article}/>)}</div>{!articles.length&&<p className="empty-state">{t('empty')}</p>}</section></>;
}
