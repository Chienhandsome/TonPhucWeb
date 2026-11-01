import {getTranslations} from 'next-intl/server';
import {getArticles} from '@/lib/catalog';
import PostCard from '@/components/PostCard';
import {pageMetadata} from '@/lib/seo';
export const metadata=pageMetadata({title:'Tin tức & kiến thức',description:'Tin tức và kiến thức về gas lạnh, vật tư điện lạnh tại Tôn Phúc. Đọc thông tin về các loại gas và ứng dụng trong ngành lạnh.',path:'/tin-tuc'});
export const dynamic = 'force-dynamic';
export default async function NewsPage() {
  const [t,articles]=await Promise.all([getTranslations('News'),getArticles()]);
  return <><h1 className="sr-only">{t('title')}</h1><section className="section container"><div className="news-grid">{articles.map(article=><PostCard key={article.slug} article={article}/>)}</div>{!articles.length&&<p className="empty-state">{t('empty')}</p>}</section></>;
}
