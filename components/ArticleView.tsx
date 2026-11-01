import Link from 'next/link';
import {ArrowLeft, ArrowUpRight} from 'lucide-react';
import {getTranslations} from 'next-intl/server';
import type {Article} from '@/lib/catalog';
import ContentBlocks from '@/components/ContentBlocks';
import ContactBand from '@/components/ContactBand';

export default async function ArticleView({article}: {article:Article}) {
  const [t,n] = await Promise.all([getTranslations('News'),getTranslations('Nav')]);
  return <><article className="container article-layout section"><header className="article-header"><Link href="/tin-tuc" className="text-link"><ArrowLeft size={16}/>{t('back')}</Link><p className="eyebrow">{t('category')}</p><h1>{article.title}</h1>{article.excerpt && <p className="article-excerpt">{article.excerpt}</p>}</header><div className="article-body"><ContentBlocks blocks={article.blocks}/></div><div className="article-end"><span>TÔN PHÚC</span><Link href="/lien-he" className="text-link">{n('contact')}<ArrowUpRight size={17}/></Link></div></article><ContactBand/></>;
}
